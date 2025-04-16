import "dotenv/config";
import { fetchSensorDataAll } from "./modules/grpc";
import { listenToAlerts } from "./modules/multicast";

fetchSensorDataAll("client-app");

setInterval(() => {
  fetchSensorDataAll("client-app");
}, 10000);

listenToAlerts();
