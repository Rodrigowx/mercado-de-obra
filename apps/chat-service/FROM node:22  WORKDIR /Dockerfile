FROM node:22

WORKDIR /app

# Copia apenas o código do chat-service
COPY apps/chat-service/ .

RUN npm install

EXPOSE 4000

CMD ["npm", "run", "start:prod"]
