/**
 * Client-side file encryption/decryption for PRIOR
 * Supports both random key generation and password-based encryption
 */

// PBKDF2 parameters for password-based key derivation
const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16; // 128 bits
const IV_LENGTH = 12; // 96 bits for AES-GCM
const KEY_LENGTH = 32; // 256 bits

/**
 * Get Web Crypto API
 */
const getCrypto = () => {
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    return window.crypto;
  }
  if (typeof crypto !== "undefined" && crypto.subtle) {
    return crypto;
  }
  if (typeof globalThis !== "undefined" && globalThis.crypto && globalThis.crypto.subtle) {
    return globalThis.crypto;
  }
  throw new Error("Web Crypto API not available");
};

/**
 * Derive AES key from password using PBKDF2
 */
export async function deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const cryptoAPI = getCrypto();
  
  // Encode password
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  
  // Import password as key material
  const keyMaterial = await cryptoAPI.subtle.importKey(
    "raw",
    passwordData,
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  
  // Derive AES-256 key
  const key = await cryptoAPI.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt.buffer,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    } as Pbkdf2Params,
    keyMaterial,
    {
      name: "AES-GCM",
      length: 256,
    } as AesDerivedKeyParams,
    false,
    ["encrypt", "decrypt"]
  );
  
  return key;
}

/**
 * Generate a random AES-256 key and export it
 */
export async function generateEncryptionKey(): Promise<{ key: CryptoKey; exportedKey: string }> {
  const cryptoAPI = getCrypto();
  
  const key = await cryptoAPI.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );

  const exportedKeyBuffer = await cryptoAPI.subtle.exportKey("raw", key);
  const exportedKey = arrayBufferToBase64(exportedKeyBuffer);

  return { key, exportedKey };
}

/**
 * Import a base64-encoded key
 */
export async function importKeyFromBase64(base64Key: string): Promise<CryptoKey> {
  const cryptoAPI = getCrypto();
  const keyData = base64ToArrayBuffer(base64Key);
  
  return await cryptoAPI.subtle.importKey(
    "raw",
    keyData,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["decrypt"]
  );
}

/**
 * Encrypt file using password-based key derivation
 * Format: [salt (16 bytes)] + [iv (12 bytes)] + [ciphertext + auth tag]
 * This is self-contained and decryptable with just the password
 */
export interface PasswordEncryptionResult {
  encryptedData: ArrayBuffer;
  salt: Uint8Array;
  iv: Uint8Array;
}

export interface RandomEncryptionResult {
  encryptedData: ArrayBuffer;
  iv: Uint8Array;
  key: CryptoKey;
  exportedKey: string;
}

export async function encryptWithPassword(
  file: File,
  password: string
): Promise<PasswordEncryptionResult> {
  const cryptoAPI = getCrypto();
  
  // Generate random salt and IV
  const salt = cryptoAPI.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = cryptoAPI.getRandomValues(new Uint8Array(IV_LENGTH));
  
  // Derive key from password
  const key = await deriveKeyFromPassword(password, salt);
  
  // Read and encrypt file
  const fileData = await file.arrayBuffer();
  const ciphertext = await cryptoAPI.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv.buffer,
    } as AesGcmParams,
    key,
    fileData
  );
  
  // Combine: salt + iv + ciphertext
  const combined = new Uint8Array(SALT_LENGTH + IV_LENGTH + ciphertext.byteLength);
  combined.set(salt, 0);
  combined.set(iv, SALT_LENGTH);
  combined.set(new Uint8Array(ciphertext), SALT_LENGTH + IV_LENGTH);
  
  return {
    encryptedData: combined.buffer,
    salt,
    iv,
  };
}

/**
 * Encrypt file using random key (legacy mode)
 * Format: [iv (12 bytes)] + [ciphertext + auth tag]
 * Key must be saved separately
 */
export async function encryptWithRandomKey(
  file: File
): Promise<RandomEncryptionResult> {
  const cryptoAPI = getCrypto();
  
  const { key, exportedKey } = await generateEncryptionKey();
  const iv = cryptoAPI.getRandomValues(new Uint8Array(IV_LENGTH));
  
  const fileData = await file.arrayBuffer();
  const ciphertext = await cryptoAPI.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv.buffer,
    } as AesGcmParams,
    key,
    fileData
  );
  
  // Combine: iv + ciphertext
  const combined = new Uint8Array(IV_LENGTH + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), IV_LENGTH);
  
  return {
    encryptedData: combined.buffer,
    iv,
    key,
    exportedKey,
  };
}

/**
 * Decrypt file using password
 * Expects format: [salt (16)] + [iv (12)] + [ciphertext + auth tag]
 */
export async function decryptWithPassword(
  encryptedData: ArrayBuffer,
  password: string
): Promise<ArrayBuffer> {
  const cryptoAPI = getCrypto();
  
  // Extract components
  const salt = new Uint8Array(encryptedData.slice(0, SALT_LENGTH));
  const iv = new Uint8Array(encryptedData.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH));
  const ciphertext = encryptedData.slice(SALT_LENGTH + IV_LENGTH);
  
  // Derive key
  const key = await deriveKeyFromPassword(password, salt);
  
  // Decrypt
  const decrypted = await cryptoAPI.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv.buffer,
    } as AesGcmParams,
    key,
    ciphertext
  );
  
  return decrypted;
}

/**
 * Decrypt file using random key
 * Expects format: [iv (12)] + [ciphertext + auth tag]
 */
export async function decryptWithRandomKey(
  encryptedData: ArrayBuffer,
  key: CryptoKey
): Promise<ArrayBuffer> {
  const cryptoAPI = getCrypto();
  
  const iv = new Uint8Array(encryptedData.slice(0, IV_LENGTH));
  const ciphertext = encryptedData.slice(IV_LENGTH);
  
  return await cryptoAPI.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv.buffer,
    } as AesGcmParams,
    key,
    ciphertext
  );
}

/**
 * Calculate SHA-256 hash of data
 */
export async function calculateFileHash(data: ArrayBuffer): Promise<string> {
  const cryptoAPI = getCrypto();
  const hashBuffer = await cryptoAPI.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Hash a password (for verification, not encryption)
 */
export async function hashPassword(password: string): Promise<string> {
  const cryptoAPI = getCrypto();
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await cryptoAPI.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Generate a filename for the key download
 */
export function generateKeyFilename(): string {
  const date = new Date().toISOString().split("T")[0];
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PRIOR-KEY-${date}-${random}.key`;
}

// Utility functions
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Legacy exports for backward compatibility with existing code
export { encryptWithPassword as encryptFile, decryptWithPassword as decryptFile };
