# --------------------------------------------
# Stage 1: Build
# --------------------------------------------
    FROM node:22-alpine AS builder

    WORKDIR /app
    
    COPY package.json package-lock.json ./
    COPY apps/chat-service/package.json ./apps/chat-service/package.json
    RUN npm install --workspace=chat-service
    
    COPY prisma ./prisma
    RUN npx prisma generate
    
    COPY apps/chat-service ./apps/chat-service
    RUN npm run build --workspace=chat-service
    
    # --------------------------------------------
    # Stage 2: Produção
    # --------------------------------------------
    FROM node:22-alpine
    
    WORKDIR /app
    
    COPY --from=builder /app/package.json /app/package-lock.json ./
    COPY --from=builder /app/apps/chat-service/package.json ./apps/chat-service/package.json
    RUN npm install --workspace=chat-service
    
    COPY --from=builder /app/apps/chat-service/dist ./dist
    COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
    COPY --from=builder /app/prisma ./prisma
    
    RUN apk add --no-cache openssl
    
    ENV NODE_ENV=production
    ENV PORT=8181
    EXPOSE $PORT
    
    CMD ["node", "dist/main.js"]