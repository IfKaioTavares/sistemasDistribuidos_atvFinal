FROM node:20

WORKDIR /app

COPY . .

RUN npm install

WORKDIR /app/server

CMD ["npm", "run", "dev"]
