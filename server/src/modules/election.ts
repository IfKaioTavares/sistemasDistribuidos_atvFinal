import net from "net";
import { logger } from "logger";

const ELECTION_PORT = Number(process.env.ELECTION_PORT || 7001);
const KNOWN_NODES = (process.env.KNOWN_NODES || "").split(","); // Ex: sensor-01:7001,sensor-02:7001

let isCoordinator = false;

export function startElection(nodeId: string) {
  const myNumber = parseInt(nodeId.replace(/\D/g, ""), 10);
  let higherExists = false;

  for (const node of KNOWN_NODES) {
    const [host, portStr] = node.split(":");
    const port = Number(portStr);
    const targetNumber = parseInt(host.replace(/\D/g, ""), 10);

    if (targetNumber > myNumber) {
      const client = new net.Socket();

      client.connect(port, host, () => {
        const message = JSON.stringify({ type: "ELECTION", from: nodeId });
        client.write(message);
        client.end();
        higherExists = true;
      });

      client.on("error", () => {
        logger.warn(`[ELECTION] Falha ao contactar ${host}`);
      });
    }
  }

  setTimeout(() => {
    if (!higherExists) {
      isCoordinator = true;
      logger.info(`[ELECTION] ${nodeId} virou COORDENADOR`);
      broadcastCoordinator(nodeId);
    }
  }, 3000);
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
          startElection(nodeId); // Responde participando
        } else if (message.type === "COORDINATOR") {
          isCoordinator = false;
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
