# apps/chat-service/Dockerfile
FROM node:22-alpine

WORKDIR /app

# MongoDB requer essas libs
RUN apk add --no-cache openssl libssl3 libc6-compat

COPY package*.json .
COPY prisma ./prisma

RUN npm ci && \
    npx prisma generate

COPY src ./src
COPY tsconfig*.json .

RUN npm run build

CMD ["node", "dist/main.js"]