## 🗂 Arquitetura Completa de Pastas

climate-distributed-system/
│
├── package.json               # Configura monorepo com workspaces
├── tsconfig.base.json         # Base de configuração TS compartilhada
├── README.md
│
├── packages/                  # Módulos compartilhados reutilizáveis
│   ├── shared/                # Tipos e enums globais
│   │   ├── src/types.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── logger/                # Logger com cores e níveis
│   ├── lamport-clock/         # LamportClock singleton
│   └── crypto-utils/          # Criptografia RSA/AES
│
├── server/                    # Aplicação de sensor (multi-instanciável)
│   ├── src/
│   │   ├── index.ts
│   │   ├── modules/
│   │   │   ├── multicast.ts
│   │   │   ├── grpc.ts
│   │   │   ├── socket.ts
│   │   │   ├── heartbeat.ts
│   │   │   ├── election.ts
│   │   │   ├── replication.ts
│   │   │   ├── exclusion.ts
│   │   │   ├── checkpoint.ts
│   │   │   └── snapshot.ts
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── client/                    # Aplicação cliente (coleta e monitoramento)
│   ├── src/
│   │   ├── index.ts
│   │   ├── modules/
│   │   │   ├── grpc.ts
│   │   │   ├── multicast.ts
│   │   │   ├── socket.ts
│   │   │   └── ui.ts
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
├── docker/                    # Orquestração com Docker Compose
│   └── docker-compose.yml
│
└── .env                       # Arquivo global opcional (usado pelo docker)


---

## 📦 Workspaces configurados na raiz

### package.json (na raiz)

json
{
  "name": "climate-distributed-system",
  "private": true,
  "workspaces": [
    "client",
    "server",
    "packages/*"
  ]
}


---

## 📝 Observações

- Cada **sensor** será uma instância do server/ com .env ou configs via Docker.
- O client/ se conecta via gRPC/sockets e escuta multicast.
- Os packages/ compartilham código comum (tipos, utilitários, logger, etc.).
- Os módulos como multicast.ts, grpc.ts, replication.ts, etc., serão implementados de forma incremental.

---

Com isso, outro chat pode continuar normalmente a implementação do projeto final com base nessa estrutura. Deseja que eu gere também o conteúdo do tsconfig.base.json para facilitar?