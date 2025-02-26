# Usando Node.js como base
FROM node:22

# Criando diretório de trabalho dentro do container
WORKDIR /app

# Copiando apenas os arquivos package.json e package-lock.json primeiro
COPY apps/backend/package*.json ./apps/backend/

# Instalando dependências
RUN cd apps/backend && npm install

# Copiando todo o código do backend
COPY apps/backend ./apps/backend

# Mudando para a pasta correta
WORKDIR /app/apps/backend

# ✅ Gerando os tipos do Prisma antes do build
RUN npx prisma generate

# ✅ Rodando o build após a geração dos tipos
RUN npm run build --if-present

# Definindo variável de ambiente para a porta
ENV PORT=8080

# Expondo a porta correta
EXPOSE 8080

# Iniciando a aplicação no diretório correto
CMD ["sh", "-c", "npm run start:prod"]
