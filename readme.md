# 🛰️ SISD - Sistema Integrado de Sensores Distribuídos

Plataforma distribuída para monitoramento de sensores climáticos remotos com suporte a replicação de dados, eleição de coordenador, sincronização por relógio de Lamport, snapshot global, exclusão mútua, checkpoint, heartbeat, criptografia e comunicação via gRPC e multicast.

---

## 📦 Estrutura de Módulos

```bash
.
├── client/               # Aplicação cliente que consulta sensores via gRPC e escuta alertas via multicast
├── server/               # Aplicação servidor (nó sensor) com todos os módulos distribuídos
├── shared-keys/          # Volume compartilhado com chaves públicas/privadas
├── proto/                # Definições gRPC (.proto)
├── docker-compose.yml    # Orquestração dos serviços com Docker
├── entrypoint.sh         # Script de geração de chaves e inicialização do servidor
```

---

## 🧠 Funcionalidades Distribuídas

- ✅ **gRPC**: Comunicação entre cliente e sensores (`SensorService`)
- 🗳️ **Eleição de Líder (Bully Algorithm)**: Eleição automática em caso de falha
- 💓 **Heartbeat**: Verificação periódica do coordenador
- 🗃️ **Checkpoint**: Salvamento periódico de estado local
- 🧠 **Snapshot Global (Chandy-Lamport)**: Captura de estado global coordenado
- 🛰️ **Multicast**: Comunicação em grupo (alertas, exclusão mútua, replicação)
- 🔐 **Criptografia**: Assinatura digital dos heartbeats
- 🕐 **Relógio de Lamport**: Ordenação lógica dos eventos distribuídos
- 🔒 **Exclusão Mútua**: Acesso coordenado a seções críticas
- 🌩️ **Replicação de Dados**: Reenvio periódico dos dados dos sensores

---

## 🚀 Como Executar

### Pré-requisitos
- Docker e Docker Compose instalados

### Passos

1. Clone o repositório:
   ```bash
   git clone https://github.com/IfKaioTavares/sistemasDistribuidos_atvFinal.git
   ```

2. Compile os projetos:
   ```bash
   docker-compose build
   ```

3. Suba os contêineres:
   ```bash
   docker-compose up
   ```

4. Acompanhe os logs:
   ```bash
   docker logs -f sensor-01
   ```

---

## 🔑 Geração de Chaves

As chaves RSA de cada nó são geradas automaticamente no primeiro boot via script `entrypoint.sh` e armazenadas em `/app/shared-keys`.

---

## 🧪 Simulação e Comportamento

- Os sensores enviam dados a cada 10s.
- Heartbeat enviado a cada 5s.
- Eleição disparada se o coordenador falhar 3 vezes consecutivas.
- Snapshot global disparado por sensores com `IS_COORDINATOR=true`.
- Exclusão mútua simulada com operação crítica após 10s.
- Replicações e alertas são multicastados e salvos localmente.
- Checkpoint de estado salvo a cada 30s.

---

## 📡 Ambiente de Rede

- Comunicação via:
  - **TCP (Sockets)**: Eleição, Heartbeat
  - **UDP (Multicast)**: Exclusão mútua, Snapshot, Replicação, Alertas
  - **gRPC**: Leitura de dados dos sensores

---

## 📁 Módulos Internos

- `sensor.ts`: Lógica de geração de dados
- `checkpoint.ts`: Salvamento/restauração de estado
- `election.ts`: Algoritmo de eleição Bully
- `heartbeat.ts`: Comunicação com coordenador
- `replication.ts`: Envio/escuta de dados
- `snapshot.ts`: Captura de estado global
- `exclusion.ts`: Exclusão mútua via multicast
- `grpc.ts`: API gRPC para consulta
- `multicast.ts`: Escuta de alertas e mensagens

---

## 🔧 Variáveis de Ambiente (exemplo)

```env
NODE_ID=sensor-01
GRPC_PORT=5001
SOCKET_PORT=6001
MULTICAST_ADDRESS=224.1.1.1
MULTICAST_PORT=5007
CHECKPOINT_INTERVAL=30000
ELECTION_PORT=7001
COORDINATOR_HOST=sensor-01
COORDINATOR_PORT=7000
KNOWN_NODES=sensor-02:7001,sensor-03:7001
KNOWN_NODE_COUNT=3
IS_COORDINATOR=false
```

---

## 🐳 Orquestração Docker

- Cada `sensor` é um contêiner com configuração própria
- Todos compartilham um volume de chaves (`shared-keys`)
- O `client` consulta sensores via gRPC e exibe alertas

---

## 🧩 Tecnologias

- Node.js + TypeScript
- Docker & Docker Compose
- gRPC + Proto3
- Sockets TCP/UDP
- Criptografia RSA (crypto)
- Multicast UDP
- Relógio de Lamport