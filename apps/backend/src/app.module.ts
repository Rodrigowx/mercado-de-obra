import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { UsersModule } from './users/users.module';
import { EmailModule } from './email/email.module'; // Agora usamos o EmailModule
import { SmsService } from './sms/sms.service';
import { UsersService } from './users/users.service';
import { PrismaModule } from './prisma/prisma.module';
import './users/models/role.enum';
import { EmailService } from './email/email.service';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    EmailModule, // Agora o EmailService é provido pelo EmailModule
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: ({ req }) => ({ req }), // Passando o request para usar nos resolvers (para JWT, etc)
    }),
  ],
  controllers: [AppController], // AdminController removido, pois não é utilizado
  providers: [AppService, SmsService, UsersService, EmailService],
  exports: [UsersService],
})
export class AppModule {}
