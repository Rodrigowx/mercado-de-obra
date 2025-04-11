FROM node:22-alpine

WORKDIR /usr/src/app

# Instala dependências do sistema
RUN apk add --no-cache openssl libssl3 libc6-compat python3 make g++

# Copia arquivos essenciais primeiro
COPY package.json ./ 
COPY prisma ./prisma
COPY tsconfig*.json ./ 
COPY nest-cli.json ./

# Instala dependências e gera o Prisma Client (com fake URL)
ENV DATABASE_URL="mongodb://fake"
RUN npm install --legacy-peer-deps && \
    npm install -g @nestjs/cli && \
    npx prisma generate --schema=./prisma/schema.prisma

# Copia o restante do código
COPY . .

# Build da aplicação
RUN npm run build

# Define variáveis de ambiente reais (passadas via build-args)
ARG DATABASE_URL_MONGO
ARG FRONTEND_URL

ENV DATABASE_URL_MONGO=$DATABASE_URL_MONGO
ENV FRONTEND_URL=$FRONTEND_URL
ENV PORT=4000

CMD ["node", "dist/main.js"]
