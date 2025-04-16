import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";
import { Sensor } from "./sensor";
import { logger } from "logger";

const PROTO_PATH = path.join(__dirname, "../../proto/sensor.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const sensorProto = protoDescriptor.sensor;

export function startGRPCServer(sensor: Sensor) {
  const server = new grpc.Server();

  server.addService(sensorProto.SensorService.service, {
    GetSensorData: (_call: any, callback: any) => {
      const data = sensor.generateData();
      callback(null, {
        sensorId: data.sensorId,
        temperature: data.temperature,
        humidity: data.humidity,
        pressure: data.pressure,
        timestamp: data.timestamp
      });
    }
  });

  const port = process.env.GRPC_PORT || "5001";
  server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      logger.error("Erro ao iniciar servidor gRPC: " + err.message);
      return;
    }
    logger.info(`Servidor gRPC escutando na porta ${port}`);
  });
}
