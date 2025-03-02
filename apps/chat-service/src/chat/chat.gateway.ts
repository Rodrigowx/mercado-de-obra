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

    // Se já existir uma conexão ativa para esse usuário, não faz nada
    if (this.activeUsers.has(userId)) {
      const existingSocket = this.activeUsers.get(userId);
      this.logger.log(
        `Usuário ${userId} já conectado com o socket ${existingSocket.id}. Nova conexão ${socket.id} ignorada.`,
      );
      socket.emit('alreadyConnected', { message: 'Você já está conectado.' });
      return;
    }

    this.activeUsers.set(userId, socket);
    this.logger.log(`Usuário ${userId} conectado com o socket ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    // Remove a conexão correspondente ao socket desconectado
    for (const [userId, activeSocket] of this.activeUsers.entries()) {
      if (activeSocket.id === socket.id) {
        this.activeUsers.delete(userId);
        this.logger.log(`Usuário ${userId} desconectado.`);
        break;
      }
    }
  }

  @SubscribeMessage('typingStart')
  handleTypingStart(
    @MessageBody() data: { conversationId: string; userId: number },
    @ConnectedSocket() client: Socket,
  ) {
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

    // Emite a mensagem para a sala da conversa
    this.server
      .in(`conversation_${data.conversationId}`)
      .emit('messageReceived', message);

    // Descobre o recipient
    const conversation = await this.chatService.getConversation(data.conversationId);
    const recipientId =
      message.senderId === conversation.clientId
        ? conversation.professionalId
        : conversation.clientId;

    const unreadCount = await this.chatService.getUnreadMessageCount(
      data.conversationId,
      recipientId,
    );

    // Emite atualização de notificações p/ destinatário
    this.server
      .to(`notification_${recipientId}`)
      .emit('notifications', { [data.conversationId]: unreadCount });

    // Emite newClientConversation COM dados (seu front espera { conversationId, message, unreadCount })
    const payload = {
      conversationId: data.conversationId,
      message,
      unreadCount,
    };

    // Para o recipient
    this.server.to(`notification_${recipientId}`).emit('newClientConversation', payload);

    // Opcional: notificar a sala da conversa também
    // this.server.in(`conversation_${data.conversationId}`).emit('newClientConversation', payload);

    return message;
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: { conversationId: string; userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    await this.chatService.markMessagesAsRead(data.conversationId, data.userId);

    this.server
      .in(`conversation_${data.conversationId}`)
      .emit('messagesMarkedAsRead', {
        conversationId: data.conversationId,
        userId: data.userId,
      });

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
    if (!data.conversationId || data.conversationId.trim() === '') {
      client.emit('error', { message: 'Invalid conversation ID' });
      return;
    }

    client.join(`conversation_${data.conversationId}`);
    this.logger.log(`conversation_ connected: ${data.userId}, ${data.conversationId}`);

    // Marca como lidas
    await this.chatService.markMessagesAsRead(data.conversationId, data.userId);

    // Envia mensagens recentes
    const recentMessages = await this.chatService.getRecentMessages(data.conversationId);
    client.emit('recentMessages', recentMessages);

    // Atualiza notificações p/ esse user
    const unreadCount = await this.chatService.getUnreadMessageCount(
      data.conversationId,
      data.userId,
    );
    this.server
      .to(`notification_${data.userId}`)
      .emit('notifications', { [data.conversationId]: unreadCount });

    return { joined: true };
  }

  @SubscribeMessage('joinNotification')
  async handleJoinNotification(
    @MessageBody() data: { conversationIds: string[]; userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const notifications = {};

    client.join(`notification_${data.userId}`);
    this.logger.log(`notification connected: ${data.userId}`);

    if (data.conversationIds?.length > 0) {
      for (const conversationId of data.conversationIds) {
        client.join(`conversation_${conversationId}`);
        const messageCount = await this.chatService.getUnreadMessageCount(
          conversationId,
          data.userId,
        );
        notifications[conversationId] = messageCount;
      }
    } else {
      notifications['no_conversations'] = 0;
    }

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
