import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './dto/strategies/jwt.strategy';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }), // Configura o Passport para JWT
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecretKey', // Use a mesma chave secreta
      signOptions: { expiresIn: '7d' }, // Tempo de expiração padrão do token
    }),    PrismaModule, EmailModule
  ],
  providers: [AuthService, AuthResolver, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
