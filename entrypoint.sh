#!/bin/sh

# Garante que a variável NODE_ID está definida
if [ -z "$NODE_ID" ]; then
  echo "❌ NODE_ID não definido"
  exit 1
fi

# Gera as chaves se ainda não existem
node ../dist/scripts/gen-keys.js

# Inicia a aplicação
npm run dev
