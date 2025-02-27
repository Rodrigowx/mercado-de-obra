FROM node:22-alpine

WORKDIR /usr/src/app

# 1. Dependências do MongoDB
RUN apk add --no-cache openssl libssl3 libc6-compat

# 2. Copiar arquivos essenciais primeiro
COPY package*.json ./
COPY prisma ./prisma
COPY tsconfig*.json ./
COPY nest-cli.json ./

# 3. Instalar dependências e gerar Prisma
RUN npm ci && \
    npm install -g @nestjs/cli && \
    npx prisma generate --schema=./prisma/schema.prisma

COPY . .

# 5. Build da aplicação
RUN npm run build

# 6. Configuração final
ARG DATABASE_URL_MONGO
ENV DATABASE_URL_MONGO=$DATABASE_URL_MONGO
ENV PORT=4000
USER node
CMD ["node", "dist/main.js"]
