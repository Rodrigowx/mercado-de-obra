FROM node:22-alpine AS builder

WORKDIR /app

# Instalar dependências do sistema
RUN apk add --no-cache openssl

# Copiar dependências
COPY package.json package-lock.json ./
RUN npm ci

# Copiar schema do Prisma
COPY prisma ./prisma

# Gerar client do Prisma
RUN npx prisma generate --schema=./prisma/schema.prisma

# Copiar código fonte
COPY src ./src

# Build da aplicação
RUN npm run build

# Estágio de produção
FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

CMD ["node", "dist/main.js"]