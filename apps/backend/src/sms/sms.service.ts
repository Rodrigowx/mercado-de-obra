import { Injectable } from '@nestjs/common';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

@Injectable()
export class SmsService {
  private snsClient: SNSClient;

  constructor() {
    // Inicializa o cliente SNS usando as credenciais da AWS
    this.snsClient = new SNSClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  // Função para enviar SMS
  async sendSMS(phoneNumber: string, message: string): Promise<void> {
    const params = {
      Message: message,
      PhoneNumber: phoneNumber, // Número no formato internacional, ex: +5511998765432
    };

    try {
      // const result = await this.snsClient.send(new PublishCommand(params));
      console.log('SMS enviado com sucesso:');
    } catch (error) {
      console.error('Erro ao enviar SMS:', error.message);
      throw new Error('Falha ao enviar SMS');
    }
  }
}
