import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Configuração de CORS correta para produção e desenvolvimento
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // ✅ Configuração do Upload para GraphQL (Tamanho de arquivo: 20MB, Máximo 6 arquivos)
  app.use(
    '/graphql',
    graphqlUploadExpress({
      maxFileSize: 20 * 1024 * 1024, // 20MB
      maxFiles: 6,
    }),
  );

  // ✅ Ativar validação global para proteger a API
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove campos não esperados na requisição
      forbidNonWhitelisted: true, // Retorna erro se um campo não esperado for enviado
      transform: true, // Converte tipos automaticamente
    }),
  );

  // ✅ Configuração da porta correta para o Azure
  const PORT = process.env.PORT || 5000;
  await app.listen(PORT, () => {
    console.log(`🚀 Backend rodando na porta ${PORT}`);
  });
}

bootstrap();
