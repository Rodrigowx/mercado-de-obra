FROM node:22-alpine

# Define o diretório de trabalho
WORKDIR /usr/src/app

# 1️⃣ Instala dependências do sistema e build tools necessárias para compilar dependências nativas
RUN apk add --no-cache \
    openssl \
    libssl3 \
    libc6-compat \
    python3 \
    make \
    g++

# 2️⃣ Copia apenas arquivos essenciais para cache eficiente
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY tsconfig*.json ./
COPY nest-cli.json ./

# 3️⃣ Instala dependências
RUN npm install && \
    npm install -g @nestjs/cli && \
    npx prisma generate --schema=./prisma/schema.prisma

# 4️⃣ Copia o restante do código necessário para a aplicação
COPY . .

# 5️⃣ Compila a aplicação (gera `dist/`, incluindo `dist/prisma/seed.js`)
RUN npm run build

# 6️⃣ Garante que o seed.ts esteja presente e compilado
RUN ls -la dist/prisma/

# 7️⃣ Define variáveis de ambiente
ARG AZURE_STORAGE_CONNECTION_STRING
ARG AZURE_STORAGE_ACCOUNT_NAME
ARG AZURE_STORAGE_ACCOUNT_KEY
ARG AZURE_STORAGE_CONTAINER_NAME
ARG AZURE_COMMUNICATION_EMAIL_CONNECTION_STRING
ARG AZURE_COMMUNICATION_EMAIL_SENDER
ARG DATABASE_URL
ARG DIRECT_URL
ARG FRONTEND_URL

ENV AZURE_STORAGE_CONNECTION_STRING=$AZURE_STORAGE_CONNECTION_STRING
ENV AZURE_STORAGE_ACCOUNT_NAME=$AZURE_STORAGE_ACCOUNT_NAME
ENV AZURE_STORAGE_ACCOUNT_KEY=$AZURE_STORAGE_ACCOUNT_KEY
ENV AZURE_STORAGE_CONTAINER_NAME=$AZURE_STORAGE_CONTAINER_NAME
ENV AZURE_COMMUNICATION_EMAIL_CONNECTION_STRING=$AZURE_COMMUNICATION_EMAIL_CONNECTION_STRING
ENV AZURE_COMMUNICATION_EMAIL_SENDER=$AZURE_COMMUNICATION_EMAIL_SENDER
ENV DATABASE_URL=$DATABASE_URL
ENV DIRECT_URL=$DIRECT_URL
ENV FRONTEND_URL=$FRONTEND_URL
ENV PORT=3000

# ✅ Debug opcional: Mostrar variáveis de ambiente no log do container
RUN echo "========== VARIÁVEIS DE AMBIENTE CONFIGURADAS ==========" && env

# 8️⃣ Comando final para rodar a aplicação
CMD ["node", "dist/main.js"]
