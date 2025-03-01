import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AzureEmailProvider } from './azure-email-provider';

@Injectable()
export class EmailService {
  private provider: AzureEmailProvider;

  constructor(private readonly configService: ConfigService) {
    this.provider = new AzureEmailProvider(this.configService);
  }

  async sendEmailVerificationCodeEmail(
    to: string,
    code: string,
  ): Promise<void> {
    const subject = 'Bem-vindo ao Mercado de Obra! | Verificação de Email ';
    const text = `Seu código de verificação é: ${code}`;
    await this.provider.sendEmail(to, subject, text);
  }

  async sendPasswordResetCodeEmail(to: string, code: string): Promise<void> {
    const subject = 'Redefinição de Senha - Mercado de Obra';
    const text = `Seu código para redefinir a senha é: ${code}`;
    await this.provider.sendEmail(to, subject, text);
  }
}
