import net from "net";
import { logger } from "logger";

const ELECTION_PORT = Number(process.env.ELECTION_PORT || 7001);
const KNOWN_NODES = (process.env.KNOWN_NODES || "").split(","); // Ex: sensor-01:7001,sensor-02:7001

let _isCoordinator = false;
let isParticipating = false;
let currentCoordinator: string | null = null;

export function startElection(nodeId: string) {
  if (isParticipating) return;
  isParticipating = true;

  let lowerNodeExists = false;

  for (const node of KNOWN_NODES) {
    const [host, portStr] = node.split(":");
    const port = Number(portStr);

    if (isNaN(port) || host === nodeId || host >= nodeId) continue; // só contata nós com ID MENOR

    const client = new net.Socket();

    client.connect(port, host, () => {
      const message = JSON.stringify({ type: "ELECTION", from: nodeId });
      client.write(message);
      client.end();
      lowerNodeExists = true;
    });

    client.on("error", () => {
      logger.warn(`[ELECTION] Falha ao contactar ${host}`);
    });
  }

  setTimeout(() => {
    if (!lowerNodeExists) {
      _isCoordinator = true;
      currentCoordinator = nodeId;
      logger.info(`[ELECTION] ${nodeId} virou COORDENADOR`);
      broadcastCoordinator(nodeId);
    } else {
      logger.info(`[ELECTION] ${nodeId} aguardando o novo coordenador`);
    }

    isParticipating = false;
  }, 4000);
}

function broadcastCoordinator(nodeId: string) {
  for (const node of KNOWN_NODES) {
    const [host, portStr] = node.split(":");
    const port = Number(portStr);

    const client = new net.Socket();
    client.connect(port, host, () => {
      const msg = JSON.stringify({ type: "COORDINATOR", from: nodeId });
      client.write(msg);
      client.end();
    });

    client.on("error", () => {});
  }
}

export function startElectionListener(nodeId: string) {
  const server = net.createServer((socket) => {
    socket.on("data", (data) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === "ELECTION") {
          logger.info(`[ELECTION] Recebido pedido de eleição de ${message.from}`);
          startElection(nodeId); // participa da eleição se tiver ID menor
        } else if (message.type === "COORDINATOR") {
          _isCoordinator = false;
          isParticipating = false;
          currentCoordinator = message.from;
          logger.info(`[ELECTION] ${message.from} é o novo coordenador`);
        }
      } catch {
        logger.warn("[ELECTION] Mensagem inválida");
      }
    });
  });

  server.listen(ELECTION_PORT, () => {
    logger.info(`[ELECTION] Aguardando mensagens de eleição na porta ${ELECTION_PORT}`);
  });
}

export function getCurrentCoordinator(): string | null {
  return currentCoordinator;
}

export function isCoordinator(): boolean {
  return _isCoordinator;
}
