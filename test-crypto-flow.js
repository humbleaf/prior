/**
 * Test full crypto flow: Encrypt → Verify → Decrypt
 * Format: [salt(16)] + [iv(12)] + [ciphertext] + [authTag(16)]
 */

const fs = require('fs');
const crypto = require('crypto');

const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const KEY_LENGTH = 32;
const AUTH_TAG_LENGTH = 16;

async function encryptWithPassword(inputPath, outputPath, password) {
  console.log('\n=== ENCRYPTION ===');
  console.log('Input:', inputPath);
  console.log('Password:', password);
  
  const fileData = fs.readFileSync(inputPath);
  console.log('File size:', fileData.length, 'bytes');
  
  // Generate salt and IV
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  
  // Derive key
  const key = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256');
  
  // Encrypt
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(fileData), cipher.final()]);
  const authTag = cipher.getAuthTag();
  
  // Combine: salt + iv + ciphertext + authTag
  const combined = Buffer.concat([salt, iv, ciphertext, authTag]);
  
  // Calculate hash
  const hash = crypto.createHash('sha256').update(combined).digest('hex');
  
  fs.writeFileSync(outputPath, combined);
  
  console.log('Encrypted size:', combined.length, 'bytes');
  console.log('Salt:', salt.toString('hex'));
  console.log('IV:', iv.toString('hex'));
  console.log('AuthTag:', authTag.toString('hex'));
  console.log('SHA-256:', hash);
  console.log('Output:', outputPath);
  
  return { salt, iv, authTag, hash, combined };
}

async function decryptWithPassword(inputPath, outputPath, password) {
  console.log('\n=== DECRYPTION ===');
  console.log('Input:', inputPath);
  console.log('Password:', password);
  
  const encryptedData = fs.readFileSync(inputPath);
  console.log('Encrypted size:', encryptedData.length, 'bytes');
  
  // Extract components
  const salt = encryptedData.slice(0, SALT_LENGTH);
  const iv = encryptedData.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const ciphertext = encryptedData.slice(SALT_LENGTH + IV_LENGTH, encryptedData.length - AUTH_TAG_LENGTH);
  const authTag = encryptedData.slice(encryptedData.length - AUTH_TAG_LENGTH);
  
  console.log('Extracted Salt:', salt.toString('hex'));
  console.log('Extracted IV:', iv.toString('hex'));
  console.log('Extracted AuthTag:', authTag.toString('hex'));
  
  // Derive same key
  const key = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256');
  
  // Decrypt
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  
  fs.writeFileSync(outputPath, decrypted);
  
  console.log('Decrypted size:', decrypted.length, 'bytes');
  console.log('Output:', outputPath);
  
  return decrypted;
}

async function verifyIntegrity(originalPath, decryptedPath) {
  console.log('\n=== VERIFICATION ===');
  
  const original = fs.readFileSync(originalPath);
  const decrypted = fs.readFileSync(decryptedPath);
  
  const origHash = crypto.createHash('sha256').update(original).digest('hex');
  const decrHash = crypto.createHash('sha256').update(decrypted).digest('hex');
  
  console.log('Original SHA-256:', origHash);
  console.log('Decrypted SHA-256:', decrHash);
  console.log('Match:', origHash === decrHash ? '✅ YES' : '❌ NO');
  
  return origHash === decrHash;
}

async function main() {
  const password = 'PRIOR_GENESIS_SEED';
  const inputFile = 'prior-genesis-claim-0.tar.gz';
  const encryptedFile = 'test-encrypted.enc';
  const decryptedFile = 'test-decrypted.tar.gz';
  
  try {
    // Step 1: Encrypt
    await encryptWithPassword(inputFile, encryptedFile, password);
    
    // Step 2: Decrypt
    await decryptWithPassword(encryptedFile, decryptedFile, password);
    
    // Step 3: Verify
    const match = await verifyIntegrity(inputFile, decryptedFile);
    
    if (match) {
      console.log('\n🎉 FULL FLOW SUCCESSFUL!');
      console.log('The format [salt+iv+ciphertext+authTag] works correctly.');
      console.log('\nReady for IPFS upload and on-chain claim.');
    } else {
      console.log('\n❌ INTEGRITY CHECK FAILED');
    }
    
    // Cleanup test files
    fs.unlinkSync(encryptedFile);
    fs.unlinkSync(decryptedFile);
    console.log('\nTest files cleaned up.');
    
  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
    console.log('\nNote: If decryption fails, the existing .enc file may be old format (no authTag).');
  }
}

main();
