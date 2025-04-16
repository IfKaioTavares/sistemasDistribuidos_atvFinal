export type SensorData = {
  temperature: number;
  humidity: number;
  pressure: number;
  timestamp: number;
  sensorId: string;
};

export enum SensorEventType {
  DATA = "DATA",
  HEARTBEAT = "HEARTBEAT",
  SNAPSHOT = "SNAPSHOT",
  ALERT = "ALERT"
}

export enum Role {
  MASTER = "MASTER",
  SLAVE = "SLAVE"
}
