import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './dto/strategies/jwt.strategy';
import { EmailService } from '../email/email.service';
import { SmsModule } from '../sms/sms.module'; // Importa o SmsModule

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecretKey',
      signOptions: { expiresIn: '60m' },
    }),
    SmsModule, // Certifique-se de importar o SmsModule
  ],
  providers: [AuthService, AuthResolver, JwtStrategy, EmailService],
  exports: [AuthService],
})
export class AuthModule {}
