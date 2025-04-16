import dgram from "dgram";
import fs from "fs";
import path from "path";
import { SensorData } from "shared";
import { logger } from "logger";

const MULTICAST_ADDRESS = process.env.MULTICAST_ADDRESS || "224.1.1.1";
const MULTICAST_PORT = Number(process.env.MULTICAST_PORT || 5007);
const SNAPSHOT_DIR = "snapshots";

let snapshotStarted = false;
let recordedMessages: SensorData[] = [];

export function listenForSnapshot(nodeId: string, getState: () => SensorData) {
  const socket = dgram.createSocket({ type: "udp4", reuseAddr: true });

  socket.on("message", (msg) => {
    try {
      const { type, from, payload } = JSON.parse(msg.toString());

      if (type === "SNAPSHOT_START" && !snapshotStarted) {
        snapshotStarted = true;
        logger.info(`[SNAPSHOT] Iniciando snapshot solicitado por ${from}`);

        // 1. Salvar estado local
        const localState = getState();
        if (!fs.existsSync(SNAPSHOT_DIR)) fs.mkdirSync(SNAPSHOT_DIR);
        fs.writeFileSync(
          path.join(SNAPSHOT_DIR, `${nodeId}-local.json`),
          JSON.stringify(localState, null, 2)
        );

        // 2. Enviar marcador
        sendMulticast({ type: "SNAPSHOT_MARKER", from: nodeId });

        // 3. Começar a gravar mensagens (simplesmente armazenar)
        recordedMessages = [];
        setTimeout(() => {
          fs.writeFileSync(
            path.join(SNAPSHOT_DIR, `${nodeId}-messages.json`),
            JSON.stringify(recordedMessages, null, 2)
          );
          logger.info(`[SNAPSHOT] Snapshot concluído e salvo.`);
          snapshotStarted = false;
        }, 5000); // tempo para coletar mensagens em trânsito
      }

      // Se já começou o snapshot e recebeu REPLICATION, gravar mensagem
      if (snapshotStarted && type === "REPLICATION") {
        recordedMessages.push(payload);
      }

    } catch {
      logger.warn("[SNAPSHOT] Erro ao processar mensagem");
    }
  });

  socket.bind(MULTICAST_PORT, () => {
    socket.addMembership(MULTICAST_ADDRESS);
    logger.info("[SNAPSHOT] Aguardando mensagens de snapshot");
  });
}

export function startSnapshot(nodeId: string) {
  const msg = {
    type: "SNAPSHOT_START",
    from: nodeId
  };
  sendMulticast(msg);
}

function sendMulticast(msg: object) {
  const socket = dgram.createSocket("udp4");
  const buffer = Buffer.from(JSON.stringify(msg));
  socket.send(buffer, 0, buffer.length, MULTICAST_PORT, MULTICAST_ADDRESS, () => socket.close());
}
