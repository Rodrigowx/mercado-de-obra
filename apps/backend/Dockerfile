# Usando Node.js como base
FROM node:22-alpine

# Criando diretório de trabalho dentro do container
WORKDIR /app

# Copiando apenas os arquivos essenciais para otimizar cache
COPY apps/backend/package.json apps/backend/package-lock.json ./

# Instalando as dependências de produção
RUN npm install --omit=dev

# Instalando o Nest CLI globalmente (se necessário)
RUN npm install -g @nestjs/cli

# Copiando todo o código do backend diretamente para a raiz `/app/`
COPY apps/backend/ ./

# Gerar Prisma Client antes do build**
RUN npx prisma generate

# Mudando para a pasta correta antes de compilar
WORKDIR /app

# Compilando a aplicação (agora deve funcionar)
RUN npx nest build

# Definindo variável de ambiente para a porta correta
ENV PORT=8080
EXPOSE 8080

# Iniciando a aplicação garantindo que a variável PORT seja usada corretamente
CMD ["sh", "-c", "npm run start:prod"]
