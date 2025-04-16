FROM node:22

WORKDIR /app

COPY . .

RUN npm install

WORKDIR /app/server

CMD ["npm", "run", "dev"]
