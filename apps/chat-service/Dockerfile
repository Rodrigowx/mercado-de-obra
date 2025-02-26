# Estágio de construção
FROM node:22-alpine AS builder

WORKDIR /app

# 1. Copiar configurações e dependências
COPY apps/chat-service/package*.json .
COPY apps/chat-service/tsconfig*.json .
COPY apps/chat-service/prisma ./prisma

# 2. Instalar dependências e gerar Prisma Client
RUN npm ci && \
    npx prisma generate && \
    npx prisma migrate deploy

# 3. Copiar código fonte
COPY apps/chat-service/src ./src

# 4. Build da aplicação
RUN npm run build

# Estágio de produção
FROM node:22-alpine
WORKDIR /app

# Dependências do sistema para Prisma
RUN apk add --no-cache openssl libssl3 libc6-compat

# Copiar artefatos de construção
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# Configuração de segurança
USER node

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:$PORT/_health || exit 1

EXPOSE $PORT
CMD ["node", "dist/main.js"]