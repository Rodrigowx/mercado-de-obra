import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule], // Importa o ConfigModule para ler variáveis do .env
  providers: [EmailService],
  exports: [EmailService], // Exporta o serviço de email para outros módulos
})
export class EmailModule {}
