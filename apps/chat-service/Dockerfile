FROM node:22-alpine AS builder

WORKDIR /app

# Copiar apenas os arquivos do chat-service
COPY apps/chat-service/package.json apps/chat-service/package-lock.json ./
RUN npm ci

COPY apps/chat-service/src ./src
COPY apps/chat-service/prisma ./prisma  # Se aplicável

RUN npm run build

# Estágio de produção
FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/main.js"]