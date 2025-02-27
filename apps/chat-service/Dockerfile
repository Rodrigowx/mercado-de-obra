FROM node:22-alpine

# Define o diretório de trabalho
WORKDIR /usr/src/app

# 1. Instala dependências do sistema e build tools
RUN apk add --no-cache openssl libssl3 libc6-compat python3 make g++

# 2. Copia apenas arquivos essenciais para cache eficiente
COPY package.json ./
COPY prisma ./prisma
COPY tsconfig*.json ./
COPY nest-cli.json ./

# 3. Instala dependências
RUN npm install && \
    npm install -g @nestjs/cli && \
    npx prisma generate --schema=./prisma/schema.prisma

# 4. Copia o restante do código
COPY . .

# ✅ DEPURAÇÃO: Mostrar estrutura de arquivos ANTES do build
RUN echo "========== ANTES DO BUILD =========="

# 5. Build da aplicação
RUN npm run build

# ✅ DEPURAÇÃO: Mostrar estrutura de arquivos DEPOIS do build
RUN echo "========== DEPOIS DO BUILD =========="


ARG DATABASE_URL_MONGO
ARG FRONTEND_URL

ENV DATABASE_URL_MONGO=$DATABASE_URL_MONGO
ENV FRONTEND_URL=$FRONTEND_URL
ENV PORT=4000

# ✅ DEPURAÇÃO: Mostrar variáveis de ambiente no log do container
RUN echo "========== VARIÁVEIS DE AMBIENTE CONFIGURADAS ==========" && env
# Executa a aplicação
CMD ["node", "dist/main.js"]
