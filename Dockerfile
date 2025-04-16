FROM node:22

WORKDIR /app

# Copia todo o conteúdo do projeto (inclusive o entrypoint)
COPY . .

# Instala dependências
RUN npm install -g typescript
RUN npm install

# Define o NODE_ID via argumento e exporta como env
ARG NODE_ID
ENV NODE_ID=${NODE_ID}

RUN npx tsc -p server

# Copia e dá permissão ao script de entrada
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh

# Define volume para compartilhamento das chaves
VOLUME ["/app/shared-keys"]

# Muda o diretório de trabalho da aplicação
WORKDIR /app/server

# Usa o entrypoint para gerar as chaves dinamicamente e iniciar o app
ENTRYPOINT ["../entrypoint.sh"]
