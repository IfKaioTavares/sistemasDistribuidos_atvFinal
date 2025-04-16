import net from "net";
import { logger } from "logger";
import { readFileSync } from "fs";
import { sign, verify } from "crypto";
import path from "path";
import { startElection } from "./election";

const HEARTBEAT_INTERVAL = 5000;
const COORDINATOR_HOST = process.env.COORDINATOR_HOST || "localhost";
const COORDINATOR_PORT = Number(process.env.COORDINATOR_PORT || 7000);
const MAX_FAILURES = 3;
let failures = 0;

function getPrivateKey(nodeId: string): string {
  return readFileSync(`/app/shared-keys/${nodeId}.private.pem`, "utf-8");
}

function getPublicKey(nodeId: string): string {
  return readFileSync(`/app/shared-keys/${nodeId}.public.pem`, "utf-8");
}


function signMessage(message: string, privateKey: string): string {
  const signature = sign("sha256", Buffer.from(message), privateKey);
  return signature.toString("base64");
}

function verifySignature(message: string, signature: string, publicKey: string): boolean {
  return verify("sha256", Buffer.from(message), publicKey, Buffer.from(signature, "base64"));
}

export function startHeartbeat(nodeId: string) {
  setInterval(() => {
    const socket = new net.Socket();

    socket.connect(COORDINATOR_PORT, COORDINATOR_HOST, () => {
      const originalPayload = {
        type: "HEARTBEAT",
        nodeId,
        timestamp: Date.now()
      };

      const privateKey = getPrivateKey(nodeId);
      const signature = signMessage(JSON.stringify(originalPayload), privateKey);

      const payload = JSON.stringify({ ...originalPayload, signature });
      socket.write(payload);
      socket.end();

      failures = 0; // reset on success
    });

    socket.on("error", () => {
      failures++;
      logger.warn(`[HEARTBEAT] Coordenador não respondeu (${COORDINATOR_HOST}:${COORDINATOR_PORT}) [${failures}/${MAX_FAILURES}]`);
      if (failures >= MAX_FAILURES) {
        logger.warn("[HEARTBEAT] Coordenador inativo. Iniciando eleição...");
        startElection(nodeId);
        failures = 0;
      }
    });
  }, HEARTBEAT_INTERVAL);

  logger.info(`[HEARTBEAT] Enviando heartbeat a cada ${HEARTBEAT_INTERVAL / 1000}s`);
}

export function startHeartbeatListener() {
  const server = net.createServer((socket) => {
    let buffer = "";

    socket.on("data", (chunk) => {
      buffer += chunk.toString();
    });

    socket.on("end", () => {
      try {
        const msg = JSON.parse(buffer);
        if (msg.type === "HEARTBEAT") {
          const { signature, ...original } = msg;
          const publicKey = getPublicKey(msg.nodeId);
          const isValid = verifySignature(JSON.stringify(original), signature, publicKey);

          if (!isValid) {
            logger.warn(`[HEARTBEAT] Assinatura inválida de ${msg.nodeId}`);
            return;
          }

          logger.debug(`[HEARTBEAT] Recebido de ${msg.nodeId}`);
        }
      } catch {
        logger.warn("[HEARTBEAT] Mensagem inválida recebida");
      }
    });
  });

  server.listen(COORDINATOR_PORT, () => {
    logger.info(`[HEARTBEAT] Escutando batimentos na porta ${COORDINATOR_PORT}`);
  });
}