import "dotenv/config";
import { logger } from "logger";
import { Sensor } from "./modules/sensor";
import { startGRPCServer } from "./modules/grpc";
import { startElectionListener, startElection } from "./modules/election";
import { replicateData, listenReplication } from "./modules/replication";
import { requestAccessToCriticalSection, listenToExclusion } from "./modules/exclusion";
import { startCheckpointing, loadLastCheckpoint } from "./modules/checkpoint";
import { listenForSnapshot, startSnapshot } from "./modules/snapshot";
import { startHeartbeat, startHeartbeatListener } from "./modules/heartbeat";
import { setupMulticast } from "./modules/multicast";

const nodeId = process.env.NODE_ID || "sensor-default";
const sensor = new Sensor(nodeId);

// 🔁 Restaura estado anterior se houver
const lastState = loadLastCheckpoint(nodeId);
if (lastState) {
  logger.info(`Último estado restaurado: ${JSON.stringify(lastState)}`);
}

// 🧠 Módulos de comunicação
startGRPCServer(sensor);
startElectionListener(nodeId);
listenToExclusion(nodeId);
listenReplication((replicated) => {
  logger.debug(`[RECEBIDO] ${replicated.sensorId}: ${replicated.temperature}°C`);
});
listenForSnapshot(nodeId, () => sensor.getLastData());
startHeartbeat(nodeId);
if (nodeId === "sensor-01") {
  startHeartbeatListener();
}
setupMulticast(nodeId);

// ⏲ Inicia comportamentos ativos
setInterval(() => {
  const data = sensor.generateData();
  replicateData(data);
}, 10000);

startCheckpointing(nodeId, () => sensor.getLastData());

setTimeout(() => startElection(nodeId), 10000); // tempo maior para dar tempo dos peers subirem

setTimeout(() => {
  requestAccessToCriticalSection(nodeId, () => {
    logger.info("🚨 [CRITICAL SECTION] Fazendo operação exclusiva");
    setTimeout(() => logger.info("✅ Saindo da seção crítica"), 3000);
  });
}, 10000);

setTimeout(() => {
  if (process.env.IS_COORDINATOR === "true") {
    startSnapshot(nodeId);
  }
}, 15000);
