import *  as dgram from "dgram";
import { logger } from "../utils/logger";

const MULTICAST_ADDRESS = process.env.MULTICAST_ADDRESS || "224.1.1.1";
const MULTICAST_PORT = Number(process.env.MULTICAST_PORT || 5007);

export function listenToAlerts() {
  const socket = dgram.createSocket({ type: "udp4", reuseAddr: true });

  socket.on("message", (msg, rinfo) => {
    try {
      const data = JSON.parse(msg.toString());

      if (data.type === "ALERT") {
        logger.info(`[ALERTA] ${data.from}: ${data.msg}`);
      }
    } catch {
      logger.warn("[MULTICAST] Mensagem inválida recebida");
    }
  });

  socket.bind(MULTICAST_PORT, () => {
    socket.addMembership(MULTICAST_ADDRESS);
    logger.info(`[MULTICAST] Escutando alertas em ${MULTICAST_ADDRESS}:${MULTICAST_PORT}`);
  });
}
