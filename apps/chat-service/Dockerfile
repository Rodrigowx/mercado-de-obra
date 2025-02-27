FROM node:22-alpine

WORKDIR /usr/src/app

# 1. Dependências do MongoDB
RUN apk add --no-cache openssl libssl3 libc6-compat

# 2. Copiar arquivos essenciais primeiro
COPY package.json ./
COPY prisma ./prisma
COPY tsconfig*.json ./
COPY nest-cli.json ./

# 3. Instalar dependências e gerar Prisma
RUN npm install --loglevel verbose && \
    npm install -g @nestjs/cli && \
    npx prisma generate --schema=./prisma/schema.prisma

# 4. Copiar o restante do código
COPY . .

# ✅ DEPURAÇÃO: Mostrar estrutura de arquivos ANTES do build
RUN echo "========== ANTES DO BUILD ==========" && ls -R .

# 5. Build da aplicação
RUN npm run build

# ✅ DEPURAÇÃO: Mostrar estrutura de arquivos DEPOIS do build
RUN echo "========== DEPOIS DO BUILD ==========" && ls -R dist

# 6. Configuração final
ARG DATABASE_URL_MONGO
ENV DATABASE_URL_MONGO=$DATABASE_URL_MONGO
ENV PORT=4000
USER node

# Ajuste conforme a estrutura encontrada
CMD ["node", "dist/main.js"]
