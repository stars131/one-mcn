import crypto from "node:crypto";

const KEY_LENGTH = 64;

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash?: string | null) {
  if (!storedHash) return false;
  const [scheme, salt, hash] = storedHash.split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, KEY_LENGTH);
  const stored = Buffer.from(hash, "hex");
  return stored.length === candidate.length && crypto.timingSafeEqual(stored, candidate);
}
