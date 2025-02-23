import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getLastMessage(conversationId: string) {
    const lastMessage = await this.prisma.message.findFirst({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        senderId: true,
        content: true,
        conversationId: true,
        createdAt: true,
        conversation: {
          select: {
            clientId: true,
            professionalId: true,
            client: {
              select: {
                name: true,
              },
            },
            professional: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!lastMessage) {
      return null;
    }

    // Determinar quem é o remetente (client ou professional)
    const senderName =
      lastMessage.senderId === lastMessage.conversation.clientId
        ? lastMessage.conversation.client.name
        : lastMessage.senderId === lastMessage.conversation.professionalId
          ? lastMessage.conversation.professional.name
          : 'Desconhecido';

    return {
      ...lastMessage,
      senderName,
    };
  }

  async getUserConversations(userId: number) {
    // Verifica se esse ID corresponde a um cliente
    const client = await this.prisma.client.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    // Verifica se esse ID corresponde a um profissional
    const professional = await this.prisma.professional.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!client && !professional) {
      // Não é cliente nem profissional
      return [];
    }

    // Colete todas as conversas desse usuário, seja como cliente ou profissional
    const conversations = await this.prisma.conversation.findMany({
      where: {
        OR: [
          { clientId: client ? userId : -1 },
          { professionalId: professional ? userId : -1 },
        ],
      },
      select: { id: true },
    });

    // Retorna apenas um array de IDs das conversas (string)
    return conversations.map((c) => c.id);
  }

  // Criar uma conversa única entre cliente e profissional
  async createConversation(
    clientIdStr: string,
    clientName: string,
    professionalIdStr: string,
    professionalName: string,
  ) {
    const clientId = Number(clientIdStr);
    const professionalId = Number(professionalIdStr);

    // Ensure the client exists
    await this.prisma.client.upsert({
      where: { id: clientId },
      update: {}, // No update if exists
      create: {
        id: clientId,
        name: clientName,
      },
    });

    // Ensure the professional exists
    await this.prisma.professional.upsert({
      where: { id: professionalId },
      update: {}, // No update if exists
      create: {
        id: professionalId,
        name: professionalName,
      },
    });

    // Check if the conversation already exists
    const existingConversation = await this.prisma.conversation.findFirst({
      where: {
        clientId,
        professionalId,
      },
    });

    if (existingConversation) {
      return existingConversation;
    }

    // Create the conversation if it doesn't exist
    return this.prisma.conversation.create({
      data: {
        clientId,
        professionalId,
      },
    });
  }

  // Criar uma mensagem
  async createMessage(
    conversationId: string,
    senderIdStr: string,
    content: string,
    attachments?: string[],
  ) {
    if (!conversationId || conversationId.trim() === '') {
      throw new Error('Invalid conversationId');
    }

    const senderId = Number(senderIdStr);

    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { clientId: true, professionalId: true },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const isClient = senderId === conversation.clientId;

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
        attachments: attachments ?? [],
        ...(isClient ? { clientRead: true } : { professionalRead: true }),
      },
      include: {
        conversation: {
          select: {
            clientId: true,
            professionalId: true,
            client: {
              select: {
                name: true,
              },
            },
            professional: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return message;
  }

  // Buscar mensagens de uma conversa
  async getMessages(conversationId: string) {
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: {
        conversation: {
          select: {
            clientId: true,
            professionalId: true,
            client: {
              select: {
                name: true,
              },
            },
            professional: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }

  // Fechar uma conversa
  async closeConversation(conversationId: string) {
    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: { status: 'closed' },
    });
  }

  async getRecentMessages(conversationId: string) {
    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      include: {
        conversation: {
          select: {
            clientId: true,
            professionalId: true,
            client: { select: { name: true } },
            professional: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return messages.reverse();
  }

  async getUnreadMessageCount(
    conversationId: string,
    userId: number,
  ): Promise<number> {
    if (!conversationId || conversationId.trim() === '') {
      console.log(`Invalid conversationId provided: ${conversationId}`);
      return 0;
    }

    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { clientId: true, professionalId: true },
    });

    if (!conversation) return 0;
    if (![conversation.clientId, conversation.professionalId].includes(userId))
      return 0;

    const isClient = conversation.clientId === userId;
    return this.prisma.message.count({
      where: {
        conversationId,
        ...(isClient ? { clientRead: false } : { professionalRead: false }),
      },
    });
  }

  async markMessagesAsRead(conversationId: string, userId: number) {
    if (!conversationId || conversationId.trim() === '') {
      console.log(`Invalid conversationId provided: ${conversationId}`);
      return; // Retorna sem fazer nada, sem quebrar o servidor
    }

    try {
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { clientId: true, professionalId: true },
      });

      if (!conversation) {
        console.log(
          `Conversation not found for conversationId: ${conversationId}`,
        );
        return; // Retorna sem fazer nada
      }

      const isClient = conversation.clientId === userId;

      await this.prisma.message.updateMany({
        where: {
          conversationId,
          ...(isClient ? { clientRead: false } : { professionalRead: false }),
        },
        data: {
          ...(isClient ? { clientRead: true } : { professionalRead: true }),
        },
      });
    } catch (error) {
      console.log(
        `Error marking messages as read for conversationId: ${conversationId}`,
        error,
      );
    }
  }

  async getConversation(conversationId: string): Promise<any> {
    return this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { client: true, professional: true },
    });
  }

  async getConversationWithMessages(conversationId: string) {
    return this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        client: true,
        professional: true,
      },
    });
  }
}
