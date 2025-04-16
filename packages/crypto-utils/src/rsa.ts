import { generateKeyPairSync, publicEncrypt, privateDecrypt } from "crypto";

export type RSAKeyPair = {
  publicKey: string;
  privateKey: string;
};

export function generateRSAKeys(): RSAKeyPair {
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "pkcs1",
      format: "pem"
    },
    privateKeyEncoding: {
      type: "pkcs1",
      format: "pem"
    }
  });

  return { publicKey, privateKey };
}

export function encryptRSA(data: string, publicKey: string): string {
  const buffer = Buffer.from(data, "utf-8");
  const encrypted = publicEncrypt(publicKey, buffer);
  return encrypted.toString("base64");
}

export function decryptRSA(encrypted: string, privateKey: string): string {
  const buffer = Buffer.from(encrypted, "base64");
  const decrypted = privateDecrypt(privateKey, buffer);
  return decrypted.toString("utf-8");
}
