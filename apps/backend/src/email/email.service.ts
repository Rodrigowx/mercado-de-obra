import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AzureEmailProvider } from './azure-email-provider';

@Injectable()
export class EmailService {
  private provider: AzureEmailProvider;

  constructor(private readonly configService: ConfigService) {
    this.provider = new AzureEmailProvider(this.configService);
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const subject = 'Bem-vindo ao Mercado de Obra!';
    const text = `Olá ${name}, seja bem-vindo ao Mercado de Obra!`;
    await this.provider.sendEmail(to, subject, text);
  }

  async sendPasswordResetCodeEmail(to: string, code: string): Promise<void> {
    const subject = 'Redefinição de Senha - Mercado de Obra';
    const text = `Seu código para redefinir a senha é: ${code}`;
    await this.provider.sendEmail(to, subject, text);
  }
}
