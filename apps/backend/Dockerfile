# Usando Node.js como base
FROM node:22-alpine

# Criando diretório de trabalho dentro do container
WORKDIR /app

# ✅ Instalando OpenSSL corretamente para Prisma
RUN apk add --no-cache openssl

# ✅ Copiando apenas os arquivos essenciais para otimizar cache
COPY apps/backend/package.json apps/backend/package-lock.json ./

# ✅ Instalando as dependências de produção
RUN npm install

# ✅ Instalando o Nest CLI globalmente (caso necessário)
RUN npm install -g @nestjs/cli

# ✅ Copiando todo o código do backend diretamente para a raiz `/app/`
COPY apps/backend/ ./

# ✅ Gerando o Prisma Client antes do build (evita erros de importação)
RUN npx prisma generate

# ✅ Mudando para a pasta correta antes de compilar
WORKDIR /app

# ✅ Compilando a aplicação (agora deve funcionar)
RUN npm run build --if-present

# ✅ Definindo variável de ambiente para a porta correta
ENV PORT=8080
EXPOSE 8080

# ✅ Iniciando a aplicação garantindo que a variável PORT seja usada corretamente
CMD ["sh", "-c", "PORT=$PORT npm run start:prod"]
