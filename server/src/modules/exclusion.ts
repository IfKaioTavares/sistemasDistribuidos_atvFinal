import dgram from "dgram";
import { logger } from "logger";
import { LamportClock } from "lamport-clock";

const MULTICAST_ADDRESS = process.env.MULTICAST_ADDRESS || "224.1.1.1";
const MULTICAST_PORT = Number(process.env.MULTICAST_PORT || 5007);
const KNOWN_NODE_COUNT = Number(process.env.KNOWN_NODE_COUNT || 3); // usado para saber quantos OKs esperar

let awaitingOkFrom = new Set<string>();
let criticalSectionCallback: (() => void) | null = null;
const clock = LamportClock.getInstance();

export function requestAccessToCriticalSection(nodeId: string, onEnter: () => void) {
  const timestamp = clock.tick();
  criticalSectionCallback = onEnter;
  awaitingOkFrom = new Set();

  const message = {
    type: "EXCLUSION_REQUEST",
    from: nodeId,
    timestamp
  };

  sendMulticast(message);
  logger.info(`[EXCLUSION] Pedido de acesso à seção crítica (timestamp: ${timestamp})`);

  // Se estiver sozinho, entra direto
  if (KNOWN_NODE_COUNT <= 1) enterCriticalSection();
}

function enterCriticalSection() {
  logger.info(`[EXCLUSION] Entrando na seção crítica`);
  criticalSectionCallback?.();
  criticalSectionCallback = null;
}

function sendOk(to: string) {
  const message = {
    type: "EXCLUSION_OK",
    to
  };
  sendMulticast(message);
}

function sendMulticast(message: object) {
  const socket = dgram.createSocket("udp4");
  const buffer = Buffer.from(JSON.stringify(message));
  socket.send(buffer, 0, buffer.length, MULTICAST_PORT, MULTICAST_ADDRESS, () => socket.close());
}

export function listenToExclusion(nodeId: string) {
  const socket = dgram.createSocket({ type: "udp4", reuseAddr: true });

  socket.on("message", (msg) => {
    try {
      const message = JSON.parse(msg.toString());

      if (message.type === "EXCLUSION_REQUEST" && message.from !== nodeId) {
        logger.info(`[EXCLUSION] Recebido pedido de ${message.from}, enviando OK`);
        sendOk(message.from);
      }

      if (message.type === "EXCLUSION_OK" && message.to === nodeId) {
        awaitingOkFrom.add(message.to);
        logger.debug(`[EXCLUSION] OK recebido de ${message.to}`);
        if (awaitingOkFrom.size >= KNOWN_NODE_COUNT - 1) {
          enterCriticalSection();
        }
      }
    } catch {
      logger.warn("[EXCLUSION] Mensagem inválida recebida");
    }
  });

  socket.bind(MULTICAST_PORT, () => {
    socket.addMembership(MULTICAST_ADDRESS);
    logger.info("[EXCLUSION] Aguardando mensagens de exclusão mútua");
  });
}
