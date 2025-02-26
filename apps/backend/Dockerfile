# --------------------------------------------
# Stage 1: Build (dependências de desenvolvimento)
# --------------------------------------------
    FROM node:22-alpine AS builder

    WORKDIR /app

    # Copiar package.json da raiz
    COPY package.json package-lock.json ./
    
    # Copiar workspace específico
    COPY apps/backend/package.json ./apps/backend/package.json
    
    # Instalar dependências
    RUN npm install --workspace=backend
    
    # Copiar schema do Prisma
    COPY prisma ./prisma
    
    # Gerar client
    RUN npx prisma generate
    
    # Copiar código fonte
    COPY apps/backend ./apps/backend
    
    # Build
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