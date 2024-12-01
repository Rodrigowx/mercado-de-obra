import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { PrismaModule } from '../prisma/prisma.module'; // Importa o PrismaModule
import { SmsModule } from '../sms/sms.module';

@Module({
  imports: [PrismaModule, SmsModule], // Certifique-se de importar o PrismaModule
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
