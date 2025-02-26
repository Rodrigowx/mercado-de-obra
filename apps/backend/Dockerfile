# Usando Node.js 22 como base
FROM node:22

# Definindo o diretório dentro do container
WORKDIR /app

# Copia os arquivos do projeto para dentro do container
COPY . .

# Instala as dependências
RUN npm install

# Expõe a porta que será usada pelo backend
EXPOSE 3000

# Comando para iniciar o backend
CMD ["npm", "run", "start:prod"]
