FROM node:22-alpine

WORKDIR /app

# 1. Instala dependências do sistema
RUN apk add --no-cache openssl libssl3 libc6-compat

# 2. Copia apenas o necessário
COPY apps/chat-service/package*.json .
COPY apps/chat-service/prisma ./prisma

# 3. Instala dependências
RUN npm ci && \
    npx prisma generate

# 4. Copia todo o código fonte
COPY apps/chat-service .

# 5. Build da aplicação
RUN npm run build

# 6. Configuração final
USER node
EXPOSE 8181
CMD ["node", "dist/main.js"]