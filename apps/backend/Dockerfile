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
RUN npm install --loglevel verbose && \
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

# 6. Configuração final

# Recebe as variáveis do ambiente e define no container
ARG AZURE_STORAGE_CONNECTION_STRING
ARG AZURE_STORAGE_ACCOUNT_NAME
ARG AZURE_STORAGE_ACCOUNT_KEY
ARG AZURE_STORAGE_CONTAINER_NAME
ARG AZURE_COMMUNICATION_EMAIL_CONNECTION_STRING
ARG AZURE_COMMUNICATION_EMAIL_SENDER
ARG DATABASE_URL
ARG FRONTEND_URL

ENV AZURE_STORAGE_CONNECTION_STRING=$AZURE_STORAGE_CONNECTION_STRING
ENV AZURE_STORAGE_ACCOUNT_NAME=$AZURE_STORAGE_ACCOUNT_NAME
ENV AZURE_STORAGE_ACCOUNT_KEY=$AZURE_STORAGE_ACCOUNT_KEY
ENV AZURE_STORAGE_CONTAINER_NAME=$AZURE_STORAGE_CONTAINER_NAME
ENV AZURE_COMMUNICATION_EMAIL_CONNECTION_STRING=$AZURE_COMMUNICATION_EMAIL_CONNECTION_STRING
ENV AZURE_COMMUNICATION_EMAIL_SENDER=$AZURE_COMMUNICATION_EMAIL_SENDER
ENV DATABASE_URL=$DATABASE_URL
ENV FRONTEND_URL=$FRONTEND_URL
ENV PORT=3000

# ✅ DEPURAÇÃO: Mostrar variáveis de ambiente no log do container
RUN echo "========== VARIÁVEIS DE AMBIENTE CONFIGURADAS ==========" && env

# Define usuário para segurança
USER node

# Executa a aplicação
CMD ["node", "dist/main.js"]
