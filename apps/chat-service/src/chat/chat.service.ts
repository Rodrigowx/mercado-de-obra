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
        // Seleciona a conversa e os participantes necessários
        conversation: {
          select: {
            clientId: true,
            professionalId: true,
            client: {
              select: {
                name: true, // Tenta selecionar o nome do cliente
              },
            },
            professional: {
              select: {
                name: true, // Tenta selecionar o nome do profissional
              },
            },
          },
        },
      },
    });

    if (!lastMessage) {
      return null;
    }

    let senderName = 'Desconhecido'; // Fallback Padrão

    // Verifica se os dados da conversa e participantes existem
    if (lastMessage.conversation) {
      if (lastMessage.senderId === lastMessage.conversation.clientId) {
        // <<== USA ?. e ?? para segurança
        senderName = lastMessage.conversation.client?.name ?? 'Cliente'; // Fallback se o nome for null/undefined
      } else if (
        lastMessage.senderId === lastMessage.conversation.professionalId
      ) {
        // <<== USA ?. e ?? para segurança
        senderName =
          lastMessage.conversation.professional?.name ?? 'Profissional'; // Fallback se o nome for null/undefined
      }
      // Se senderId não corresponder a nenhum, mantém 'Desconhecido'
    }

    // Retorna a mensagem original MAIS o senderName garantido (nunca undefined)
    return {
      ...lastMessage,
      senderName, // Agora sempre terá um valor string
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

  async createConversation(
    clientIdStr: string,
    clientName: string,
    professionalIdStr: string,
    professionalName: string,
  ) {
    // 1. Validar e Converter IDs para Number
    // O schema define os IDs de Client e Professional como Int, então convertemos.
    // Adicionamos validação para garantir que a conversão resultou em um número válido.
    const clientId = Number(clientIdStr);
    const professionalId = Number(professionalIdStr);

    if (isNaN(clientId) || isNaN(professionalId)) {
      console.error('IDs inválidos fornecidos:', {
        clientIdStr,
        professionalIdStr,
      });
      throw new Error('ID do cliente ou profissional inválido.');
      // Alternativamente, você pode retornar null ou um objeto de erro específico
      // dependendo de como sua aplicação lida com erros.
    }

    // Opcional: Adicionar verificação se IDs devem ser positivos, se aplicável
    if (clientId <= 0 || professionalId <= 0) {
      console.error('IDs devem ser positivos:', { clientId, professionalId });
      throw new Error(
        'IDs do cliente e profissional devem ser números inteiros positivos.',
      );
    }

    try {
      // 2. Garantir que o Cliente exista (Criar se não existir)
      // `upsert` é ideal aqui:
      // - `where`: Tenta encontrar um cliente com o ID fornecido.
      // - `update`: Se encontrado, não faz nada (objeto vazio).
      // - `create`: Se não encontrado, cria um novo cliente com o ID e nome.
      // Nota: Usar IDs numéricos como @id no MongoDB é possível com Prisma,
      // mas menos comum que ObjectIds. Sua função está correta conforme o schema.
      const client = await this.prisma.client.upsert({
        where: { id: clientId },
        update: {
          // Se precisar atualizar o nome caso o cliente já exista, coloque aqui:
          // name: clientName,
        },
        create: {
          id: clientId, // Conforme schema: Int
          name: clientName,
          // 'role' terá o default "CLIENT" definido no schema
        },
      });
      console.log('Cliente garantido:', client); // Log para depuração

      // 3. Garantir que o Profissional exista (Criar se não existir)
      // Mesma lógica do `upsert` para o profissional.
      const professional = await this.prisma.professional.upsert({
        where: { id: professionalId },
        update: {
          // Se precisar atualizar o nome caso o profissional já exista, coloque aqui:
          // name: professionalName,
        },
        create: {
          id: professionalId, // Conforme schema: Int
          name: professionalName,
          // 'role' terá o default "PROFESSIONAL" definido no schema
        },
      });
      console.log('Profissional garantido:', professional); // Log para depuração

      // 4. Verificar se a Conversa já existe entre este Cliente e Profissional
      // Usamos findFirst para buscar uma conversa que combine ambos os IDs.
      const existingConversation = await this.prisma.conversation.findFirst({
        where: {
          clientId: clientId, // ID do cliente garantido acima
          professionalId: professionalId, // ID do profissional garantido acima
        },
        // Opcional: incluir dados relacionados se necessário imediatamente
        // include: { client: true, professional: true }
      });

      // 5. Retornar a Conversa existente ou Criar uma Nova
      if (existingConversation) {
        console.log('Conversa existente encontrada:', existingConversation);
        return existingConversation; // Retorna a conversa encontrada
      } else {
        console.log('Criando nova conversa...');
        // Se não encontrou, cria a nova conversa associando os IDs.
        // O ID da conversa (ObjectId) será gerado automaticamente pelo MongoDB/Prisma.
        // 'status' e 'createdAt' terão os defaults definidos no schema.
        const newConversation = await this.prisma.conversation.create({
          data: {
            clientId: clientId, // Associa ao cliente
            professionalId: professionalId, // Associa ao profissional
            // Não precisa definir id, status, createdAt (são automáticos/default)
          },
          // Opcional: incluir dados relacionados na resposta
          // include: { client: true, professional: true }
        });
        console.log('Nova conversa criada:', newConversation);
        return newConversation; // Retorna a conversa recém-criada
      }
    } catch (error) {
      console.error('Erro ao criar/encontrar conversa:', error);
      // Trate o erro apropriadamente. Você pode querer lançar o erro novamente
      // ou retornar um valor que indique a falha.
      throw new Error(
        `Falha ao processar a criação da conversa: ${error.message}`,
      );
      // ou return null;
    }
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
