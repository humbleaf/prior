/**
 * Encrypt genesis package with password for Claim #0
 * Uses same format as web app: [salt(16)] + [iv(12)] + [ciphertext]
 */

const fs = require('fs');
const crypto = require('crypto');

const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const KEY_LENGTH = 32;

async function encryptWithPassword(filePath, password) {
  // Read file
  const fileData = fs.readFileSync(filePath);
  
  // Generate salt and IV
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  
  // Derive key using PBKDF2
  const key = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256');
  
  // Encrypt using AES-256-GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(fileData), cipher.final()]);
  const authTag = cipher.getAuthTag(); // 16 bytes
  
  // Combine: salt + iv + ciphertext + authTag
  const combined = Buffer.concat([salt, iv, ciphertext, authTag]);
  
  // Calculate SHA-256 hash
  const hash = crypto.createHash('sha256').update(combined).digest('hex');
  
  return {
    encryptedData: combined,
    salt: salt.toString('hex'),
    iv: iv.toString('hex'),
    contentHash: '0x' + hash,
    fileSize: combined.length
  };
}

async function main() {
  const password = 'PRIOR_GENESIS_SEED';
  const inputFile = 'prior-genesis-claim-0.tar.gz';
  const outputFile = 'prior-genesis-claim-0.enc';
  
  console.log('Encrypting genesis package...');
  console.log('Password:', password);
  console.log('Input:', inputFile);
  
  const result = await encryptWithPassword(inputFile, password);
  
  // Write encrypted file
  fs.writeFileSync(outputFile, result.encryptedData);
  
  console.log('\n✅ ENCRYPTED SUCCESSFULLY');
  console.log('Output:', outputFile);
  console.log('File size:', result.fileSize, 'bytes');
  console.log('Content Hash (SHA-256):', result.contentHash);
  console.log('\nNext: Upload to IPFS via Pinata');
  console.log('Then: Update script/FileSystemClaim.s.sol with CID and hash');
}

main().catch(console.error);
