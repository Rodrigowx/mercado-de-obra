import { EmailProvider } from './email-provider.interface';
import { EmailClient } from '@azure/communication-email';
import { ConfigService } from '@nestjs/config';

export class AzureEmailProvider implements EmailProvider {
  private emailClient: EmailClient;
  private sender: string;

  constructor(private readonly configService: ConfigService) {
    // Lê a connection string do ACS Email
    const connectionString = this.configService.get<string>(
      'AZURE_COMMUNICATION_EMAIL_CONNECTION_STRING',
    );
    this.emailClient = new EmailClient(connectionString);
    // Lê o e-mail remetente
    this.sender = this.configService.get<string>(
      'AZURE_COMMUNICATION_EMAIL_SENDER',
    );
  }

  async sendEmail(to: string, subject: string, text: string): Promise<void> {
    const emailMessage = {
      senderAddress: this.sender,
      recipients: { to: [{ address: to }] },
      content: {
        subject,
        plainText: text,
      },
    };

    // Inicia o envio do e-mail
    await this.emailClient.beginSend(emailMessage);
  }
}
