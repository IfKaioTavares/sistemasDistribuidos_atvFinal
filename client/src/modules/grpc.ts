import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import * as path from "path";
import { logger } from "../utils/logger";

const PROTO_PATH = path.join(__dirname, "../../proto/sensor.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const loaded = grpc.loadPackageDefinition(packageDefinition) as any;
const sensorProto = loaded.sensor;

type SensorClient = grpc.Client & {
  GetSensorData: (req: { requesterId: string }, cb: (err: any, res: any) => void) => void;
};

const targets = (process.env.GRPC_TARGETS || "").split(",");

export function fetchSensorDataAll(requesterId = "client") {
  targets.forEach((host) => {
    const client = new (sensorProto.SensorService)(
      host,
      grpc.credentials.createInsecure()
    ) as SensorClient;

    client.GetSensorData({ requesterId }, (err, response) => {
      if (err) {
        logger.warn(`[gRPC] Falha ao consultar ${host}: ${err.message}`);
        return;
      }

      logger.info(`[gRPC] Dados de ${response.sensorId}:`);
      logger.info(`         Temp: ${response.temperature}°C`);
      logger.info(`         Humidade: ${response.humidity}%`);
      logger.info(`         Pressão: ${response.pressure} hPa`);
      logger.info(`         Timestamp: ${response.timestamp}`);
    });
  });
}
