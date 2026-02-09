# GENESIS CLAIM #0 - The Self-Referential Proof

## What Is This?

This is **Claim #0** of the PRIOR protocol - a "Tesla Claim" filed by the system itself, containing the complete source code needed to reconstruct PRIOR from scratch.

**Purpose:** Immortality through self-reference. If PRIOR ever goes offline, anyone can:
1. Query Claim #0 from the blockchain (`0x4971ec14D71156Ab945c32238b29969308a022D6`)
2. Download this package from IPFS
3. Decrypt using the publicly available key
4. Rebuild and redeploy PRIOR anywhere

PRIOR becomes **software as a quine** - a program that reproduces itself.

---

## Package Contents

```
prior-genesis-claim-0/
├── web/                    # Complete PRIOR web application (dist/)
│   ├── index.html          # Homepage
│   ├── about/
│   ├── claim/              # File a Tesla Claim
│   ├── claims/             # View your claims
│   ├── first-claim/        # Genesis claim documentation
│   ├── manifesto/          # PRIOR manifesto
│   ├── tesla/              # Nikola Tesla tribute
│   ├── decrypt.html        # Browser decryption tool
│   └── _next/              # Static assets
│
├── contracts/              # Smart contract source code
│   ├── PRIORTeslaClaim.sol # Main contract (25KB)
│   └── Create2Factory.sol  # Deterministic deployment factory
│
├── scripts/                # Deployment scripts
│   ├── DeployWithFactory.s.sol
│   ├── DeployPriorTeslaClaim.s.sol
│   └── TestDeploy.s.sol
│
├── docs/                   # Documentation
│   ├── README.txt          # Quick start + local server guide
│   ├── GENESIS_CLAIM_0.md  # This file
│   ├── SECURITY.md         # Security audit + fixes
│   └── CONTRACT_ARCHITECTURE.md
│
└── keys/                   # Decryption keys
    └── GENESIS_KEY.txt     # Decryption key for this package

```

---

## Blockchain Record

**Contract:** `0x4971ec14D71156Ab945c32238b29969308a022D6`  
**Network:** Base Mainnet (Chain ID: 8453)  
**Claim ID:** #0 (System Claim)  
**Claimant:** Contract owner (self-referential)  
**Timestamp:** Filed on [DATE]  
**IPFS Hash:** [CID] (stored in contract)  
**File Hash:** [SHA-256 of encrypted tarball]

---

## How to Verify This Claim

### Step 1: Query the Contract

```javascript
// Using ethers.js or web3.js
const contract = new ethers.Contract(
  '0x4971ec14D71156Ab945c32238b29969308a022D6',
  PRIORTeslaClaimABI,
  provider
);

// Get Claim #0 details
const claim = await contract.claims(0);
console.log('Claimant:', claim.claimant);
console.log('IPFS Hash:', claim.ipfsHash);
console.log('File Hash:', claim.fileHash);
console.log('Timestamp:', claim.timestamp.toString());
```

### Step 2: Download from IPFS

```bash
# Using IPFS CLI
ipfs get <CID from contract>

# Using IPFS gateway
wget https://ipfs.io/ipfs/<CID>
```

### Step 3: Verify File Hash

```bash
shasum -a 256 prior-genesis-claim-0.enc
# Compare with claim.fileHash from contract
```

### Step 4: Decrypt the Package

**Key:** `PRIOR_GENESIS_SEED`

**Method A - Browser (easiest):**
1. Open `web/decrypt.html` in any browser
2. Upload the encrypted file
3. Enter key: `PRIOR_GENESIS_SEED`
4. Download decrypted tarball

**Method B - Command line:**
```bash
openssl enc -aes-256-cbc -d -in prior-genesis-claim-0.enc \
  -out prior-genesis-claim-0.tar.gz \
  -k "PRIOR_GENESIS_SEED" -pbkdf2
```

**Method C - Python:**
```python
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import hashlib

key = hashlib.sha256(b"PRIOR_GENESIS_SEED").digest()
aesgcm = AESGCM(key)
# Decrypt using nonce from encrypted file header
```

### Step 5: Verify Contents

```bash
tar -tzf prior-genesis-claim-0.tar.gz | head -20
shasum -a 256 contracts/PRIORTeslaClaim.sol
```

---

## What Makes This "Timeless"

### 1. Protocol Resurrection
Even if:
- prior-claim.xyz goes offline
- All IPFS pins are lost
- Founders disappear
- Cloud accounts are deleted

**PRIOR can be rebuilt** from:
- The blockchain record (permanent)
- This encrypted package (IPFS + backups)
- The published decryption key (Bitcoin OP_RETURN + multiple sources)

### 2. No Single Point of Failure
- **Code:** Open source, in this package
- **Contract:** Immutable on Base blockchain
- **Storage:** IPFS (content-addressed, distributed)
- **Keys:** Published on Bitcoin, cloud backups, offline storage

### 3. Self-Documenting
This package contains everything needed to understand, verify, and rebuild PRIOR:
- Full source code
- Deployment scripts
- Security documentation
- Architecture decisions

---

## Key Publication Methods

The decryption key (`PRIOR_GENESIS_SEED`) is published via multiple redundant channels:

### 1. Bitcoin OP_RETURN (Primary)
- **Transaction:** [TXID]
- **Block:** [Block height]
- **Data:** `PRIOR_GENESIS_SEED`
- **Why:** Bitcoin is the most immutable, censorship-resistant publication mechanism

### 2. This Package
- Stored in `keys/GENESIS_KEY.txt`
- Hardcoded in `decrypt.html` as placeholder
- Included in `README.txt`

### 3. Offline Storage
- Encrypted USB drives at secure locations
- Paper copies in physical safes
- Trusted escrow holders

### 4. Cloud Backups
- Multiple cloud providers (AWS, GCP, Azure)
- Encrypted with same key (paradoxically secure)
- Distributed geographically

---

## Contract Architecture

**PRIORTeslaClaim.sol** features:
- ✅ AES-256-GCM encryption support (client-side)
- ✅ IPFS anchoring (permanent storage)
- ✅ Dynamic fee pricing (Chainlink oracle, $9 USD target)
- ✅ Pull pattern fee withdrawal (reentrancy safe)
- ✅ ReentrancyGuard protection
- ✅ Pausable for emergencies
- ✅ Owner transfer for multisig upgrade path

**Security:** Free audit passed all checks, 3 critical fixes applied before deployment:
1. Pull pattern for fees (not push)
2. Chainlink oracle validation (answeredInRound, staleness)
3. File size enforcement (100MB max)

---

## How to Rebuild PRIOR

### Option 1: Use Pre-Built Website
```bash
# Extract and serve
tar -xzf prior-genesis-claim-0.tar.gz
cd web/
npx serve -s . -p 8008
# Open http://localhost:8008
```

### Option 2: Full Rebuild from Source

**Prerequisites:**
- Node.js 18+
- Foundry (for contracts)
- Pinata API key (for IPFS)

**Steps:**
```bash
# 1. Extract package
tar -xzf prior-genesis-claim-0.tar.gz
cd prior-genesis-claim-0/

# 2. Deploy contracts (requires Base ETH)
cd contracts/
forge build
forge script script/DeployWithFactory.s.sol \
  --rpc-url https://mainnet.base.org \
  --broadcast

# 3. Build web app
cd ../web/
npm install
npm run build

# 4. Serve locally
npx serve -s dist/ -p 8008
```

---

## Invariants & Philosophy

**Quiet Invariants of PRIOR:**
1. Never decides → Only remembers
2. Never grants → Only records
3. Never revokes → Append-only
4. Claims are assertions → Not judgments
5. Memory is permanent → Cannot be unwritten

**This Package Embodies:**
- **Self-referentiality** - PRIOR documenting itself
- **Immortality** - Outliving its creators
- **Resilience** - Surviving any single point of failure
- **Transparency** - Full source, auditable, reproducible

---

## Verification Checklist

Use this to verify the integrity of the resurrection process:

- [ ] Query contract #0 and note IPFS hash
- [ ] Download from IPFS matches published CID
- [ ] File hash matches contract record
- [ ] Decryption with `PRIOR_GENESIS_SEED` succeeds
- [ ] Extracted tarball contains expected structure
- [ ] Contract source compiles cleanly
- [ ] Web app serves successfully
- [ ] Can file test claim on rebuilt instance

---

## Quotes

> "The universe is written in the language of mathematics."
> — Galileo Galilei

> "Tesla Claims for inventors. Cryptographic proof of existence. Memory that outlives the knower."
> — PRIOR Protocol

> "File before they do."
> — The Tesla Warning

---

**Genesis Claim #0**  
Filed on Base Mainnet  
Contract: 0x4971ec14D71156Ab945c32238b29969308a022D6  
Decryption Key: PRIOR_GENESIS_SEED  
Purpose: Immortality through self-reference  

**Tesla Claims for inventors.**  
**Memory that outlives the knower.**
