import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversation')
  async createConversation(
    @Body() body: {
      clientId: number;
      professionalId: number;
      clientName: string;
      professionalName: string;
    },
  ) {
    const clientId = body.clientId.toString();
    const professionalId = body.professionalId.toString();

    return this.chatService.createConversation(
      clientId,
      body.clientName,
      professionalId,
      body.professionalName,
    );
  }

  @Post('conversation/:id/message')
  async createMessage(
    @Param('id') conversationId: string,
    @Body() body: { senderId: string; content: string; attachments?: string[] },
  ) {
    return this.chatService.createMessage(conversationId, body.senderId, body.content, body.attachments);
  }

  @Get('conversation/:id/messages')
  async getMessages(@Param('id') conversationId: string) {
    return this.chatService.getMessages(conversationId);
  }

  @Patch('conversation/:id/close')
  async closeConversation(@Param('id') conversationId: string) {
    return this.chatService.closeConversation(conversationId);
  }

  @Get('user-conversations/:userId')
async getUserConversations(@Param('userId') userId: string) {
  const userIdNum = parseInt(userId);
  if (isNaN(userIdNum)) {
    return [];
  }
  return this.chatService.getUserConversations(userIdNum);
}

  @Get('conversation/:id/last-message')
  async getLastMessage(@Param('id') conversationId: string) {
    return this.chatService.getLastMessage(conversationId);
  }
}
