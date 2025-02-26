# Usando Node.js como base
FROM node:22

# Criando diretório de trabalho dentro do container
WORKDIR /app

# Copiando apenas os arquivos de backend primeiro (para otimizar cache)
COPY apps/backend/package*.json ./apps/backend/

# Instalando as dependências apenas do backend
RUN cd apps/backend && npm install

# Copiando todo o código do backend
COPY apps/backend ./apps/backend

# Mudando para a pasta correta
WORKDIR /app/apps/backend

# Rodando build (se necessário)
RUN npm run build --if-present

# Definindo variável de ambiente para a porta
ENV PORT=8080

# Expondo a porta correta
EXPOSE 8080

# Iniciando a aplicação no diretório correto
CMD ["sh", "-c", "npm run start:prod"]
