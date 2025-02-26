# Estágio de construção
FROM node:22-alpine AS builder

WORKDIR /app

# 1. Copiar dependências
COPY package.json package-lock.json ./

# 2. Instalar dependências
RUN npm ci

# 3. Copiar schema do Prisma
COPY prisma ./prisma

# 4. Gerar client do Prisma
RUN npx prisma generate

# 5. Copiar código fonte
COPY src ./src

# 6. Build da aplicação
RUN npm run build

# Estágio de produção
FROM node:22-alpine

WORKDIR /app

# 7. Copiar apenas o necessário
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# 8. Configuração final
ENV PORT=8080
EXPOSE $PORT
CMD ["node", "dist/main.js"]