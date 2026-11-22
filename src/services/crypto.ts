// Web Cryptography API helper utilities (PBKDF2 + AES-GCM 256)

const PBKDF2_ITERATIONS = 120000;
const AES_KEY_LENGTH = 256;
const VERIFIER_CONSTANT = 'VAULT_VERIFIED_AUTHENTIC_2026';
// Static salt for emergency puzzle challenge derivation
const EMERGENCY_PUZZLE_SALT = new Uint8Array([73, 110, 116, 101, 108, 108, 105, 103, 101, 110, 99, 101, 86, 97, 117, 108]);

function getCrypto(): Crypto {
  if (typeof window !== 'undefined' && window.crypto) {
    return window.crypto;
  }
  if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    return globalThis.crypto as Crypto;
  }
  throw new Error('Web Cryptography API is not available in this environment');
}

export function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export function generateRandomBytes(length: number): Uint8Array {
  return getCrypto().getRandomValues(new Uint8Array(length));
}

/**
 * Derives an AES-GCM 256 CryptoKey from a secret string (PIN or Pattern sequence) and a salt
 */
export async function deriveKeyFromSecret(secret: string, salt: Uint8Array): Promise<CryptoKey> {
  const cryptoObj = getCrypto();
  const enc = new TextEncoder();
  const secretKeyMaterial = await cryptoObj.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return cryptoObj.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    secretKeyMaterial,
    { name: 'AES-GCM', length: AES_KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Derives the emergency rescue key from solved puzzle proof token
 */
export async function deriveEmergencyKeyFromPuzzle(puzzleSolutionToken: string): Promise<CryptoKey> {
  return deriveKeyFromSecret(`EMERGENCY_RESCUE_${puzzleSolutionToken}`, EMERGENCY_PUZZLE_SALT);
}

/**
 * Encrypts an arbitrary object into { ciphertext, iv } base64 strings using AES-GCM
 */
export async function encryptData(data: unknown, key: CryptoKey): Promise<{ ciphertext: string; iv: string }> {
  const cryptoObj = getCrypto();
  const jsonStr = JSON.stringify(data);
  const enc = new TextEncoder();
  const encodedData = enc.encode(jsonStr);
  const iv = generateRandomBytes(12);

  const encryptedBuffer = await cryptoObj.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as BufferSource,
    },
    key,
    encodedData
  );

  return {
    ciphertext: arrayBufferToBase64(encryptedBuffer),
    iv: arrayBufferToBase64(iv),
  };
}

/**
 * Decrypts an encrypted payload using AES-GCM and parses JSON
 */
export async function decryptData<T>(ciphertextBase64: string, ivBase64: string, key: CryptoKey): Promise<T> {
  const cryptoObj = getCrypto();
  const ciphertextBuffer = base64ToArrayBuffer(ciphertextBase64);
  const ivBuffer = base64ToArrayBuffer(ivBase64);

  const decryptedBuffer = await cryptoObj.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: new Uint8Array(ivBuffer),
    },
    key,
    ciphertextBuffer
  );

  const dec = new TextDecoder();
  const jsonStr = dec.decode(decryptedBuffer);
  return JSON.parse(jsonStr) as T;
}

/**
 * Creates initial vault verification token
 */
export async function createVaultVerificationToken(key: CryptoKey): Promise<{ verifierCiphertext: string; verifierIv: string }> {
  const res = await encryptData(VERIFIER_CONSTANT, key);
  return {
    verifierCiphertext: res.ciphertext,
    verifierIv: res.iv,
  };
}

/**
 * Validates whether the derived key decrypts the verification token properly
 */
export async function verifyMasterKey(key: CryptoKey, verifierCiphertext: string, verifierIv: string): Promise<boolean> {
  try {
    const decrypted = await decryptData<string>(verifierCiphertext, verifierIv, key);
    return decrypted === VERIFIER_CONSTANT;
  } catch {
    return false;
  }
}
