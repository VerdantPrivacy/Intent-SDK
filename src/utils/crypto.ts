import * as nacl from 'tweetnacl';
import * as bs58 from 'bs58';

/**
 * Encrypts a message using a shared secret or password derived key.
 * Uses XSalsa20-Poly1305.
 */
export const encryptLocalData = (data: string, secretKey: Uint8Array): string => {
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const messageUint8 = new TextEncoder().encode(data);
  const box = nacl.secretbox(messageUint8, nonce, secretKey);

  const fullMessage = new Uint8Array(nonce.length + box.length);
  fullMessage.set(nonce);
  fullMessage.set(box, nonce.length);

  return bs58.encode(fullMessage);
};

export const decryptLocalData = (encoded: string, secretKey: Uint8Array): string => {
  const fullMessage = bs58.decode(encoded);
  const nonce = fullMessage.slice(0, nacl.secretbox.nonceLength);
  const message = fullMessage.slice(nacl.secretbox.nonceLength, fullMessage.length);

  const decrypted = nacl.secretbox.open(message, nonce, secretKey);

  if (!decrypted) {
    throw new Error("Could not decrypt data. Invalid key or corrupted data.");
  }

  return new TextDecoder().decode(decrypted);
};