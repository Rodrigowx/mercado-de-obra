FROM node:22-alpine AS builder

WORKDIR /app

# 1. Instalar dependências ESSENCIAIS para o Prisma
RUN apk add --no-cache openssl libssl3 openssl-dev libc6-compat gcompat

# 2. Copiar configurações
COPY apps/backend/package.json apps/backend/package-lock.json ./
COPY apps/backend/tsconfig*.json ./
COPY apps/backend/nest-cli.json ./

# 3. Forçar versão estável do npm
RUN npm install -g npm@10.9.2

# 4. Instalar dependências
RUN npm ci

# 5. Copiar schema do Prisma
COPY apps/backend/prisma ./prisma

# 6. Configurar variáveis para o Prisma Engine
ENV PRISMA_ENGINE_LIBRARY=/usr/lib/libssl.so.3 \
    PRISMA_QUERY_ENGINE_LIBRARY=/usr/lib/libssl.so.3

# 7. Gerar client do Prisma
RUN npx prisma generate --schema=./prisma/schema.prisma

# 8. Copiar código fonte
COPY apps/backend/src ./src

# 9. Build da aplicação
RUN npm run build

# Estágio de produção
FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

ENV PORT=8080
EXPOSE $PORT
CMD ["node", "dist/main.js"]