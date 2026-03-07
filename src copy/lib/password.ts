import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scrypt = promisify(scryptCallback);
const HASH_SCHEME = "scrypt";
const KEY_LENGTH = 64;

function parseHash(stored: string) {
  const [scheme, salt, keyHex] = stored.split("$");
  if (scheme !== HASH_SCHEME || !salt || !keyHex) return null;
  return { salt, keyHex };
}

export function isPasswordHash(stored: string) {
  return parseHash(stored) !== null;
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  return `${HASH_SCHEME}$${salt}$${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const parsed = parseHash(stored);

  // Legacy plain-text fallback for existing records before migration.
  if (!parsed) {
    return password === stored;
  }

  const storedKey = Buffer.from(parsed.keyHex, "hex");
  const derivedKey = (await scrypt(password, parsed.salt, KEY_LENGTH)) as Buffer;

  if (storedKey.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(storedKey, derivedKey);
}
