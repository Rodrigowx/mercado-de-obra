# Estágio de construção
FROM node:22-alpine AS builder

WORKDIR /app

# 1. Copiar dependências do chat
COPY apps/chat-service/package.json apps/chat-service/package-lock.json apps/chat-service/tsconfig.json ./

# 2. Instalar dependências
RUN npm ci

# 3. Copiar código fonte
COPY apps/chat-service/src ./src

# 4. Build da aplicação
RUN npm run build

# Estágio de produção
FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

ENV PORT=8181
EXPOSE $PORT
CMD ["node", "dist/main.js"]