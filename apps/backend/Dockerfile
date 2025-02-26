FROM node:22-alpine AS builder

WORKDIR /app

# 1. Instalar dependências críticas
RUN apk add --no-cache \
    openssl \
    libssl3 \
    openssl-dev \
    libc6-compat \
    gcompat \
    ca-certificates

# 2. Configurar variáveis de ambiente ESSENCIAIS
ENV LD_LIBRARY_PATH=/usr/lib
ENV PRISMA_ENGINE_LIBRARY=/usr/lib/libssl.so.3
ENV PRISMA_QUERY_ENGINE_LIBRARY=/usr/lib/libssl.so.3

# 3. Copiar e instalar dependências
COPY apps/backend/package.json apps/backend/package-lock.json ./
RUN npm install -g npm@10.9.2 && npm ci

# 4. Copiar configurações do projeto
COPY apps/backend/tsconfig*.json ./
COPY apps/backend/nest-cli.json ./
COPY apps/backend/prisma ./prisma

# 5. Gerar client Prisma
RUN npx prisma generate --schema=./prisma/schema.prisma

# 6. Copiar código e build
COPY apps/backend/src ./src
RUN npm run build

# Estágio de produção
FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

CMD ["node", "dist/main.js"]