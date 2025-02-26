# apps/backend/Dockerfile
FROM node:22-alpine

WORKDIR /app

# 1. Instala dependências do sistema
RUN apk add --no-cache openssl libssl3 libc6-compat

# 2. Copia apenas o necessário para cache
COPY package*.json .
COPY prisma ./prisma

# 3. Instala dependências
RUN npm ci --omit=dev && \
    npx prisma generate

# 4. Copia APENAS os arquivos do backend
COPY src ./src
COPY tsconfig*.json .

# 5. Build e execução
RUN npm run build

CMD ["node", "dist/main.js"]