import { Module } from '@nestjs/common';
import { NeedService } from './need.service';
import { NeedResolver } from './need.resolver';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  providers: [NeedResolver, NeedService, PrismaService],
  exports: [NeedService],
})
export class NeedModule {}
