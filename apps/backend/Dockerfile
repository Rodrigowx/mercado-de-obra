# --------------------------------------------
# Stage 1: Build (dependências de desenvolvimento)
# --------------------------------------------
    FROM node:22-alpine AS builder

    WORKDIR /app
    
    # 1. Copiar dependências
    COPY package.json package-lock.json ./
    COPY apps/backend/package.json ./apps/backend/package.json
    
    # 2. Instalar todas as dependências (incluindo dev)
    RUN npm install --workspace=backend
    
    # 3. Copiar schema do Prisma (ajuste o caminho conforme sua estrutura)
    COPY prisma ./prisma
    
    # 4. Gerar Prisma Client
    RUN npx prisma generate
    
    # 5. Copiar código fonte
    COPY apps/backend ./apps/backend
    
    # 6. Build da aplicação
    RUN npm run build --workspace=backend
    
    # --------------------------------------------
    # Stage 2: Produção (somente o necessário)
    # --------------------------------------------
    FROM node:22-alpine
    
    WORKDIR /app
    
    # 1. Instalar apenas dependências de produção
    COPY --from=builder /app/package.json /app/package-lock.json ./
    COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json
    RUN npm install --workspace=backend
    
    # 2. Copiar assets de build
    COPY --from=builder /app/apps/backend/dist ./dist
    COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
    COPY --from=builder /app/prisma ./prisma
    
    # 3. Dependências do sistema
    RUN apk add --no-cache openssl
    
    # 4. Configurações de ambiente
    ENV NODE_ENV=production
    ENV PORT=8080
    EXPOSE $PORT
    
    # 5. Iniciar aplicação
    CMD ["node", "dist/main.js"]