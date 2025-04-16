import fs from "fs";
import path from "path";
import { logger } from "logger";
import { SensorData } from "shared";

const INTERVAL = Number(process.env.CHECKPOINT_INTERVAL || 30000);
const CHECKPOINT_DIR = "checkpoints";

export function startCheckpointing(nodeId: string, getState: () => SensorData) {
  if (!fs.existsSync(CHECKPOINT_DIR)) {
    fs.mkdirSync(CHECKPOINT_DIR);
  }

  setInterval(() => {
    const data = getState();
    const filePath = path.join(CHECKPOINT_DIR, `${nodeId}.json`);

    fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
      if (err) {
        logger.error(`[CHECKPOINT] Erro ao salvar estado: ${err.message}`);
      } else {
        logger.info(`[CHECKPOINT] Estado salvo em ${filePath}`);
      }
    });
  }, INTERVAL);
}

export function loadLastCheckpoint(nodeId: string): SensorData | null {
  try {
    const filePath = path.join(CHECKPOINT_DIR, `${nodeId}.json`);
    if (!fs.existsSync(filePath)) return null;

    const content = fs.readFileSync(filePath, "utf-8");
    const data: SensorData = JSON.parse(content);
    logger.info(`[CHECKPOINT] Estado restaurado de ${filePath}`);
    return data;
  } catch (err) {
    logger.warn(`[CHECKPOINT] Falha ao restaurar estado: ${err}`);
    return null;
  }
}
