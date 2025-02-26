# Usa a imagem do Node.js 22
FROM node:22

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia apenas o código do backend
COPY apps/backend/ .  

# Instala as dependências
RUN npm install

# Expõe a porta usada pelo backend
EXPOSE 3000

# Comando para iniciar o backend
CMD ["npm", "run", "start:prod"]
