# Usando Node.js como base
FROM node:22

# Criando diretório de trabalho dentro do container
WORKDIR /app

# Copiando apenas os arquivos do Chat-Service primeiro (para otimizar cache)
COPY apps/chat-service/package*.json ./apps/chat-service/

# Instalando as dependências apenas do Chat-Service
RUN cd apps/chat-service && npm install

# Copiando todo o código do Chat-Service
COPY apps/chat-service ./apps/chat-service

# Mudando para a pasta correta
WORKDIR /app/apps/chat-service

# Rodando build (se necessário)
RUN npm run build --if-present

# Definindo variável de ambiente para a porta
ENV PORT=8080

# Expondo a porta correta
EXPOSE 8080

# Iniciando a aplicação no diretório correto
CMD ["sh", "-c", "npm run start:prod"]
