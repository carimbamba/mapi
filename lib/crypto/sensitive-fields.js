/**
 * Criptografia de Campos Sensíveis — AES-256-GCM
 *
 * Protege dados sensíveis (diagnósticos, descrições de logs) em repouso.
 * Formato do ciphertext: IV (12 bytes) + AuthTag (16 bytes) + Dados cifrados.
 * Tudo codificado em base64 para armazenamento no banco como texto.
 *
 * NUNCA logar plaintext. NUNCA retornar ciphertext para o cliente.
 *
 * Uso:
 *   import { encryptField, decryptField } from "@/lib/crypto/sensitive-fields";
 *   const encrypted = encryptField("Laudo TEA - Dr. Silva 2024");
 *   const decrypted = decryptField(encrypted);
 *
 * Geração da chave: openssl rand -base64 32
 * Definir no .env: ENCRYPTION_KEY=<resultado do openssl>
 */

const crypto = require("crypto");

// ─── Configuração ────────────────────────────────────────────────────────────

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits — recomendado para GCM
const AUTH_TAG_LENGTH = 16; // 128 bits — padrão GCM

/**
 * Chave de 256 bits (32 bytes) em base64.
 * Gerada via: openssl rand -base64 32
 */
function getEncryptionKey() {
  const keyBase64 = process.env.ENCRYPTION_KEY;

  if (!keyBase64) {
    // Em desenvolvimento sem ENCRYPTION_KEY: gera uma chave efêmera
    // Em produção: ISSO DEVE FALHAR
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "ENCRYPTION_KEY não definida em produção. Gere com: openssl rand -base64 32"
      );
    }
    // Dev fallback — NÃO usar em produção
    return crypto.randomBytes(32);
  }

  return Buffer.from(keyBase64, "base64");
}

// ─── Encrypt ─────────────────────────────────────────────────────────────────

/**
 * Criptografa um valor sensível com AES-256-GCM
 *
 * @param {string} value — texto plano a criptografar
 * @returns {string} — ciphertext em base64 (IV + Tag + Dados)
 */
function encryptField(value) {
  if (value === null || value === undefined || value === "") {
    return value;
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(value, "utf8", "base64");
  encrypted += cipher.final("base64");

  const authTag = cipher.getAuthTag();

  // Formato: IV:AuthTag:Ciphertext (todos em base64, separados por :)
  const result = `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted}`;

  return result;
}

// ─── Decrypt ─────────────────────────────────────────────────────────────────

/**
 * Descriptografa um valor cifrado com AES-256-GCM
 *
 * @param {string} encrypted — ciphertext em base64 (IV:Tag:Dados)
 * @returns {string} — texto plano original
 */
function decryptField(encrypted) {
  if (!encrypted || typeof encrypted !== "string") {
    return encrypted;
  }

  // Verifica se está no formato esperado (contém :)
  if (!encrypted.includes(":")) {
    // Provavelmente não está cifrado — retorna como está
    // (pode ser dado legado de antes da criptografia)
    return encrypted;
  }

  const key = getEncryptionKey();
  const parts = encrypted.split(":");

  if (parts.length !== 3) {
    throw new Error("Formato de criptografia inválido.");
  }

  const iv = Buffer.from(parts[0], "base64");
  const authTag = Buffer.from(parts[1], "base64");
  const ciphertext = parts[2];

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

// ─── Validate Key ────────────────────────────────────────────────────────────

/**
 * Verifica se a chave de criptografia está configurada corretamente.
 * Chamar no startup da aplicação.
 */
function validateEncryptionKey() {
  try {
    const key = getEncryptionKey();
    if (key.length !== 32) {
      console.error(
        `[CRYPTO] ENCRYPTION_KEY inválida: esperado 32 bytes, recebido ${key.length}.`
      );
      return false;
    }
    // Teste rápido: cifra e decifra
    const testValue = "encryption-test";
    const encrypted = encryptField(testValue);
    const decrypted = decryptField(encrypted);
    if (decrypted !== testValue) {
      console.error("[CRYPTO] Teste de criptografia falhou.");
      return false;
    }
    return true;
  } catch (err) {
    console.error("[CRYPTO] Erro ao validar chave:", err.message);
    return false;
  }
}

// ─── Exports ─────────────────────────────────────────────────────────────────

module.exports = {
  encryptField,
  decryptField,
  validateEncryptionKey,
};
