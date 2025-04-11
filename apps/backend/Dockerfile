# Imagem base leve com Node.js 22
FROM node:22-alpine

# Diretório de trabalho
WORKDIR /usr/src/app

# Instala dependências do sistema necessárias para NestJS, Prisma e build nativo
RUN apk add --no-cache \
    openssl \
    libssl3 \
    libc6-compat \
    python3 \
    make \
    g++

# Copia apenas arquivos de configuração para cache eficiente
COPY package.json package-lock.json ./  
COPY tsconfig*.json ./  
COPY nest-cli.json ./  
COPY prisma ./prisma

# Instala dependências
RUN npm install

# Gera o Prisma Client diretamente na imagem
ENV DATABASE_URL="file:./dev.db"  # Fake URL só para o generate funcionar
RUN npx prisma generate

# Copia o restante do código (agora com client já gerado)
COPY . .

# Compila a aplicação NestJS (gera `dist/`)
RUN npm run build

# Define variáveis de ambiente que **não são sensíveis** (valores são passados no GitHub Actions no deploy)
ARG AZURE_STORAGE_CONNECTION_STRING
ARG AZURE_STORAGE_ACCOUNT_NAME
ARG AZURE_STORAGE_ACCOUNT_KEY
ARG AZURE_STORAGE_CONTAINER_NAME
ARG AZURE_COMMUNICATION_EMAIL_CONNECTION_STRING
ARG AZURE_COMMUNICATION_EMAIL_SENDER
ARG FRONTEND_URL

ENV AZURE_STORAGE_CONNECTION_STRING=$AZURE_STORAGE_CONNECTION_STRING
ENV AZURE_STORAGE_ACCOUNT_NAME=$AZURE_STORAGE_ACCOUNT_NAME
ENV AZURE_STORAGE_ACCOUNT_KEY=$AZURE_STORAGE_ACCOUNT_KEY
ENV AZURE_STORAGE_CONTAINER_NAME=$AZURE_STORAGE_CONTAINER_NAME
ENV AZURE_COMMUNICATION_EMAIL_CONNECTION_STRING=$AZURE_COMMUNICATION_EMAIL_CONNECTION_STRING
ENV AZURE_COMMUNICATION_EMAIL_SENDER=$AZURE_COMMUNICATION_EMAIL_SENDER
ENV FRONTEND_URL=$FRONTEND_URL
ENV PORT=3000

# Comando para rodar a aplicação
CMD ["node", "dist/main.js"]
