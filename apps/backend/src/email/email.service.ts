import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESClient } from '@aws-sdk/client-ses';
import { EmailProvider } from './email-provider.interface';
import { SesEmailProvider } from './ses-email-provider';

@Injectable()
export class EmailService {
  private provider: EmailProvider;
  private frontendUrl: string;

  constructor(private readonly configService: ConfigService) {
    const sesClient = new SESClient({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
    const sourceEmail = this.configService.get<string>('AWS_SES_SOURCE_EMAIL');
    this.provider = new SesEmailProvider(sesClient, sourceEmail);
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL');
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const subject = 'Bem-vindo ao Mercado de Obra!';
    const text = `Olá ${name}, bem-vindo ao Mercado de Obra!`;
    await this.provider.sendEmail(to, subject, text);
  }

  async sendPasswordResetCodeEmail(to: string, code: string): Promise<void> {
    const subject = 'Código de Redefinição de Senha - Mercado de Obra';
    const text = `Olá,\n\nSeu código de redefinição de senha é: ${code}\n\nEle é válido por 1 hora. Caso não tenha solicitado, ignore este email.`;
    await this.provider.sendEmail(to, subject, text);
  }
}
