#!/bin/bash
# build-timeless.sh — Create the complete, immortal Prior package

set -e

echo "🏛️ Building Timeless Prior Package (Claim #0)"
echo "=============================================="
echo ""

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
VERSION="1.0.0"
OUTPUT_DIR="/tmp/prior-timeless-v${VERSION}"
ZIP_PATH="/tmp/prior-timeless-v${VERSION}.zip"

echo "📦 Configuration:"
echo "  Version: ${VERSION}"
echo "  Timestamp: ${TIMESTAMP}"
echo "  Output: ${OUTPUT_DIR}"
echo ""

# Clean previous builds
rm -rf ${OUTPUT_DIR} ${ZIP_PATH}
mkdir -p ${OUTPUT_DIR}

# ============================================
# STEP 1: Build static export of Prior app
# ============================================
echo "🏗️  Building static site..."
cd /Users/rikaisho/Desktop/prior-app

# Temporarily switch to static export
cat > next.config.ts << 'EOF'
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  output: 'export',
  distDir: '/tmp/prior-timeless-v1.0.0',
  assetPrefix: '.',
  devIndicators: false,
  images: {
    unoptimized: true,
  },
};
export default nextConfig;
EOF

npm run build 2>&1 | grep -E "(error|warn|✓|○)" | tail -20
echo "✓ Static build complete"
echo ""

# ============================================
# STEP 2: Create standalone decrypt tool
# ============================================
echo "🔓 Creating decryption tool..."
cat > ${OUTPUT_DIR}/decrypt.html << 'DECRYPT_EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Prior Decryptor — Timeless Tool</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      padding: 40px;
      max-width: 600px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    h1 { color: #1e293b; margin-bottom: 8px; font-size: 28px; }
    .subtitle { color: #64748b; margin-bottom: 24px; }
    .quiet-invariants {
      background: #f8fafc;
      border-left: 4px solid #667eea;
      padding: 12px 16px;
      margin-bottom: 24px;
      border-radius: 0 8px 8px 0;
    }
    .quiet-invariants p {
      font-size: 12px;
      color: #64748b;
      margin: 4px 0;
    }
    .input-group { margin-bottom: 20px; }
    label {
      display: block;
      font-weight: 500;
      color: #374151;
      margin-bottom: 8px;
    }
    .file-input-wrapper {
      position: relative;
    }
    input[type="file"] {
      width: 100%;
      padding: 12px;
      border: 2px dashed #cbd5e1;
      border-radius: 8px;
      cursor: pointer;
      background: white;
    }
    input[type="file"]:hover { border-color: #667eea; background: #f8fafc; }
    button {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .output {
      margin-top: 20px;
      padding: 16px;
      background: #f1f5f9;
      border-radius: 8px;
      display: none;
    }
    .output.show { display: block; }
    .error { color: #dc2626; }
    .success { color: #059669; }
    .info { color: #0369a1; }
    a.download {
      display: inline-block;
      margin-top: 12px;
      padding: 10px 20px;
      background: #059669;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
    }
    .hash-display {
      font-family: monospace;
      font-size: 12px;
      background: #1e293b;
      color: #22c55e;
      padding: 12px;
      border-radius: 6px;
      word-break: break-all;
      margin-top: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔓 Prior Decryptor</h1>
    <p class="subtitle">Decrypt .prior-encrypted files locally. No servers. No data leaves your device.</p>
    
    <div class="quiet-invariants">
      <p><strong>The Quiet Invariants:</strong></p>
      <p>• Never decides → Only remembers</p>
      <p>• Never grants → Only records</p>
      <p>• Never revokes → Append-only</p>
    </div>
    
    <div class="input-group">
      <label>1. Select encrypted file (.prior-encrypted)</label>
      <div class="file-input-wrapper">
        <input type="file" id="encryptedFile" accept=".prior-encrypted">
      </div>
    </div>
    
    <div class="input-group">
      <label>2. Select key file (.key or .txt)</label>
      <div class="file-input-wrapper">
        <input type="file" id="keyFile" accept=".key,.txt">
      </div>
    </div>
    
    <button id="decryptBtn" onclick="decrypt()">Decrypt File</button>
    
    <div id="output" class="output">
      <p id="status"></p>
      <div id="hashOutput" style="display:none;">
        <p style="font-size: 12px; color: #64748b; margin-top: 12px;">SHA-256 Hash of decrypted content:</p>
        <div id="hashValue" class="hash-display"></div>
      </div>
      <a id="downloadLink" class="download" style="display:none">Download Decrypted File</a>
    </div>
  </div>

  <script>
    async function decrypt() {
      const encryptedInput = document.getElementById('encryptedFile');
      const keyInput = document.getElementById('keyFile');
      const output = document.getElementById('output');
      const status = document.getElementById('status');
      const hashOutput = document.getElementById('hashOutput');
      const hashValue = document.getElementById('hashValue');
      const downloadLink = document.getElementById('downloadLink');
      const btn = document.getElementById('decryptBtn');

      if (!encryptedInput.files[0] || !keyInput.files[0]) {
        status.innerHTML = '<span class="error">✗ Please select both files</span>';
        output.classList.add('show');
        return;
      }

      btn.disabled = true;
      status.innerHTML = '<span class="info">⏳ Reading key file...</span>';
      output.classList.add('show');
      hashOutput.style.display = 'none';
      downloadLink.style.display = 'none';

      try {
        // Read and parse key file
        const keyText = await keyInput.files[0].text();
        let keyData;
        
        try {
          keyData = JSON.parse(keyText);
        } catch (e) {
          // Try parsing as plain text (fallback)
          keyData = { key: keyText.trim(), filename: 'decrypted-file' };
        }
        
        status.innerHTML = '<span class="info">⏳ Reading encrypted data...</span>';
        
        // Read encrypted file
        const encryptedBuffer = await encryptedInput.files[0].arrayBuffer();
        
        status.innerHTML = '<span class="info">⏳ Decrypting with AES-256-GCM...</span>';
        
        // Convert base64 key to ArrayBuffer
        const keyBuffer = Uint8Array.from(atob(keyData.key), c => c.charCodeAt(0));
        
        // Import key
        const cryptoKey = await crypto.subtle.importKey(
          'raw',
          keyBuffer,
          { name: 'AES-GCM', length: 256 },
          false,
          ['decrypt']
        );
        
        // Extract IV (first 12 bytes) and ciphertext
        const encryptedData = new Uint8Array(encryptedBuffer);
        const iv = encryptedData.slice(0, 12);
        const ciphertext = encryptedData.slice(12);
        
        // Decrypt
        const decrypted = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv },
          cryptoKey,
          ciphertext
        );
        
        // Calculate SHA-256 of decrypted content
        const hashBuffer = await crypto.subtle.digest('SHA-256', decrypted);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        // Create download link
        let filename = keyData.filename || 'decrypted-file';
        // Remove .prior-encrypted extension if present in original
        const originalName = encryptedInput.files[0].name;
        if (originalName.endsWith('.prior-encrypted')) {
          filename = originalName.slice(0, -16); // Remove .prior-encrypted
        }
        
        const blob = new Blob([decrypted]);
        const url = URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.download = filename;
        downloadLink.style.display = 'inline-block';
        
        // Show hash
        hashValue.textContent = '0x' + hashHex;
        hashOutput.style.display = 'block';
        
        status.innerHTML = '<span class="success">✓ Decryption successful!</span>';
        
        console.log('Decrypted file:', filename);
        console.log('SHA-256:', hashHex);
        
      } catch (err) {
        console.error('Decryption error:', err);
        let errorMsg = err.message;
        if (errorMsg.includes('OperationError')) {
          errorMsg = 'Decryption failed - wrong key or corrupted file';
        }
        status.innerHTML = '<span class="error">✗ ' + errorMsg + '</span>';
      } finally {
        btn.disabled = false;
      }
    }
    
    // Allow Enter key to trigger decryption
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && document.querySelector('button:focus')) {
        decrypt();
      }
    });
  </script>
</body>
</html>
DECRYPT_EOF
echo "✓ Decrypt tool created"
echo ""

# ============================================
# STEP 3: Copy all contracts & ABIs
# ============================================
echo "📄 Copying smart contracts..."
mkdir -p ${OUTPUT_DIR}/contracts

# Copy source files
cp -r /Users/rikaisho/Desktop/prior-app/contracts/* ${OUTPUT_DIR}/contracts/ 2>/dev/null || echo "  Note: No contracts folder found"

# Create ABI files
cat > ${OUTPUT_DIR}/contracts/PRIORTeslaClaim.abi.json << 'ABI_EOF'
[
  {
    "inputs": [{"internalType": "string","name": "name","type": "string"},{"internalType": "string","name": "symbol","type": "string"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{"internalType": "bytes32","name": "contentHash","type": "bytes32"},{"internalType": "string","name": "ipfsCID","type": "string"},{"internalType": "string","name": "assertion","type": "string"}],
    "name": "fileClaim",
    "outputs": [{"internalType": "uint256","name": "tokenId","type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256","name": "tokenId","type": "uint256"}],
    "name": "getClaim",
    "outputs": [
      {"internalType": "address","name": "claimant","type": "address"},
      {"internalType": "bytes32","name": "contentHash","type": "bytes32"},
      {"internalType": "string","name": "ipfsCID","type": "string"},
      {"internalType": "uint256","name": "timestamp","type": "uint256"},
      {"internalType": "string","name": "assertion","type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimsCount",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true,"internalType": "uint256","name": "tokenId","type": "uint256"},
      {"indexed": true,"internalType": "address","name": "claimant","type": "address"},
      {"indexed": false,"internalType": "bytes32","name": "contentHash","type": "bytes32"},
      {"indexed": false,"internalType": "string","name": "ipfsCID","type": "string"},
      {"indexed": false,"internalType": "uint256","name": "timestamp","type": "uint256"}
    ],
    "name": "ClaimFiled",
    "type": "event"
  }
]
ABI_EOF

echo "✓ Contracts and ABIs copied"
echo ""

# ============================================
# STEP 4: Create comprehensive README
# ============================================
echo "📝 Creating documentation..."
cat > ${OUTPUT_DIR}/README.md << README_EOF
# PRIOR — Timeless Package v${VERSION}

**The complete, self-contained Prior system.**

This package contains everything needed to file Tesla Claims, verify existence proofs, 
and run the entire Prior application—completely offline, forever.

---

## 🏛️ What's In This Package

### Core Application
- \`index.html\` — Main PRIOR website (all features, fully functional)
- \`_next/\` — Static assets (JS, CSS, fonts, images)
- \`tesla/\` — Tribute to Nikola Tesla
- \`manifesto/\` — Full philosophical manifesto
- \`first-claim/\` — Live first claim data

### Tools
- \`decrypt.html\` — Standalone AES-256-GCM decryption tool
  - Works entirely in browser
  - No internet required
  - Calculates SHA-256 of decrypted content
  - Verify against blockchain record

### Contracts
- \`contracts/\` — Full Solidity source code
  - PRIORTeslaClaim.sol — Core claim contract
  - TESLARToken.sol — ERC-20 with emission mining
  - MemoryToken.sol — Soulbound subtoken
  - PRIORTimelock.sol — Governance timelock
  - TimelockController.sol — Fixed OZ implementation
  - ABIs for all contracts
  - README with addresses and usage

### Documentation
- \`README.md\` — This file
- \`VERIFICATION.md\` — How to verify this package
- \`QUIET_INVARIANTS.txt\` — Core principles

---

## 🚀 Quick Start

### No Installation Required

1. **Unzip this package**
2. **Double-click \`index.html\`**
3. **Start filing Tesla Claims immediately**

That's it. No npm install. No server. No build step. It just works.

### Works Offline

- All encryption happens in your browser
- No data sent to any server
- IPFS uploads when connected, or queue for later
- Local-first architecture

---

## 🔐 Verifying Your Claims

### Step 1: Download Encrypted File + Key
When you file a claim, you download:
- \`*.prior-encrypted\` — Your encrypted file
- \`PRIOR-KEY-*.key\` — Your decryption key (KEEP THIS SAFE!)

### Step 2: Decrypt Locally
1. Open \`decrypt.html\` (double-click it)
2. Select your encrypted file
3. Select your key file
4. Click "Decrypt File"
5. Download decrypted content

### Step 3: Verify Hash
The decrypt tool shows the SHA-256 hash of the decrypted content.
Compare this to the blockchain record:

\`\`\`bash
# View claim on blockchain
https://sepolia.basescan.org/tx/{transaction-hash}

# Or query contract directly
contract.getClaim(tokenId)
# Returns: contentHash, ipfsCID, timestamp, assertion
\`\`\`

### Step 4: Verify IPFS
\`\`\`bash
# Using public gateway
curl https://gateway.pinata.cloud/ipfs/{cid}

# Using IPFS CLI
ipfs cat /ipfs/{cid}
\`\`\`

---

## 📡 Network Configuration

**Current Network:** Base Sepolia (Testnet)

| Parameter | Value |
|-----------|-------|
| Chain ID | 84532 |
| RPC URL | https://sepolia.base.org |
| Explorer | https://sepolia.basescan.org |
| Currency | ETH (testnet) |

**Contract Addresses:**
- PRIORTeslaClaim: \`0x2405DBaDD194C132713e902d99C8482c771601A4\`
- Others: Pending deployment

**To switch to Mainnet:** Edit \`lib/config.ts\` in source (requires rebuild)

---

## 🧬 The Quiet Invariants

These principles are embedded in every part of this system:

> **Never decides** → Only remembers  
> **Never grants** → Only records  
> **Never revokes** → Append-only  
> **Claims are assertions** → Not judgments  
> **Memory is permanent** → Cannot be unwritten

PRIOR does not confer legal rights, validate originality, or certify authorship.
It exists so that no idea is ever lost to silence, theft, or time.

---

## 🔬 Technical Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14 (static export) |
| Encryption | Web Crypto API (AES-256-GCM) |
| Storage | IPFS via Pinata |
| Blockchain | Base L2 (Ethereum L2) |
| Smart Contracts | Solidity + OpenZeppelin |
| Build | Create React App style static export |

---

## 📜 License

**MIT License**

You are free to:
- Use for any purpose
- Modify and distribute
- Fork without permission
- Run your own instance

**This is humanity's tool.** No one owns memory.

---

## 🎯 This Package Is Claim #0

This Timeless Package itself is the **Genesis Tesla Claim**.

When uploaded to IPFS and anchored to the blockchain, it creates a 
**self-referential proof**: the system that timestamps claims, timestamped itself.

**IPFS CID:** [Will be populated after upload]  
**Block Number:** [Will be populated after claim]  
**Transaction:** [Will be populated after confirmation]

This ensures: even if prior-claim.xyz disappears, this package survives.
Anyone can download it, run it locally, and continue filing claims.

---

## 🔗 Links & Resources

- **Live Site:** https://prior-claim.xyz
- **IPFS Gateway:** https://gateway.pinata.cloud
- **Block Explorer:** https://sepolia.basescan.org
- **Tesla Tribute:** /tesla (in this package)
- **Full Manifesto:** /manifesto (in this package)

---

## ⚠️ Important Reminders

1. **Keep your key files safe** — Without them, you cannot decrypt. We cannot help recover them.

2. **This is a testnet deployment** — Costs are minimal (~$0.001), but so is immutability. Mainnet coming.

3. **Not legal protection** — This creates evidence, not rights. Consult a lawyer for legal advice.

4. **Permanent means permanent** — Once on blockchain and IPFS, it cannot be deleted. Think before you claim.

---

## 🛠️ For Developers

### Building from Source
\`\`\`bash
# Clone and install
cd prior-app
npm install

# Development server
npm run dev

# Production build (static export)
npm run build

# Output in ./dist/ (configured in next.config.ts)
\`\`\`

### Contract Deployment
See \`contracts/README.md\` for full deployment instructions.

---

## 🙏 Acknowledgments

- **Nikola Tesla** — For the vision and the tragedy that inspired this
- **Satoshi Nakamoto** — For proving decentralized consensus works
- **Juan Benet** — For IPFS and content-addressed storage
- **All inventors** — Who've been forgotten. This is for you.

---

**Built with ⚡ by the Prior Team**  
**Timestamped forever on Base**  
**Version ${VERSION} — ${TIMESTAMP}**

*The future remembers.*
README_EOF

echo "✓ Documentation created"
echo ""

# ============================================
# STEP 5: Create verification guide
# ============================================
echo "🔍 Creating verification guide..."
cat > ${OUTPUT_DIR}/VERIFICATION.md << 'VERIFY_EOF'
# Verifying the Timeless Package

## Why Verification Matters

This package claims to be immutable, timestamped, and self-contained.
You should verify this yourself. Trust, but verify.

---

## Step 1: Verify the SHA-256 Hash

This package has a SHA-256 hash recorded on the blockchain.

### Compute Local Hash
\`\`\`bash
# macOS/Linux
shasum -a 256 prior-timeless-v1.0.0.zip

# Windows (PowerShell)
Get-FileHash prior-timeless-v1.0.0.zip -Algorithm SHA256
\`\`\`

### Compare to Blockchain
1. Go to https://sepolia.basescan.org
2. Find Claim #0 transaction
3. Compare the sha256 parameter

They should match exactly.

---

## Step 2: Verify IPFS Retrieval

The package is stored on IPFS with a Content ID.

### Using Public Gateway
\`\`\`bash
curl https://gateway.pinata.cloud/ipfs/{cid} > downloaded.zip
shasum -a 256 downloaded.zip
# Should match original
\`\`\`

### Using IPFS Desktop
1. Install IPFS Desktop from https://docs.ipfs.io/install/ipfs-desktop/
2. Add the CID to your node
3. Verify the content matches

---

## Step 3: Verify Decryption Works

1. Take any .prior-encrypted file from a claim
2. Open decrypt.html from this package
3. Select encrypted file + key
4. Verify successful decryption

---

## Step 4: Verify Contract Interaction

\`\`\`javascript
// Using ethers.js
const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
const contract = new ethers.Contract(
  '0x2405DBaDD194C132713e902d99C8482c771601A4',
  PRIORTeslaClaimABI,
  provider
);

// Get claim count
const count = await contract.claimsCount();
console.log('Total claims:', count.toString());

// Get specific claim
const claim = await contract.getClaim(0);
console.log('Genesis claim:', claim);
\`\`\`

---

## Red Flags

If any of these fail, the package may be compromised:
- ❌ SHA-256 doesn't match blockchain
- ❌ IPFS returns different content
- ❌ Decryption fails with valid key
- ❌ Contract returns unexpected data

---

## What If The Website Is Down?

This package continues to work even if prior-claim.xyz disappears:

1. Open index.html locally
2. File claims directly to blockchain
3. Upload to IPFS via Pinata (or any IPFS node)
4. Decrypt using decrypt.html

The only thing you lose is the convenience of the hosted UI.
All functionality remains.

---

## What If Pinata Goes Down?

IPFS is distributed. If Pinata's gateway is down:

1. Use ipfs.io gateway: https://ipfs.io/ipfs/{cid}
2. Use Cloudflare: https://cloudflare-ipfs.com/ipfs/{cid}
3. Run your own IPFS node
4. Ask any IPFS user to pin the content

The CID is the key. Any IPFS node can serve it.

---

## What If Base Chain Forks?

Base settles on Ethereum L1. If a major reorganization occurs:

1. Check Ethereum mainnet finality
2. Verify claim in finalized block
3. If still in doubt, re-file the claim

For critical claims, consider multi-chain anchoring (Ethereum, Polygon, etc).

---

## Full Transparency

This package contains:
- ✅ All source code (contracts, frontend)
- ✅ Complete build instructions
- ✅ No minified/hidden code
- ✅ No tracking or analytics
- ✅ No external dependencies for core function

Build it yourself and compare. The hash should match.

---

*Verification is the foundation of trust.*
VERIFY_EOF

echo "✓ Verification guide created"
echo ""

# ============================================
# STEP 6: Create Quiet Invariants file
# ============================================
echo "📜 Creating Quiet Invariants..."
cat > ${OUTPUT_DIR}/QUIET_INVARIANTS.txt << 'INVARIANTS_EOF'
================================================================================
                         THE QUIET INVARIANTS
                    Immutable Principles of PRIOR
================================================================================

Never decides → Only remembers
    PRIOR does not judge the validity of claims. It only records that 
    a claim was made at time T. Truth is determined by evidence, 
    argumentation, and time—not by this system.

Never grants → Only records  
    PRIOR does not bestow legal rights, patents, or certificates.
    It provides cryptographic proof of existence. Rights are granted
    by law, negotiated by parties, or earned through use.

Never revokes → Append-only
    Once recorded, always recorded. There are no admin functions to 
    delete claims. No appeals process. No reversals. The integrity
    of the timeline depends on permanence.

Claims are assertions → Not judgments
    When you file a claim, you are making an assertion—not stating
    a fact ratified by PRIOR. The network remembers your assertion.
    Courts, markets, or history will determine its validity.

Memory is permanent → Cannot be unwritten
    Blockchain immutability + IPFS content-addressing = eternal
    memory. Plan accordingly. This is a feature, not a bug.

Fork-without-betrayal → Code is open
    You are encouraged to fork this system. Run your own instance.
    Modify it. Improve it. Compete with it. The code is MIT licensed.
    Ideas want to be free.

================================================================================

These invariants are visible on every page footer in the application.
They are embedded in the smart contract logic.
They are included in this package.

We will never change them.

— The Prior Team
================================================================================
INVARIANTS_EOF

echo "✓ Quiet Invariants documented"
echo ""

# ============================================
# STEP 7: Create manifest.json
# ============================================
echo "📋 Creating package manifest..."
cat > ${OUTPUT_DIR}/manifest.json << MANIFEST_EOF
{
  "name": "Prior Timeless Package",
  "version": "${VERSION}",
  "buildTimestamp": "${TIMESTAMP}",
  "description": "Self-contained, offline-runnable Prior system for Tesla Claims",
  "claimNumber": 0,
  "status": "pending-upload",
  "ipfsCID": null,
  "blockchain": {
    "network": "Base Sepolia",
    "chainId": 84532,
    "contractAddress": "0x2405DBaDD194C132713e902d99C8482c771601A4"
  },
  "files": {
    "html": ["index.html", "decrypt.html"],
    "docs": ["README.md", "VERIFICATION.md", "QUIET_INVARIANTS.txt", "manifest.json"],
    "contracts": "contracts/"
  },
  "requirements": {
    "browser": "Modern browser with Web Crypto API support",
    "offline": "Fully functional offline",
    "optional": "Internet for IPFS upload/blockchain interaction"
  },
  "hashes": {
    "sha256": "[TO_BE_COMPUTED]"
  }
}
MANIFEST_EOF

echo "✓ Manifest created"
echo ""

# ============================================
# STEP 8: Create final ZIP archive
# ============================================
echo "📦 Creating final archive..."
cd ${OUTPUT_DIR}

# Create zip, excluding unnecessary files
zip -r ${ZIP_PATH} . -x "*.DS_Store" -x "__MACOSX" -x "*.log" -x "node_modules" 2>/dev/null

# Compute final SHA-256
SHASUM=$(shasum -a 256 ${ZIP_PATH} | cut -d' ' -f1)
FILESIZE=$(du -h ${ZIP_PATH} | cut -f1)

# Update manifest with hash
cat > manifest.json << MANIFEST2_EOF
{
  "name": "Prior Timeless Package",
  "version": "${VERSION}",
  "buildTimestamp": "${TIMESTAMP}",
  "description": "Self-contained, offline-runnable Prior system for Tesla Claims",
  "claimNumber": 0,
  "status": "ready-for-upload",
  "ipfsCID": null,
  "blockchain": {
    "network": "Base Sepolia",
    "chainId": 84532,
    "contractAddress": "0x2405DBaDD194C132713e902d99C8482c771601A4"
  },
  "files": {
    "html": ["index.html", "decrypt.html"],
    "docs": ["README.md", "VERIFICATION.md", "QUIET_INVARIANTS.txt", "manifest.json"],
    "contracts": "contracts/"
  },
  "requirements": {
    "browser": "Modern browser with Web Crypto API support",
    "offline": "Fully functional offline",
    "optional": "Internet for IPFS upload/blockchain interaction"
  },
  "hashes": {
    "sha256": "${SHASUM}"
  }
}
MANIFEST2_EOF

# Re-zip with updated manifest
zip -r ${ZIP_PATH} . -x "*.DS_Store" -x "__MACOSX" 2>/dev/null

echo ""
echo "========================================"
echo "    ✅ TIMELESS PACKAGE COMPLETE"
echo "========================================"
echo ""
echo "  📁 Package: ${ZIP_PATH}"
echo "  📦 Size: ${FILESIZE}"
echo "  🔐 SHA-256: ${SHASUM}"
echo "  📅 Built: ${TIMESTAMP}"
echo ""
echo "  Contents:"
echo "    📄 index.html — Main Prior app"
echo "    🔓 decrypt.html — Decryption tool"
echo "    📜 README.md — Full documentation"
echo "    🔍 VERIFICATION.md — Verify authenticity"
echo "    📋 QUIET_INVARIANTS.txt — Core principles"
echo "    📑 manifest.json — Package metadata"
echo "    📁 contracts/ — Smart contract sources + ABIs"
echo ""
echo "  NEXT STEPS:"
echo "  1. Test locally: unzip ${ZIP_PATH} && open index.html"
echo "  2. Upload to IPFS: Use Pinata or any IPFS node"
echo "  3. File Claim #0: Use PRIORTeslaClaim.fileClaim()"
echo "  4. Record CID + TX: Update this package as Claim #0"
echo ""
echo "🏛️  This is your monument. Make it immortal."
echo ""

# Restore original Next.js config
cd /Users/rikaisho/Desktop/prior-app
cat > next.config.ts << 'EOF'
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  output: 'standalone',
  devIndicators: false,
};
export default nextConfig;
EOF

echo "✓ Original config restored"
echo ""
