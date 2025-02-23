// ses-email-provider.ts
import { EmailProvider } from './email-provider.interface';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

export class SesEmailProvider implements EmailProvider {
  constructor(private sesClient: SESClient, private sourceEmail: string) {}

  async sendEmail(to: string, subject: string, text: string): Promise<void> {
    const params = {
      Destination: { ToAddresses: [to] },
      Message: {
        Body: { Text: { Data: text } },
        Subject: { Data: subject },
      },
      Source: this.sourceEmail,
    };

    const command = new SendEmailCommand(params);
    await this.sesClient.send(command);
  }
}