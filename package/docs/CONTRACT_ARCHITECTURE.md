# PRIOR Contract Architecture

## Overview

PRIOR (Proof of Registration for Inventor Ownership Rights) is a timestamped registry for inventor assertions with cryptographic proof of existence on the Base blockchain.

**Contract:** PRIORTeslaClaim.sol  
**Language:** Solidity 0.8.20  
**Deployment:** Base Mainnet  
**Address:** 0x4971ec14D71156Ab945c32238b29969308a022D6

---

## Core Concept

PRIOR allows inventors to file "Tesla Claims" - cryptographic proofs that they possessed certain information at a specific moment in time. Unlike patents, Tesla Claims:
- Are immediate (5 minutes vs 3-5 years)
- Are affordable ($9 vs $50K+)
- Cannot be revoked (append-only blockchain)
- Create permanent, timestamped evidence

---

## Architecture Components

### 1. TeslaClaim Struct

```solidity
struct TeslaClaim {
    address claimant;       // Who filed the claim
    string ipfsHash;        // IPFS content identifier
    bytes32 fileHash;       // SHA-256 of encrypted content
    uint256 timestamp;      // Unix timestamp
    uint256 fileSizeBytes;  // Size in bytes (for storage verification)
    bool isEncrypted;       // Whether data is encrypted
    string claimType;       // Category: "prior_art", "invention", "trade_secret", etc.
}
```

**Purpose:** Immutable record of what was filed, when, and by whom.

---

### 2. Encryption Layer (Client-Side)

PRIOR never sees user data. All encryption happens in the browser:

```
User File → AES-256-GCM Encryption → IPFS Storage → Blockchain Anchor
                ↑                                        ↑
         User's private key                    Contract stores hash
         (never transmitted)
```

**Flow:**
1. User selects file in browser
2. AES-256-GCM encryption with user-generated key
3. Encrypted blob uploaded to IPFS
4. IPFS hash + file hash stored on blockchain
5. Decryption key remains with user only

**Benefits:**
- Zero-knowledge: We cannot decrypt user data
- Privacy: Even if IPFS node is compromised, data is encrypted
- Censorship-resistant: Content-addressed storage
- Permanence: Blockchain timestamp + IPFS persistence

---

### 3. Fee Mechanism

**Goal:** $9 USD per claim  
**Challenge:** ETH price fluctuates  
**Solution:** Dynamic pricing via Chainlink oracle

```solidity
function getLatestETHPrice() public view returns (uint256, uint256, bool)
function calculateDynamicFee() public view returns (uint256, bool)
function updateFeeFromOracle() external returns (bool)
```

**Mechanism:**
1. Read ETH/USD price from Chainlink
2. Calculate ETH amount for $9 USD
3. Update `claimFee` if deviation > 10% or force update after 24 hours
4. Manual override available for emergencies

**Bounds:**
- Minimum: 0.001 ETH (~$3 at $3000 ETH)
- Maximum: 0.02 ETH (~$60 at $3000 ETH)
- Target: $9 USD

---

### 4. Pull Pattern Fee Withdrawal

**Problem:** Push pattern vulnerable to reentrancy and griefing  
**Solution:** Pull pattern with ReentrancyGuard

```solidity
mapping(address => uint256) public pendingWithdrawals;

function fileClaim(...) external payable whenNotPaused nonReentrant {
    // Validation...
    
    // Accumulate fees (no external call)
    pendingWithdrawals[feeRecipient] += msg.value;
    
    // Emit event
    emit ClaimFiled(claimId, msg.sender, ipfsHash, fileHash, block.timestamp);
}

function withdrawFees() external nonReentrant {
    uint256 amount = pendingWithdrawals[msg.sender];
    if (amount == 0) revert NoWithdrawalsError();
    
    // Effects before interaction (CEI pattern)
    pendingWithdrawals[msg.sender] = 0;
    
    // External call last
    (bool success, ) = msg.sender.call{value: amount}("");
    if (!success) revert WithdrawalFailedError();
    
    emit FeesWithdrawn(msg.sender, amount);
}
```

**Security:**
- ReentrancyGuard prevents reentrant calls
- CEI pattern (checks-effects-interactions)
- Recipient controls when to claim
- No griefing possible

---

### 5. CREATE2 Deployment

**Purpose:** Deterministic addresses across chains

```solidity
// CREATE2 formula:
address = keccak256(0xff + deployer + salt + keccak256(bytecode))[12:]
```

**Benefits:**
- Same contract address on all EVM chains
- Pre-computable before deployment
- Factory architecture for controlled deployment

**Factory:** Create2Factory.sol  
**Salt:** keccak256("PRIOR_CLAIM_V2_OWNER")  
**Implementation:**
```solidity
constructor(
    address _feeRecipient,
    uint256 _initialClaimFee,
    AggregatorV3Interface _priceFeed,  // Optional
    address _owner                      // Explicit owner (not msg.sender)
)
```

---

## Access Control

| Role | Functions |
|------|-----------|
| **Owner** | `pause()`, `unpause()`, `manualFeeUpdate()`, `updateFeeRecipient()`, `updateMaxFileSize()`, `transferOwnership()` |
| **Fee Recipient** | `withdrawFees()` |
| **Anyone** | `fileClaim()`, `getClaim()`, `getLatestETHPrice()`, `claims()` |

**Planned upgrade:** 3-of-5 Gnosis Safe via `transferOwnership()`

---

## Key Events

```solidity
event ClaimFiled(
    uint256 indexed claimId,
    address indexed claimant,
    string ipfsHash,
    bytes32 fileHash,
    uint256 timestamp
);

event FeesWithdrawn(
    address indexed recipient,
    uint256 amount
);

event OracleFeeUpdate(
    uint256 newFee,
    uint256 ethPrice,
    bool usedOracle
);

event FileSizeLogged(
    uint256 indexed claimId,
    uint256 fileSizeBytes
);

event OracleValidationFailed(string reason);
```

---

## Security Parameters

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| ReentrancyGuard | ✅ | Prevents reentrancy attacks |
| Pull pattern | ✅ | No griefing, recipient controls |
| Fee bounds | 0.001-0.02 ETH | Prevents economic manipulation |
| File size limit | 100MB | Prevents block bloat |
| Oracle staleness | 4 hours | Ensures fresh pricing |
| Pause capability | ✅ | Emergency stop switch |
| Manual fee | ✅ | Oracle failure fallback |

---

## Storage Layout

```solidity
// Claims storage (append-only)
mapping(uint256 => TeslaClaim) public claims;
uint256 public nextClaimId;  // Auto-incrementing ID

// Fee management
uint256 public claimFee;                    // Current fee in wei
address public feeRecipient;                // Where fees go
mapping(address => uint256) public pendingWithdrawals;  // Pull pattern

// File tracking
mapping(uint256 => uint256) public claimFileSizes;  // ID -> size
uint256 public maxFileSize;  // Configurable limit

// Oracle
AggregatorV3Interface public priceFeed;  // Chainlink
bool public oracleEnabled;  // Can toggle

// Pause
bool public paused;  // Emergency stop

// Access
address public owner;  // Can be transferred to multisig

// Constants (not in storage)
uint256 constant MIN_FEE = 0.001 ether;
uint256 constant MAX_FEE = 0.02 ether;
uint256 constant TARGET_FEE_USD = 9 * 10**8;  // $9.00
uint256 constant MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;  // 100MB
```

---

## Gas Optimization

**Cheap operations:**
- Filing claim: ~200K gas
- Pull withdrawal: ~30K gas
- Query claim: Free (view)

**Storage optimization:**
- IPFS hash stored as string (variable length, but worth it for clarity)
- File hash as bytes32 (fixed, cheap)
- Timestamp compressed to uint256 (standard)

---

## Integration Points

### Frontend (Web App)
```javascript
// File claim
const tx = await contract.fileClaim(
  ipfsHash,
  fileHash,
  fileSizeBytes,
  isEncrypted,
  claimType,
  { value: await contract.claimFee() }
);

// Query claim
const claim = await contract.claims(claimId);
```

### IPFS
- Upload via Pinata SDK
- CID stored in `ipfsHash`
- Encrypted content = `decrypt( downloadFromIPFS(cid), userKey )`

### Chainlink
- ETH/USD feed: 0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70 (Base)
- Staleness check: 4 hours
- Fallback: Manual owner override

---

## Upgrade Path

**Not Upgradeable (by design):**
- Contract is NOT proxy-based
- No delegatecall patterns
- Immutable logic preserves claim integrity

**Owner Transfer (for multisig):**
```solidity
// Current owner (1-of-1) calls:
transferOwnership(safeAddress);

// Now 3-of-5 multisig is owner
// Same contract, upgraded security
```

**Why no proxy?**
- Claims must be immutable for legal validity
- Trustlessness requires locked logic
- Better to deploy new contract if needed (claims remain on old)

---

## Testing

**Unit tests:**
```solidity
// test/PRIORTeslaClaim.t.sol
function testFileClaim() public {
    // Test filing a claim
}

function testFeeWithdrawal() public {
    // Test pull pattern
}

function testOracleUpdate() public {
    // Test dynamic pricing
}

function testReentrancyProtection() public {
    // Test nonReentrant modifier
}
```

**Fork tests:**
```bash
forge test --fork-url https://mainnet.base.org
```

---

## Deployment

```bash
# Build
forge build

# Test
forge test

# Deploy to Base Mainnet
forge script script/DeployWithFactory.s.sol:DeployWithFactory \
  --rpc-url https://mainnet.base.org \
  --broadcast \
  --verify

# Verify manually if API fails
forge verify-contract 0x4971ec14D71156Ab945c32238b29969308a022D6 \
  src/PRIORTeslaClaim.sol:PRIORTeslaClaim \
  --chain-id 8453
```

---

## Contract Addresses

| Contract | Address |
|----------|---------|
| PRIORTeslaClaim | 0x4971ec14D71156Ab945c32238b29969308a022D6 |
| Create2Factory | 0xbB3226b8F91A5d3A2492a598b3F77eDd364b76d4 |
| Chainlink ETH/USD | 0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70 |
| Owner | 0xA510Cb2ebA75897C18793A169451307027c2c072 |
| Deployment Block | 41907629 |

---

## References

- EIP-1967: Proxy Storage Slots (NOT used, but good reference)
- Chainlink Data Feeds: https://docs.chain.link/data-feeds
- CREATE2: https://eips.ethereum.org/EIPS/eip-1014
- OpenZeppelin Contracts: https://github.com/OpenZeppelin/openzeppelin-contracts

---

**Tesla Claims for inventors.**  
**Cryptographic proof of existence.**  
**Memory that outlives the knower.**
