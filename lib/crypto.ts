"use client";

/**
 * Client-side AES-256-GCM encryption for PRIOR
 * All encryption happens in the browser - we never see the plaintext
 */

// Get crypto API from window (browser) or fallback
const getCrypto = () => {
  console.log("Checking Web Crypto availability...");
  console.log("typeof window:", typeof window);
  console.log("typeof window?.crypto:", typeof window?.crypto);
  console.log("typeof window?.crypto?.subtle:", typeof window?.crypto?.subtle);
  console.log("typeof crypto:", typeof crypto);
  console.log("typeof globalThis?.crypto:", typeof globalThis?.crypto);
  
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    console.log("✓ Using window.crypto");
    return window.crypto;
  }
  if (typeof crypto !== "undefined" && crypto.subtle) {
    console.log("✓ Using global crypto");
    return crypto;
  }
  if (typeof globalThis !== "undefined" && globalThis.crypto && globalThis.crypto.subtle) {
    console.log("✓ Using globalThis.crypto");
    return globalThis.crypto;
  }
  throw new Error(`Web Crypto API not available. window=${typeof window}, window.crypto=${typeof window?.crypto}, globalThis.crypto=${typeof globalThis?.crypto}`);
};

export interface EncryptionResult {
  encryptedData: ArrayBuffer;
  iv: Uint8Array;
  key: CryptoKey;
  exportedKey: string; // Base64-encoded key for user download
}

/**
 * Generate a new 256-bit AES key and export it for user download
 */
export async function generateEncryptionKey(): Promise<{ key: CryptoKey; exportedKey: string }> {
  const cryptoAPI = getCrypto();
  
  // Generate AES-256 key
  const key = await cryptoAPI.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true, // extractable - user needs to download this
    ["encrypt", "decrypt"]
  );

  // Export key for user to download
  const exportedKeyBuffer = await cryptoAPI.subtle.exportKey("raw", key);
  const exportedKey = arrayBufferToBase64(exportedKeyBuffer);

  return { key, exportedKey };
}

/**
 * Encrypt a file using AES-256-GCM
 */
export async function encryptFile(
  file: File,
  key: CryptoKey
): Promise<EncryptionResult> {
  const cryptoAPI = getCrypto();
  
  // Generate random IV (96 bits for GCM)
  const iv = cryptoAPI.getRandomValues(new Uint8Array(12)) as Uint8Array;

  // Read file as ArrayBuffer
  const fileData = await file.arrayBuffer();

  // Encrypt
  const encryptedData = await cryptoAPI.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv as BufferSource,
    } as AesGcmParams,
    key,
    fileData
  );

  // Export key for user
  const exportedKeyBuffer = await cryptoAPI.subtle.exportKey("raw", key);
  const exportedKey = arrayBufferToBase64(exportedKeyBuffer);

  return {
    encryptedData,
    iv,
    key,
    exportedKey,
  };
}

/**
 * Decrypt a file (for user verification)
 */
export async function decryptFile(
  encryptedData: ArrayBuffer,
  key: CryptoKey,
  iv: Uint8Array
): Promise<ArrayBuffer> {
  const cryptoAPI = getCrypto();
  
  const decrypted = await cryptoAPI.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv as BufferSource,
    } as AesGcmParams,
    key,
    encryptedData
  );

  return decrypted;
}

/**
 * Calculate SHA-256 hash of a file (for blockchain anchoring)
 */
export async function calculateFileHash(data: ArrayBuffer): Promise<string> {
  const cryptoAPI = getCrypto();
  const hashBuffer = await cryptoAPI.subtle.digest("SHA-256", data);
  return arrayBufferToHex(hashBuffer);
}

/**
 * Import a base64-encoded key (for decryption/verification)
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
    false, // not extractable after import
    ["decrypt"]
  );
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

function arrayBufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Generate a human-readable key filename
 */
export function generateKeyFilename(): string {
  const date = new Date().toISOString().split("T")[0];
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PRIOR-KEY-${date}-${random}.key`;
}
