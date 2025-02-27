FROM node:22-alpine

# Define o diretório de trabalho
WORKDIR /usr/src/app

# 1. Instala dependências do sistema e build tools
RUN apk add --no-cache openssl libssl3 libc6-compat python3 make g++

# 2. Copia apenas arquivos essenciais para cache eficiente
COPY package*.json ./
COPY prisma ./prisma
COPY tsconfig*.json ./
COPY nest-cli.json ./

# 3. Instala dependências
RUN npm ci --loglevel verbose && \
    npm install -g @nestjs/cli && \
    npx prisma generate --schema=./prisma/schema.prisma

# 4. Copia o restante do código
COPY . .

# 5. Build da aplicação
RUN npm run build

# 6. Configuração final
ENV PORT=3000
USER node
CMD ["node", "dist/main.js"]


# 1. Instala dependências do sistema e build tools
RUN apk add --no-cache openssl libssl3 libc6-compat python3 make g++

# 2. Copia apenas o necessário para cache
COPY package.json ./
COPY nest-cli.json ./
COPY prisma ./prisma
COPY tsconfig*.json ./

# 3. Instala dependências com log detalhado
RUN npm ci --loglevel verbose && \
    npx prisma generate --schema=./prisma/schema.prisma

# 4. Copia o restante do código
COPY . .

# 5. Build da aplicação
RUN npm run build && ls -R dist

# 6. Configuração final
ENV PORT=3000
USER node
CMD ["node", "dist/main.js"]
