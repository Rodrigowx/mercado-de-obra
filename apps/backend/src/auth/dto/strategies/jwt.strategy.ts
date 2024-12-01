import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Valida a expiração do token
      secretOrKey: process.env.JWT_SECRET || 'superSecretKey123', // Use a mesma chave do .env
    });
  }

  // Defina o tipo do payload para maior clareza
  async validate(payload: { sub: number; email: string; role: string }) {
    // Retorna o payload decodificado, incluindo id, email e role
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
