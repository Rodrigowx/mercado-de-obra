# Estágio de build
FROM node:22-alpine AS builder

WORKDIR /app

# 1. Copiar package.json da raiz e do workspace
COPY ../../package.json ../../package-lock.json ./
COPY ./package.json ./apps/backend/package.json

# 2. Instalar dependências
RUN npm install --workspace=backend

# 3. Copiar código e schema do Prisma
COPY ../../apps/backend/prisma ./prisma
COPY ../../apps/backend .

# 4. Gerar client do Prisma
RUN npx prisma generate

# 5. Build da aplicação
RUN npm run build

# Estágio de produção
FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 8080
CMD ["node", "dist/main.js"]