import dgram from "dgram";
import { logger } from "logger";

const MULTICAST_ADDRESS = process.env.MULTICAST_ADDRESS || "224.1.1.1";
const MULTICAST_PORT = Number(process.env.MULTICAST_PORT || 5007);

export function setupMulticast(sensorId: string) {
  const socket = dgram.createSocket({ type: "udp4", reuseAddr: true });

  socket.on("message", (msg, rinfo) => {
    try {
      const data = JSON.parse(msg.toString());
      logger.info(`[MULTICAST] Mensagem de ${rinfo.address}: ${JSON.stringify(data)}`);
    } catch {
      logger.warn("[MULTICAST] Mensagem inválida recebida");
    }
  });

  socket.bind(MULTICAST_PORT, () => {
    socket.addMembership(MULTICAST_ADDRESS);
    logger.info(`[MULTICAST] Escutando ${MULTICAST_ADDRESS}:${MULTICAST_PORT}`);
  });

  setInterval(() => {
    // 30% de chance de emitir alerta
    if (Math.random() < 0.3) {
      const alert = {
        type: "ALERT",
        from: sensorId,
        msg: gerarAlertaAleatorio(),
        timestamp: Date.now()
      };
      const message = Buffer.from(JSON.stringify(alert));
      socket.send(message, 0, message.length, MULTICAST_PORT, MULTICAST_ADDRESS);
    }
  }, 15000);
}

function gerarAlertaAleatorio(): string {
  const mensagens = [
    "Chuva intensa detectada!",
    "Variação brusca de pressão!",
    "Alta umidade identificada!",
    "Temperatura fora do padrão!",
    "Sensor sob possível interferência!"
  ];
  return mensagens[Math.floor(Math.random() * mensagens.length)];
}
