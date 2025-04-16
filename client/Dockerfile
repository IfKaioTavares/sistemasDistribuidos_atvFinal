FROM node:22

WORKDIR /app

COPY ../tsconfig.base.json ./tsconfig.base.json
COPY . .

RUN npm install

CMD ["npm", "run", "dev"]
