import dotenv from 'dotenv';
dotenv.config();

console.log(`[CLIENT] Cliente iniciado como ${process.env.NODE_ID || 'desconhecido'}`);
