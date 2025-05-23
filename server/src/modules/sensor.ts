import { SensorData } from "shared";
import { LamportClock } from "lamport-clock";
import { logger } from "logger";

export class Sensor {
  private id: string;
  private clock: LamportClock;
  private lastData: SensorData | null;


  constructor(id: string) {
    this.id = id;
    this.clock = LamportClock.getInstance();
    this.lastData = null;
  }

  generateData(): SensorData {
    const timestamp = this.clock.tick();
    const data: SensorData = {
      temperature: parseFloat((20 + Math.random() * 10).toFixed(2)),
      humidity: parseFloat((40 + Math.random() * 20).toFixed(2)),
      pressure: parseFloat((950 + Math.random() * 50).toFixed(2)),
      timestamp,
      sensorId: this.id
    };
    logger.info(`Generated sensor data: ${JSON.stringify(data)}`);
    this.lastData = data;
    return data;
  }

  getLastData(): SensorData| null {
    return this.lastData;
  }
}
