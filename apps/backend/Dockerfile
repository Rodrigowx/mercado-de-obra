# Usa a imagem oficial do Node.js
FROM node:22-alpine

# Define o diretório de trabalho
WORKDIR /app

# Copia apenas arquivos essenciais para otimizar o build
COPY package.json package-lock.json ./

# Instala dependências de produção
RUN npm install --omit=dev

# Copia o backend para dentro do container
COPY apps/backend ./apps/backend

# Define o diretório de trabalho do backend
WORKDIR /app/apps/backend

# Compila a aplicação se necessário
RUN npm run build --if-present

# Expõe a porta que será usada
EXPOSE 8080

# Define a variável de ambiente PORT com o valor fornecido pelo Azure
ENV PORT=8080

# Inicia a aplicação garantindo que a porta correta seja usada
CMD ["sh", "-c", "PORT=$PORT npm run start:prod"]
