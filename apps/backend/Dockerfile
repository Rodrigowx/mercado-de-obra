FROM node:22-alpine AS builder

WORKDIR /app

# 1. Copiar dependências
COPY apps/backend/package.json apps/backend/package-lock.json ./

# 2. Instalar dependências com log detalhado
RUN npm ci --loglevel verbose

# 3. Copiar schema do Prisma
COPY apps/backend/prisma ./prisma

# 4. Gerar client do Prisma com verificação
RUN npx prisma generate || (echo "PRISMA GENERATE ERROR"; exit 1)

# 5. Copiar código fonte
COPY apps/backend/src ./src

# 6. Build com verificação aprimorada
RUN npm run build || \
    (echo "BUILD FAILED. Checking logs..." && \
    (if [ -f "npm-debug.log" ]; then cat npm-debug.log; fi) && \
    exit 1)

# Estágio de produção
FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

CMD ["node", "dist/main.js"]