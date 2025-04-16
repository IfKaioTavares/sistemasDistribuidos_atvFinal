import dotenv from 'dotenv';
dotenv.config();

console.log(`[SERVER] Sensor ${process.env.NODE_ID} iniciado nas portas:`)
console.log(` - gRPC: ${process.env.GRPC_PORT}`);
console.log(` - Socket: ${process.env.SOCKET_PORT}`);
console.log(` - Multicast: ${process.env.MULTICAST_ADDRESS}:${process.env.MULTICAST_PORT}`);
