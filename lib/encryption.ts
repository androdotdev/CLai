const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;

function getEncryptionKey(): Promise<CryptoKey> {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("BETTER_AUTH_SECRET is not set");

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret).slice(0, 32);
  const paddedKey = new Uint8Array(32);
  paddedKey.set(keyData);

  return crypto.subtle.importKey("raw", paddedKey, ALGORITHM, false, [
    "encrypt",
    "decrypt",
  ]);
}

export async function encrypt(text: string): Promise<string> {
  const key = await getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(text);

  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoded
  );

  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  return Buffer.from(combined).toString("base64");
}

export async function decrypt(encryptedData: string): Promise<string> {
  const key = await getEncryptionKey();
  const combined = Buffer.from(encryptedData, "base64");
  const iv = combined.subarray(0, 12);
  const data = combined.subarray(12);

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    data
  );

  return new TextDecoder().decode(decrypted);
}
