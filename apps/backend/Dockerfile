FROM node:22-alpine AS builder

WORKDIR /app

# 1. Copiar dependências
COPY apps/backend/package.json apps/backend/package-lock.json ./
RUN npm ci

# 2. Copiar schema do Prisma
COPY apps/backend/prisma ./prisma
RUN npx prisma generate

# 3. Copiar código fonte
COPY apps/backend/src ./src

# 4. Build com verificação
RUN npm run build || (echo "Build failed! Logs:"; cat npm-debug.log; exit 1)

# Estágio de produção
FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
CMD ["node", "dist/main.js"]