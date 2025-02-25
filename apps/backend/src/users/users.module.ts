import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { ProfessionalModule } from '@professional/professional.module';
import { ClientModule } from '@client/client.module';

@Module({
  imports: [PrismaModule, ClientModule, ProfessionalModule],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
