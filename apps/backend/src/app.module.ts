import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { ServicesModule } from './services/services.module';
import { ProfessionalModule } from './professional/professional.module';
import { AppService } from './app.service';
import { SmsService } from './sms/sms.service';
import { EmailService } from './email/email.service';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { PortfolioModule } from './professional/portfolio/portfolio.module';
import { ClientModule } from './client/client.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    EmailModule,
    ServicesModule,
    ProfessionalModule,
    PortfolioModule,
    ClientModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      path: '/graphql',
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),  
      resolvers: { Upload: GraphQLUpload },
      context: ({ req }) => ({ req }),
    }),
  ],
  controllers: [],
  providers: [AppService, SmsService, EmailService],
})
export class AppModule {}
