FROM node:22-alpine

WORKDIR /app

# Instala dependências do sistema para Prisma e builds
RUN apk add --no-cache openssl libssl3 libc6-compat

# 1. Copia configurações globais
COPY tsconfig*.json ./

# 2. Copia configurações específicas do backend
COPY apps/backend/tsconfig*.json ./apps/backend/
COPY apps/backend/package*.json ./apps/backend/

# 3. Copia arquivos do Prisma
COPY apps/backend/prisma ./apps/backend/prisma

# 4. Instala dependências e configura path aliases
WORKDIR /app/apps/backend
RUN npm ci && \
    npx prisma generate && \
    npx prisma migrate deploy

# 5. Copia todo o código fonte mantendo a estrutura de diretórios
COPY apps/backend/src ./src
COPY apps/backend/app ./app
COPY apps/backend/server ./server
COPY apps/backend/middleware.ts ./

# 6. Build da aplicação com path aliases
RUN npm run build

# 7. Configuração de segurança
USER node

HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:$PORT/_health || exit 1

CMD ["npm", "--prefix", "apps/backend", "run", "start:prod"]
