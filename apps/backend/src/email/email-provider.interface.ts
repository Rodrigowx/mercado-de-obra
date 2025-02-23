// email-provider.interface.ts
export interface EmailProvider {
    sendEmail(to: string, subject: string, text: string): Promise<void>;
  }