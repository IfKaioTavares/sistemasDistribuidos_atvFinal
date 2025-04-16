import { generateKeyPairSync } from "crypto";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const nodeId = process.env.NODE_ID;
if (!nodeId) throw new Error("NODE_ID não definido");

const dir = "/app/shared-keys";
const privPath = `${dir}/${nodeId}.private.pem`;
const pubPath = `${dir}/${nodeId}.public.pem`;

if (!existsSync(privPath) || !existsSync(pubPath)) {
  mkdirSync(dir, { recursive: true });

  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });

  writeFileSync(privPath, privateKey);
  writeFileSync(pubPath, publicKey);

  console.log(`✅ Chaves geradas para ${nodeId}`);
} else {
  console.log(`🔐 Chaves já existem para ${nodeId}`);
}
