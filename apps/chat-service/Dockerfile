# Usando Node.js como base
FROM node:22-alpine

# Criando diretório de trabalho dentro do container
WORKDIR /app

# Copiando apenas os arquivos de dependências do Chat-Service primeiro (para otimizar cache)
COPY apps/chat-service/package*.json apps/chat-service/

# Instalando apenas as dependências de produção
WORKDIR /app/apps/chat-service
RUN npm install --only=production

# Copiando o restante do código da aplicação
COPY apps/chat-service/ .

# Compilando a aplicação (se necessário)
RUN npm run build --if-present

# Definindo a variável de ambiente correta (Azure define automaticamente $PORT)
ENV PORT=8080

# Expondo a porta correta
EXPOSE 8080

# Iniciando a aplicação garantindo que a variável PORT seja usada corretamente
CMD ["npm", "run", "start:prod"]
