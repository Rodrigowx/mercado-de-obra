import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChatService } from './chat.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ChatGateway');
  private activeUsers = new Map<number, Socket>();

  constructor(private chatService: ChatService) {}

  handleConnection(socket: Socket) {
    const userId = Number(socket.handshake.query.userId);
    if (!userId) {
      this.logger.error(`User ID não informado no handshake: ${socket.id}`);
      socket.disconnect();
      return;
    }

    // Se já existir uma conexão para este usuário, desconecta a anterior
    if (this.activeUsers.has(userId)) {
      const existingSocket = this.activeUsers.get(userId);
      this.logger.log(
        `Usuário ${userId} já conectado. Desconectando socket antigo: ${existingSocket.id}`,
      );
      existingSocket.disconnect();
    }

    // Adiciona o novo socket no mapa
    this.activeUsers.set(userId, socket);
    this.logger.log(`Socket conectado: ${socket.id} para o usuário: ${userId}`);
  }

  handleDisconnect(socket: Socket) {
    const userId = Number(socket.handshake.query.userId);
    if (this.activeUsers.get(userId)?.id === socket.id) {
      this.activeUsers.delete(userId);
    }
    this.logger.log(
      `Socket desconectado: ${socket.id} para o usuário: ${userId}`,
    );
  }

  @SubscribeMessage('typingStart')
  handleTypingStart(
    @MessageBody() data: { conversationId: string; userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    // Envia para todos na conversa exceto o próprio usuário
    client.to(`conversation_${data.conversationId}`).emit('typingStart', {
      userId: data.userId,
      conversationId: data.conversationId,
    });
  }

  @SubscribeMessage('typingStop')
  handleTypingStop(
    @MessageBody() data: { conversationId: string; userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(`conversation_${data.conversationId}`).emit('typingStop', {
      userId: data.userId,
      conversationId: data.conversationId,
    });
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    data: {
      conversationId: string;
      senderId: string;
      content: string;
      attachments?: string[];
    },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.chatService.createMessage(
      data.conversationId,
      data.senderId,
      data.content,
      data.attachments,
    );

    // Emitir mensagem para a sala da conversa
    this.server
      .in(`conversation_${data.conversationId}`)
      .emit('messageReceived', message);

    // Atualizar notificações para o destinatário
    const conversation = await this.chatService.getConversation(
      data.conversationId,
    );
    const recipientId =
      message.senderId === conversation.clientId
        ? conversation.professionalId
        : conversation.clientId;

    const unreadCount = await this.chatService.getUnreadMessageCount(
      data.conversationId,
      recipientId,
    );

    // Emitir atualização apenas para o destinatário
    this.server
      .to(`notification_${recipientId}`)
      .emit('notifications', { [data.conversationId]: unreadCount });
    this.server.to(`notification_${recipientId}`).emit('newClientConversation');
    this.server
      .to(`conversation_${data.conversationId}`)
      .emit('newClientConversation');

    return message;
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: { conversationId: string; userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    // 1. Marca as mensagens como lidas
    await this.chatService.markMessagesAsRead(data.conversationId, data.userId);

    // 2. Atualiza a UI para todos na conversa (mantendo sua funcionalidade original)
    this.server
      .in(`conversation_${data.conversationId}`)
      .emit('messagesMarkedAsRead', {
        conversationId: data.conversationId,
        userId: data.userId,
      });

    // 3. Atualiza as notificações apenas para o usuário específico (nova funcionalidade)
    const updatedCount = await this.chatService.getUnreadMessageCount(
      data.conversationId,
      data.userId,
    );

    this.server
      .to(`notification_${data.userId}`)
      .emit('notifications', { [data.conversationId]: updatedCount });

    return { success: true };
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @MessageBody() data: { conversationId: string; userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    // Verifica se o conversationId é válido
    if (!data.conversationId || data.conversationId.trim() === '') {
      client.emit('error', { message: 'Invalid conversation ID' });
      return; // Retorna sem fazer nada se o conversationId for inválido
    }

    try {
      // Conecta o usuário à sala da conversa
      client.join(`conversation_${data.conversationId}`);
      this.logger.log(
        `conversation_ connected: ${data.userId}, ${data.conversationId}`,
      );

      // Marca todas as mensagens como lidas quando o usuário entra na conversa
      await this.chatService.markMessagesAsRead(
        data.conversationId,
        data.userId,
      );

      // Buscar mensagens recentes
      const recentMessages = await this.chatService.getRecentMessages(
        data.conversationId,
      );
      client.emit('recentMessages', recentMessages);

      // Atualiza as notificações do usuário
      const unreadCount = await this.chatService.getUnreadMessageCount(
        data.conversationId,
        data.userId,
      );
      this.server
        .to(`notification_${data.userId}`)
        .emit('notifications', { [data.conversationId]: unreadCount });

      return { joined: true };
    } catch (error) {
      // Caso ocorra qualquer erro, logue e emita um erro para o cliente sem quebrar o servidor
      this.logger.error(`Error joining conversation: ${error.message}`);
    }
  }

  @SubscribeMessage('joinNotification')
  async handleJoinNotification(
    @MessageBody() data: { conversationIds: string[] | null; userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const notifications = {};

    // Conectar o cliente à sala de notifications
    client.join(`notification_${data.userId}`);

    this.logger.log(`notification connected: ${data.userId}`);

    // Se não houver conversationIds, ainda assim, garantir que o cliente entrou na sala
    if (data.conversationIds.length > 0) {
      for (const conversationId of data.conversationIds) {
        client.join(`conversation_${conversationId}`);
        const messageCount = await this.chatService.getUnreadMessageCount(
          conversationId,
          data.userId,
        );
        notifications[conversationId] = messageCount;
      }
    } else {
      // Se não houver conversationsIds, envie uma resposta de notificação vazia
      notifications['no_conversations'] = 0;
    }

    // Enviar as notificações
    client.emit('notifications', notifications);
    return { joined: true };
  }

  @SubscribeMessage('leaveConversation')
  handleLeaveConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`conversation_${data.conversationId}`);
    return { left: true };
  }
}
