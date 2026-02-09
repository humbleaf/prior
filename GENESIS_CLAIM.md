# PRIOR Genesis Claim #0

## What Is This?
This is the **Timeless Package** — a self-contained snapshot of the PRIOR protocol that can be decrypted and resurrected from the blockchain even if all infrastructure fails.

## Contents
| File | Size | Purpose |
|------|------|---------|
| `prior-genesis-claim-0.tar.gz` | 16MB | Unencrypted source archive |
| `prior-genesis-claim-0.enc` | 16MB | Encrypted (AES-256-CBC) |
| Encryption Key | - | `PRIOR_GENESIS_SEED` |

## How to File Genesis Claim #0

### Step 1: Start the Web App
```bash
cd ~/Desktop/prior-app
npx serve -s dist -p 8008
```
Visit: http://localhost:8008/claim

### Step 2: Connect Wallet
- Ensure MetaMask/Rainbow wallet has ETH on **Base Mainnet** (Chain ID: 8453)
- Fee: ~0.003 ETH (~$9 USD, auto-adjusted by Chainlink oracle)

### Step 3: Upload Package
- **Upload this file**: `prior-genesis-claim-0.tar.gz` (unencrypted, 16MB)
- **Enter encryption key**: `PRIOR_GENESIS_SEED`
- The web app will encrypt client-side and upload to IPFS

### Step 4: Submit Claim
- Review the IPFS CID and content hash
- Confirm in MetaMask (sends ~0.003 ETH fee)
- Wait for transaction confirmation

### Step 5: Verify
- Check BaseScan: `0x4971ec14D71156Ab945c32238b29969308a022D6`
- Your claim ID should be #0 (or next available if someone beat you to it)

## Protocol Resurrection

Anyone with the key can resurrect PRIOR:

```bash
# Decrypt the Genesis Claim
openssl enc -aes-256-cbc -pbkdf2 -iter 100000 -d \
  -in prior-genesis-claim-0.enc \
  -out prior-genesis-claim-0.tar.gz \
  -k PRIOR_GENESIS_SEED

# Extract
tar -xzf prior-genesis-claim-0.tar.gz

# Run
cd package/dist
npx serve -s . -p 8008
```

## Bitcoin OP_RETURN Publication

After filing Claim #0, the key `PRIOR_GENESIS_SEED` will be published
to Bitcoin via OP_RETURN transaction, creating an immutable cross-chain proof.

## Contract Details

| Property | Value |
|----------|-------|
| Network | Base Mainnet |
| Chain ID | 8453 |
| Contract | 0x4971ec14D71156Ab945c32238b29969308a022D6 |
| Factory | 0xbB3226b8F91A5d3A2492a598b3F77eDd364b76d4 |
| Owner | 0xA510Cb2ebA75897C18793A169451307027c2c072 |

## Version History

**v1.0.1** (2026-02-08): ABI fixed — added `_fileSizeBytes` param and `payable` stateMutability
**v1.0.0** (2026-02-08): Initial package with contract security hardening

---

"A memory primitive for human invention, with love for Adam"
