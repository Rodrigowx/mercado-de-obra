import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { SmsModule } from '../sms/sms.module';
import { ProfessionalModule } from 'src/professional/professional.module';
import { ClientModule } from 'src/client/client.module';

@Module({
  imports: [PrismaModule, SmsModule, ClientModule, ProfessionalModule],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
