import dgram from "dgram";
import { SensorData } from "shared";
import { logger } from "logger";

const MULTICAST_ADDRESS = process.env.MULTICAST_ADDRESS || "224.1.1.1";
const MULTICAST_PORT = Number(process.env.MULTICAST_PORT || 5007);

const receivedIds = new Set<string>(); // previne duplicatas

export function replicateData(data: SensorData) {
  const socket = dgram.createSocket("udp4");

  const message = {
    type: "REPLICATION",
    payload: data
  };

  const buffer = Buffer.from(JSON.stringify(message));
  socket.send(buffer, 0, buffer.length, MULTICAST_PORT, MULTICAST_ADDRESS, () => {
    logger.info(`[REPLICATION] Dados replicados via multicast: ${data.sensorId} @ ${data.timestamp}`);
    socket.close();
  });
}

export function listenReplication(callback: (data: SensorData) => void) {
  const socket = dgram.createSocket({ type: "udp4", reuseAddr: true });

  socket.on("message", (msg) => {
    try {
      const { type, payload } = JSON.parse(msg.toString());

      if (type === "REPLICATION" && !receivedIds.has(payload.sensorId + payload.timestamp)) {
        receivedIds.add(payload.sensorId + payload.timestamp);
        callback(payload);
        logger.info(`[REPLICATION] Dado replicado recebido de ${payload.sensorId}`);
      }
    } catch {
      logger.warn("[REPLICATION] Falha ao processar pacote multicast");
    }
  });

  socket.bind(MULTICAST_PORT, () => {
    socket.addMembership(MULTICAST_ADDRESS);
    logger.info(`[REPLICATION] Escutando replicações via multicast em ${MULTICAST_PORT}`);
  });
}
