import { Injectable } from '@nestjs/common';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private sesClient: SESClient;
  private sourceEmail: string;

  constructor(private readonly configService: ConfigService) {
    this.sesClient = new SESClient({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });
    this.sourceEmail = this.configService.get<string>('AWS_SES_SOURCE_EMAIL');
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const params = {
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Body: {
          Text: {
            Data: `Olá ${name}, bem-vindo ao Mercado de Obra!`,
          },
        },
        Subject: { Data: 'Bem-vindo ao Mercado de Obra!' },
      },
      Source: this.sourceEmail,
    };

    try {
      const command = new SendEmailCommand(params);
      await this.sesClient.send(command);
      console.log(`Email enviado para ${to}`);
    } catch (error) {
      console.error('Erro ao enviar o email:', error.message);
      throw new Error('Falha ao enviar o email');
    }
  }
}
