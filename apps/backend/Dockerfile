# Estágio de construção
FROM node:22-alpine AS builder

WORKDIR /app

# 1. Instalar dependências do sistema
RUN apk add --no-cache openssl

# 2. Copiar dependências do backend
COPY apps/backend/package.json apps/backend/package-lock.json ./

# 3. Instalar dependências
RUN npm ci

# 4. Copiar schema do Prisma
COPY apps/backend/prisma ./prisma

# 5. Gerar client do Prisma
RUN npx prisma generate --schema=./prisma/schema.prisma

# 6. Copiar código fonte
COPY apps/backend/src ./src

# 7. Build da aplicação
RUN npm run build

# Estágio de produção
FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

ENV PORT=8080
EXPOSE $PORT
CMD ["node", "dist/main.js"]