# PRIOR Contract Architecture

## PRIORTeslaClaim.sol v2

**Network**: Base Mainnet (Chain ID: 8453)  
**Contract Address**: `0x4971ec14D71156Ab945c32238b29969308a022D6`  
**Factory (CREATE2)**: `0xbB3226b8F91A5d3A2492a598b3F77eDd364b76d4`  
**Owner**: `0xA510Cb2ebA75897C18793A169451307027c2c072`

### Core Functions

#### fileClaim (Payable)
```solidity
function fileClaim(
    bytes32 _contentHash,
    string calldata _ipfsCid,
    string calldata _assertion,
    uint256 _fileSizeBytes
) external payable returns (uint256 claimId)
```

- **Fee**: Dynamic via Chainlink (target ~$9 USD)
- **Requires**: `msg.value == claimFee` exactly
- **Max file size**: 100 MB
- **Duplicate prevention**: `hashToClaimId` mapping enforces unique content hashes

#### getClaim (View)
```solidity
function getClaim(uint256 _claimId) external view returns (Claim memory)
```

#### getCurrentFeeDetails (View)
Returns fee in wei, USD cents, and oracle status.

#### claimFee (View)
Returns current fee in wei.

### Security Features

1. **Pull Pattern**: Fees accumulate in contract; owner calls `withdrawFees()`
2. **ReentrancyGuard**: All state-changing functions protected
3. **Chainlink Oracle**: ETH/USD feed for dynamic pricing with staleness checks (4h threshold)
4. **Manual Fallback**: `manualFeeUpdate()` for emergency override
5. **File Size Tracking**: Enforced 100MB limit prevents abuse

### Data Structures

```solidity
struct Claim {
    bytes32 contentHash;
    string ipfsCid;
    string assertion;
    address claimant;
    uint256 timestamp;
    uint256 blockNumber;
    uint256 fileSizeBytes;
    bool exists;
}
```

### CREATE2 Deployment

Deterministic address across all EVM chains using:
- Salt: `"PRIOR_V2_2025"` (bytes32)
- Factory: CREATE2Factory.sol

Enables same contract address on Ethereum, Base, Arbitrum, etc.

### Multisig Upgrade Path

1. Deploy as 1-of-1 (current owner)
2. Immediately `transferOwnership()` to 3-of-5 Gnosis Safe
3. Same address, upgraded security

### Events

```solidity
event FileClaimed(
    uint256 indexed claimId,
    bytes32 indexed contentHash,
    address indexed claimant,
    string ipfsCid,
    uint256 timestamp,
    uint256 fileSizeBytes
);
```

---

**Version**: 1.0.1 (ABI fixed for payable fileClaim)  
**License**: MIT  
**Compiler**: Solidity 0.8.22+
