import net from "net";
import { logger } from "logger";

const ELECTION_PORT = Number(process.env.ELECTION_PORT || 7001);
const KNOWN_NODES = (process.env.KNOWN_NODES || "").split(","); // Ex: sensor-01:7001,sensor-02:7001

let _isCoordinator = false;
let isParticipating = false;

export function startElection(nodeId: string) {
  if (isParticipating) return; // já está participando
  isParticipating = true;
  let responded = false;
  const clients: net.Socket[] = [];

  for (const node of KNOWN_NODES) {
    const [host, portStr] = node.split(":");
    const port = Number(portStr);
    if (isNaN(port) || host === nodeId) continue;

    const client = new net.Socket();
    clients.push(client);

    client.connect(port, host, () => {
      const message = JSON.stringify({ type: "ELECTION", from: nodeId });
      client.write(message);
      client.end();
      responded = true;
    });

    client.on("error", () => {
      logger.warn(`[ELECTION] Falha ao contactar ${host}`);
    });
  }

  setTimeout(() => {
    if (!responded) {
      _isCoordinator = true;
      logger.info(`[ELECTION] ${nodeId} virou COORDENADOR`);
      broadcastCoordinator(nodeId);
    }
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
          logger.info(
            `[ELECTION] Recebido pedido de eleição de ${message.from}`
          );
          startElection(nodeId); // participa
        } else if (message.type === "COORDINATOR") {
          _isCoordinator = false;
          isParticipating = false;
          logger.info(`[ELECTION] ${message.from} é o novo coordenador`);
        }
      } catch {
        logger.warn("[ELECTION] Mensagem inválida");
      }
    });
  });

  server.listen(ELECTION_PORT, () => {
    logger.info(
      `[ELECTION] Aguardando mensagens de eleição na porta ${ELECTION_PORT}`
    );
  });
}
