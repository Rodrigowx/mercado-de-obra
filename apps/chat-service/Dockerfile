FROM node:22-alpine AS builder

WORKDIR /app

# 1. Copiar apenas os arquivos necessários
COPY package.json package-lock.json ./

# 2. Instalar dependências
RUN npm ci

# 3. Copiar código fonte
COPY src ./src

# 4. Se usar Prisma no chat-service:
COPY prisma ./prisma
RUN npx prisma generate

# 5. Build da aplicação
RUN npm run build

# Estágio de produção
FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

CMD ["node", "dist/main.js"]