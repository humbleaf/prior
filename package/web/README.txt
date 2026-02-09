================================================================================
PRIOR TIMELESS PACKAGE v1.0.0
================================================================================

This package contains the complete PRIOR protocol - a timestamped registry 
for inventor assertions with cryptographic proof of existence.

================================================================================
HOW TO RUN LOCALLY (QUICK START)
================================================================================

This is a static website that REQUIRES a local server. Opening index.html 
directly (file:// protocol) will NOT work due to browser security restrictions.

OPTION 1 - Node.js (Recommended):
```bash
cd dist/
npx serve -s . -p 8008
# Open: http://localhost:8008
```

OPTION 2 - Python 3:
```bash
cd dist/
python3 -m http.server 8008
# Open: http://localhost:8008
```

OPTION 3 - Python 2:
```bash
cd dist/
python -m SimpleHTTPServer 8008
# Open: http://localhost:8008
```

OPTION 4 - PHP:
```bash
cd dist/
php -S localhost:8008
# Open: http://localhost:8008
```

OPTION 5 - VS Code:
Install "Live Server" extension, right-click index.html → "Open with Live Server"

WHY THIS IS NECESSARY:
Modern web apps use client-side routing (React/Next.js) that requires 
proper HTTP headers. Direct file:// access breaks:
- Relative imports
- Client-side routing (/claim, /about, etc.)
- Dynamic imports of JavaScript chunks
- API calls

================================================================================
CONTRACT ADDRESS (Base Mainnet)
================================================================================

CONTRACT ADDRESS (Base Mainnet):
0x4971ec14D71156Ab945c32238b29969308a022D6

================================================================================
CONTENTS
================================================================================

/                       - Homepage (index.html)
/about/                 - About page
/claim/                 - File a new Tesla Claim
/claims/                - View your claims
/first-claim/           - Genesis Claim #0 documentation
/manifesto/             - PRIOR manifesto
/tesla/                 - Nikola Tesla tribute
/_next/                 - Static assets (JS, CSS)

WHATS INCLUDED:
- Complete Next.js static export
- All page routes and components
- Smart contract ABI and addresses
- Decryption tool (decrypt.html)
- Full documentation

================================================================================
DECRYPTION INSTRUCTIONS (FOR ENCRYPTED PACKAGE)
================================================================================

If this package is encrypted (Claim #0 scenario):

1. OBTAIN THE ENCRYPTED PACKAGE
   - Query Contract #0 from: 0x4971ec14D71156Ab945c32238b29969308a022D6
   - Download from IPFS using the CID stored on-chain
   - The encrypted tarball will have .enc extension

2. DECRYPTION KEY
   Seed Phrase: PRIOR_GENESIS_SEED
   
   This key is also published via:
   - Bitcoin OP_RETURN transaction (permanent blockchain record)
   - Multiple offline backup locations
   - This README itself

3. DECRYPT USING AES-256-GCM

   ================================================================
   OPTION A: VISUAL INTERFACE (EASIEST - For Non-Technical Users)
   ================================================================
   
   Included file: decrypt.html
   
   Step 1: Start local server (see HOW TO RUN LOCALLY above)
   ```bash
   npx serve -s . -p 8008
   ```
   
   Step 2: Open in browser
   http://localhost:8008/decrypt.html
   
   Step 3: Use the tool
   - Click "Choose File" and select the encrypted file (.enc)
   - Enter the decryption key in the password field
     (For Claim #0: PRIOR_GENESIS_SEED)
   - Click "Decrypt File"
   - Download the decrypted file when ready
   
   No command line needed! Works entirely in your browser.
   Your password never leaves your computer.
   
   ================================================================
   OPTION B: COMMAND LINE (For Technical Users)
   ================================================================
   
   Using OpenSSL:
   ```bash
   openssl enc -aes-256-cbc -d -in prior-timeless.enc -out prior-timeless.tar.gz \
     -k "PRIOR_GENESIS_SEED" -pbkdf2
   ```
   
   Using Python:
   ```python
   from cryptography.hazmat.primitives.ciphers.aead import AESGCM
   import hashlib
   
   key = hashlib.sha256(b"PRIOR_GENESIS_SEED").digest()
   aesgcm = AESGCM(key)
   # ... decrypt using nonce from encrypted file
   ```
   
   ================================================================
   OPTION C: WEB APP (If PRIOR site is still online)
   ================================================================
   
   Visit https://prior-claim.xyz/decrypt
   - Same interface as decrypt.html
   - Just upload your encrypted claim file
   - Enter your key
   - Download decrypted content
   
   Note: If prior-claim.xyz is offline, use Option A (local decrypt.html)

4. EXTRACT AND USE
   ```bash
   tar -xzf prior-timeless.tar.gz
   cd prior-timeless/
   open index.html  # Or serve with: npx serve -s . -p 8008
   ```

================================================================================
RESURRECTION GUARANTEE
================================================================================

If prior-claim.xyz ever goes offline:

1. The smart contract lives forever on Base blockchain
2. The code lives forever on IPFS (content-addressed)
3. The decryption key is published on Bitcoin OP_RETURN
4. This package can reconstruct the entire system

PRIOR is memory that outlives the knower - including its creators.

================================================================================
TECHNICAL SPECIFICATIONS
================================================================================

Contract:      PRIORTeslaClaim v1.0
Network:       Base Mainnet (Chain ID: 8453)
Deployment:    February 8, 2026
Compiler:      Solidity 0.8.20
Optimization:  200 runs
License:       MIT

Owner:         0xA510Cb2ebA75897C18793A169451307027c2c072
Fee Recipient: 0xA510Cb2ebA75897C18793A169451307027c2c072
Oracle:        Chainlink ETH/USD (0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70)

Features:
- AES-256-GCM client-side encryption
- IPFS permanence via Pinata
- Blockchain anchoring to Base
- Dynamic fee pricing ($9 USD target)
- Pull pattern fee withdrawal
- ReentrancyGuard protection
- Pausable for emergencies

================================================================================
QUIET INVARIANTS
================================================================================

Never decides -> Only remembers
Never grants -> Only records  
Never revokes -> Append-only
Claims are assertions -> Not judgments
Memory is permanent -> Cannot be unwritten

================================================================================
CONTACT & SUPPORT
================================================================================

Website:      https://prior-claim.xyz (if available)
Contract:     0x4971ec14D71156Ab945c32238b29969308a022D6 (always)
IPFS:         Content-addressed via CIDs in contract
GitHub:       github.com/humbleaf/prior (source code)

For encrypted claims, decryption keys are:
- Published on Bitcoin blockchain (OP_RETURN)
- Stored in this package
- Redundantly backed up in multiple locations

================================================================================
Tesla Claims for inventors. 
Cryptographic proof of existence.
Memory that outlives the knower.

File before they do.
================================================================================
