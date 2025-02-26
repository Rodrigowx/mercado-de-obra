# apps/chat-service/Dockerfile
FROM node:22-alpine AS builder

WORKDIR /app

# 1. Copiar configurações do projeto
COPY package.json package-lock.json tsconfig.json ./

# 2. Instalar dependências
RUN npm ci

# 3. Copiar código fonte
COPY src ./src

# 4. Build da aplicação
RUN npm run build

# Estágio de produção
FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/main.js"]