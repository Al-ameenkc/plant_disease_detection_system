/** Edge-safe signed session cookie helpers (HMAC-SHA256). */

export const SESSION_COOKIE_NAME = "agiscan_session";

const SESSION_MS = 7 * 24 * 60 * 60 * 1000;

function enc() {
  return new TextEncoder();
}

function toBase64Url(input: BufferSource): string {
  const bytes =
    input instanceof ArrayBuffer
      ? new Uint8Array(input)
      : new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]!);
  const b64 = btoa(binary);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    enc().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export function getSessionSecret(): string {
  const explicit = process.env.AUTH_SECRET?.trim();
  if (explicit) return explicit;
  const password = process.env.APP_PASSWORD?.trim();
  if (password) return `${password}:agiscan-session`;
  return "";
}

export async function createSessionToken(secret: string): Promise<string> {
  const exp = Date.now() + SESSION_MS;
  const payload = JSON.stringify({ exp });
  const payloadB64 = toBase64Url(enc().encode(payload));
  const key = await importHmacKey(secret);
  const sigBuf = await crypto.subtle.sign("HMAC", key, enc().encode(payloadB64));
  return `${payloadB64}.${toBase64Url(sigBuf)}`;
}

export async function verifySessionToken(
  token: string | undefined,
  secret: string
): Promise<boolean> {
  if (!token || !secret) return false;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return false;
  const payloadB64 = token.slice(0, dot);
  const sigB64 = token.slice(dot + 1);
  try {
    const key = await importHmacKey(secret);
    const sigBytes = fromBase64Url(sigB64);
    const signature = new Uint8Array(sigBytes.byteLength);
    signature.set(sigBytes);
    const ok = await crypto.subtle.verify("HMAC", key, signature, enc().encode(payloadB64));
    if (!ok) return false;
    const payloadJson = new TextDecoder().decode(fromBase64Url(payloadB64));
    const payload = JSON.parse(payloadJson) as { exp?: number };
    if (!payload.exp || Date.now() > payload.exp) return false;
    return true;
  } catch {
    return false;
  }
}
