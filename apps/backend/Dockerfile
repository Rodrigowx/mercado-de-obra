FROM node:22-alpine

WORKDIR /app

# 1. Dependências do sistema
RUN apk add --no-cache openssl libssl3 libc6-compat

# 2. Copia arquivos básicos
COPY apps/backend/package*.json .
COPY apps/backend/prisma ./prisma

# 3. Instala dependências
RUN npm ci && \
    npx prisma generate

# 4. Copia todo o conteúdo
COPY apps/backend .

# 5. Build da aplicação
RUN npm run build

# 6. Configuração final
USER node
CMD ["node", "dist/main.js"]