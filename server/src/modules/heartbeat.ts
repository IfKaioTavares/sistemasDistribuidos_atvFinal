import net from "net";
import { logger } from "logger";

const HEARTBEAT_INTERVAL = 5000; // ms
const COORDINATOR_HOST = process.env.COORDINATOR_HOST || "localhost";
const COORDINATOR_PORT = Number(process.env.COORDINATOR_PORT || 7000);

export function startHeartbeat(nodeId: string) {
  setInterval(() => {
    const socket = new net.Socket();

    socket.connect(COORDINATOR_PORT, COORDINATOR_HOST, () => {
      const payload = JSON.stringify({
        type: "HEARTBEAT",
        nodeId,
        timestamp: Date.now()
      });
      socket.write(payload);
      socket.end();
    });

    socket.on("error", () => {
      logger.warn(`[HEARTBEAT] Coordenador não respondeu (${COORDINATOR_HOST}:${COORDINATOR_PORT})`);
    });
  }, HEARTBEAT_INTERVAL);

  logger.info(`[HEARTBEAT] Enviando heartbeat a cada ${HEARTBEAT_INTERVAL / 1000}s`);
}
