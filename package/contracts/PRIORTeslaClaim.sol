// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Chainlink Price Feed Interface
interface AggregatorV3Interface {
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
    function decimals() external view returns (uint8);
}

/**
 * @title PRIORTeslaClaim
 * @notice A timestamped registry for inventor assertions with dynamic pricing and file size limits
 * @dev This contract does NOT confer legal rights, validate originality, 
 *      or certify authorship. It only records that a claim was made at time T.
 * 
 * The Quiet Invariants:
 * - Never decides → Only remembers
 * - Never grants → Only records
 * - Never revokes → Append-only
 * - Claims are assertions → Not judgments
 * - Memory is permanent → Cannot be unwritten
 */

contract PRIORTeslaClaim {
    
    // ============ Structs ============
    
    struct Claim {
        bytes32 contentHash;      // SHA-256 of encrypted content
        string ipfsCid;           // IPFS Content ID
        string assertion;         // User's text assertion (what they claim)
        address claimant;         // Who made the claim
        uint256 timestamp;        // Block timestamp
        uint256 blockNumber;      // Block number for chain verification
        bool exists;              // Exists flag for validation
        uint256 fileSizeBytes;    // Size of encrypted file (for transparency, 0 if not provided)
    }
    
    // ============ Reentrancy Protection ============
    
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;
    
    modifier nonReentrant() {
        require(_status == _NOT_ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
    
    // ============ State ============
    
    // claimId => Claim
    mapping(uint256 => Claim) public claims;
    
    // Pull pattern: accumulated fees per recipient
    mapping(address => uint256) public pendingWithdrawals;
    
    // claimant => array of claimIds
    mapping(address => uint256[]) public claimsByClaimant;
    
    // contentHash => claimId (prevent duplicate content claims)
    mapping(bytes32 => uint256) public hashToClaimId;
    
    // Total claims filed
    uint256 public totalClaims;
    
    // Contract owner (can pause, update fees, but cannot modify claims)
    address public owner;
    
    // Authorized Tesla Claim contract for MEMORY minting
    address public teslaClaimContract;
    
    // System claim filed flag (Claim #0 - Timeless Package)
    bool public systemClaimFiled;
    
    // Paused state for emergencies
    bool public paused;
    
    // ============ Fee Configuration ============
    
    // Fee recipient address (can be updated by owner)
    address public feeRecipient;
    
    // Current claim fee in wei (e.g., 0.003 ETH = 3000000000000000 wei = ~$9)
    // Updatable by owner to handle ETH/USD price fluctuations
    uint256 public claimFee;
    
    // Minimum fee to prevent accidental zero-fee settings
    uint256 public constant MIN_FEE = 0.001 ether; // ~$3 minimum
    
    // Maximum fee sanity limit (e.g., $50 at current prices)
    uint256 public constant MAX_FEE = 0.02 ether;  // ~$50-60 upper bound
    
    // ============ Oracle Configuration ============
    
    // Chainlink ETH/USD price feed (Base Mainnet: 0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70)
    AggregatorV3Interface public priceFeed;
    
    // Target USD price for claims ($9.00 with 8 decimals = 900000000)
    uint256 public constant TARGET_USD_PRICE = 9 * 10**8; // $9.00
    
    // Oracle staleness threshold (4 hours = 14400 seconds)
    uint256 public constant ORACLE_STALENESS_THRESHOLD = 4 hours;
    
    // Enable/disable automatic oracle updates
    bool public oracleEnabled;
    
    // Last time oracle was used to update fee
    uint256 public lastOracleUpdate;
    
    // ============ File Size Limits ============
    
    // Maximum file size allowed (100 MB = 100 * 1024 * 1024 bytes)
    // This is stored in the claim metadata but enforced off-chain
    // On-chain we just record the size for transparency
    uint256 public constant MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB
    
    // Warning threshold for large files (10 MB)
    uint256 public constant LARGE_FILE_THRESHOLD = 10 * 1024 * 1024; // 10 MB
    
    // ============ Events ============
    
    event ClaimFiled(
        uint256 indexed claimId,
        address indexed claimant,
        bytes32 indexed contentHash,
        string ipfsCid,
        uint256 timestamp,
        uint256 blockNumber
    );
    
    event SystemClaimFiled(
        uint256 indexed claimId,
        bytes32 indexed contentHash,
        string ipfsCid,
        uint256 timestamp
    );
    
    event ContractPaused(address indexed by);
    event ContractUnpaused(address indexed by);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event TeslaClaimContractSet(address indexed teslaClaimContract);
    event FeeRecipientUpdated(address indexed previousRecipient, address indexed newRecipient);
    event ClaimFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeCollected(uint256 indexed claimId, address indexed claimant, uint256 amount, address recipient);
    
    // Pull Pattern Events
    event FeesWithdrawn(address indexed recipient, uint256 amount);
    
    // Oracle Events
    event OracleFeeUpdate(uint256 newFee, uint256 timestamp);
    event OracleStatusChanged(bool enabled);
    event PriceFeedUpdated(address newPriceFeed);
    event FileSizeLogged(uint256 indexed claimId, uint256 fileSizeBytes);
    event OracleValidationFailed(string reason);  // Emitted when oracle check fails but manual fallback works
    
    // ============ Errors ============
    
    error ContractPausedError();
    error ContractNotPausedError();
    error NotOwnerError();
    error ClaimNotFoundError(uint256 claimId);
    error DuplicateContentError(bytes32 contentHash);
    error EmptyAssertionError();
    error EmptyCIDError();
    error SystemClaimAlreadyFiled();
    error InvalidAddressError();
    error IndexOutOfBoundsError();
    error InsufficientFeeError(uint256 provided, uint256 required);
    error FeeTransferFailed();
    error FeeTooLowError(uint256 proposed, uint256 minimum);
    error FeeTooHighError(uint256 proposed, uint256 maximum);
    error OracleStaleError(uint256 lastUpdate, uint256 currentTime);
    error OracleDisabledError();
    error FileTooLargeError(uint256 size, uint256 maxSize);
    error NoWithdrawalsError();
    error WithdrawalFailedError();
    
    // ============ Modifiers ============
    
    modifier whenNotPaused() {
        if (paused) revert ContractPausedError();
        _;
    }
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwnerError();
        _;
    }
    
    // ============ Constructor ============
    
    constructor(
        address _feeRecipient, 
        uint256 _initialClaimFee,
        address _priceFeed,
        address _owner  // Explicit owner parameter for factory deployments
    ) {
        if (_feeRecipient == address(0)) revert InvalidAddressError();
        if (_owner == address(0)) revert InvalidAddressError();
        owner = _owner;  // Set owner explicitly (not msg.sender, for factory support)
        paused = false;
        _status = _NOT_ENTERED;  // Initialize reentrancy guard
        feeRecipient = _feeRecipient;
        claimFee = _initialClaimFee;
        
        // Oracle is optional - can be address(0) for manual-only mode
        if (_priceFeed != address(0)) {
            priceFeed = AggregatorV3Interface(_priceFeed);
            oracleEnabled = true;
        }
    }
    
    // ============ Core Functions ============
    
    /**
     * @notice File a new Tesla Claim (requires fee payment)
     * @param _contentHash SHA-256 hash of encrypted content
     * @param _ipfsCid IPFS Content ID where encrypted content is stored
     * @param _assertion Text describing what is being claimed
     * @param _fileSizeBytes Size of the encrypted file (for transparency, 0 if unknown)
     * @return claimId The unique ID of this claim
     * 
     * NOTE: This is an ASSERTION, not a legal determination. 
     * The network remembers; courts decide (if ever needed).
     * 
     * File size is recorded on-chain for transparency but enforced off-chain.
     * Maximum reasonable file size: 100 MB (larger files should be split)
     * 
     * SECURITY: Uses pull pattern for fees (accumulate, don't transfer immediately)
     * ReentrancyGuard protects state changes. Events emitted after all state updates.
     */
    function fileClaim(
        bytes32 _contentHash,
        string calldata _ipfsCid,
        string calldata _assertion,
        uint256 _fileSizeBytes
    ) external payable whenNotPaused nonReentrant returns (uint256 claimId) {
        
        // File size sanity check - max 100MB on-chain limit
        // Actual 10MB enforcement happens off-chain before encryption
        if (_fileSizeBytes > MAX_FILE_SIZE_BYTES) {
            revert FileTooLargeError(_fileSizeBytes, MAX_FILE_SIZE_BYTES);
        }
        
        // Fee validation - exact fee required (no refunds to save gas)
        if (msg.value != claimFee) revert InsufficientFeeError(msg.value, claimFee);
        
        // Validation
        if (bytes(_assertion).length == 0) revert EmptyAssertionError();
        if (bytes(_ipfsCid).length == 0) revert EmptyCIDError();
        if (hashToClaimId[_contentHash] != 0) revert DuplicateContentError(_contentHash);
        
        // Increment claim counter
        totalClaims++;
        claimId = totalClaims;
        
        // Store claim
        claims[claimId] = Claim({
            contentHash: _contentHash,
            ipfsCid: _ipfsCid,
            assertion: _assertion,
            claimant: msg.sender,
            timestamp: block.timestamp,
            blockNumber: block.number,
            exists: true,
            fileSizeBytes: _fileSizeBytes
        });
        
        // Index by hash
        hashToClaimId[_contentHash] = claimId;
        
        // Index by claimant
        claimsByClaimant[msg.sender].push(claimId);
        
        // PULL PATTERN: Accumulate fee for later withdrawal instead of immediate transfer
        // This prevents reentrancy attacks and griefing via malicious fee recipient
        pendingWithdrawals[feeRecipient] += msg.value;
        
        // EMIT EVENTS (always after all state changes - checks-effects-interactions pattern)
        emit ClaimFiled(
            claimId,
            msg.sender,
            _contentHash,
            _ipfsCid,
            block.timestamp,
            block.number
        );
        emit FeeCollected(claimId, msg.sender, msg.value, feeRecipient);
        emit FileSizeLogged(claimId, _fileSizeBytes);
        
        return claimId;
    }
    
    /**
     * @notice Withdraw accumulated fees
     * @dev Pull pattern - recipients withdraw their own funds
     * Reentrancy protected, emits event on success
     */
    function withdrawFees() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        if (amount == 0) revert NoWithdrawalsError();
        
        // Clear balance BEFORE transfer (checks-effects-interactions)
        pendingWithdrawals[msg.sender] = 0;
        
        // External call last
        (bool sent, ) = msg.sender.call{value: amount}("");
        if (!sent) revert WithdrawalFailedError();
        
        emit FeesWithdrawn(msg.sender, amount);
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get a claim by ID
     * @param _claimId The claim ID
     * @return The Claim struct
     */
    function getClaim(uint256 _claimId) external view returns (Claim memory) {
        if (!claims[_claimId].exists) revert ClaimNotFoundError(_claimId);
        return claims[_claimId];
    }
    
    /**
     * @notice Get all claims by a claimant
     * @param _claimant The address to look up
     * @return Array of claim IDs
     */
    function getClaimsByClaimant(address _claimant) external view returns (uint256[] memory) {
        return claimsByClaimant[_claimant];
    }
    
    /**
     * @notice Get claim ID from content hash
     * @param _contentHash The SHA-256 hash
     * @return claimId (0 if no claim exists)
     */
    function getClaimIdByHash(bytes32 _contentHash) external view returns (uint256) {
        return hashToClaimId[_contentHash];
    }
    
    /**
     * @notice Check if a claim exists
     * @param _claimId The claim ID
     * @return exists Boolean
     */
    function claimExists(uint256 _claimId) external view returns (bool) {
        return claims[_claimId].exists;
    }
    
    /**
     * @notice Get total number of claims
     * @return Total claims filed
     */
    function getTotalClaims() external view returns (uint256) {
        return totalClaims;
    }
    
    /**
     * @notice Get claim count for a specific claimant
     * @param _claimant The address
     * @return Number of claims
     */
    function getClaimantClaimCount(address _claimant) external view returns (uint256) {
        return claimsByClaimant[_claimant].length;
    }
    
    /**
     * @notice Get a specific claim by claimant index
     * @param _claimant The address
     * @param _index Index in their claim array
     * @return claimId
     */
    function getClaimantClaimByIndex(address _claimant, uint256 _index) external view returns (uint256) {
        if (_index >= claimsByClaimant[_claimant].length) revert IndexOutOfBoundsError();
        return claimsByClaimant[_claimant][_index];
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Pause the contract in emergency
     * @dev Only owner can pause. Existing claims remain immutable.
     */
    function pause() external onlyOwner {
        if (paused) revert ContractPausedError();
        paused = true;
        emit ContractPaused(msg.sender);
    }
    
    /**
     * @notice Unpause the contract
     * @dev Only owner can unpause.
     */
    function unpause() external onlyOwner {
        if (!paused) revert ContractNotPausedError();
        paused = false;
        emit ContractUnpaused(msg.sender);
    }
    
    /**
     * @notice Set the Tesla Claim contract address (for MEMORY integration)
     * @param _teslaClaimContract The Tesla Claim contract address
     */
    function setTeslaClaimContract(address _teslaClaimContract) external onlyOwner {
        if (_teslaClaimContract == address(0)) revert InvalidAddressError();
        teslaClaimContract = _teslaClaimContract;
        emit TeslaClaimContractSet(_teslaClaimContract);
    }
    
    /**
     * @notice Update the fee recipient address
     * @dev Only owner can update. Used to change wallet, move to treasury, etc.
     * @param _newRecipient The new fee recipient address
     */
    function updateFeeRecipient(address _newRecipient) external onlyOwner {
        if (_newRecipient == address(0)) revert InvalidAddressError();
        address previousRecipient = feeRecipient;
        feeRecipient = _newRecipient;
        emit FeeRecipientUpdated(previousRecipient, _newRecipient);
    }
    
    /**
     * @notice Update the claim fee amount
     * @dev Only owner can update. Min/Max bounds prevent accidents.
     * @param _newFee The new fee in wei (e.g., 3000000000000000 for 0.003 ETH)
     */
    function updateClaimFee(uint256 _newFee) external onlyOwner {
        if (_newFee < MIN_FEE) revert FeeTooLowError(_newFee, MIN_FEE);
        if (_newFee > MAX_FEE) revert FeeTooHighError(_newFee, MAX_FEE);
        uint256 oldFee = claimFee;
        claimFee = _newFee;
        emit ClaimFeeUpdated(oldFee, _newFee);
    }
    
    /**
     * @notice File the System Claim (Claim #0 - Timeless Package)
     * @dev Only callable by owner, only once, before any user claims
     * @param _contentHash SHA-256 hash of encrypted Timeless Package
     * @param _ipfsCid IPFS CID of the Timeless Package
     * @param _assertion The assertion text (e.g., "This package contains the PRIOR protocol itself...")
     * @param _fileSizeBytes Size of the Timeless Package in bytes
     * @return claimId Always returns 0 for system claim
     */
    function fileSystemClaim(
        bytes32 _contentHash,
        string calldata _ipfsCid,
        string calldata _assertion,
        uint256 _fileSizeBytes
    ) external onlyOwner returns (uint256 claimId) {
        if (systemClaimFiled) revert SystemClaimAlreadyFiled();
        if (totalClaims > 0) revert DuplicateContentError(_contentHash); // Prevent if user claims exist
        if (bytes(_assertion).length == 0) revert EmptyAssertionError();
        if (bytes(_ipfsCid).length == 0) revert EmptyCIDError();
        if (hashToClaimId[_contentHash] != 0) revert DuplicateContentError(_contentHash);
        
        // Claim #0 is the system claim
        claimId = 0;
        systemClaimFiled = true;
        
        // We don't increment totalClaims here - user claims start from 1
        // Store claim
        claims[claimId] = Claim({
            contentHash: _contentHash,
            ipfsCid: _ipfsCid,
            assertion: _assertion,
            claimant: msg.sender,
            timestamp: block.timestamp,
            blockNumber: block.number,
            exists: true,
            fileSizeBytes: _fileSizeBytes
        });
        
        // Index by hash
        hashToClaimId[_contentHash] = claimId;
        
        // Emit special event for system claim
        emit SystemClaimFiled(claimId, _contentHash, _ipfsCid, block.timestamp);
        emit FileSizeLogged(claimId, _fileSizeBytes);
        
        return claimId;
    }
    
    // ============ Oracle Functions ============
    
    /**
     * @notice Get the latest ETH/USD price from Chainlink with full validation
     * @return price ETH price in USD with 8 decimals (e.g., 3000.50 * 10^8 = 300050000000)
     * @return timestamp When the price was last updated
     * @return isValid Whether the price passed all validation checks
     * 
     * SECURITY: Implements all Chainlink best practices:
     * - answeredInRound >= roundId (prevent stale rounds)
     * - answer > 0 (valid price)
     * - updatedAt != 0 (round complete)
     * - Not stale (within 4 hours)
     */
    function getLatestETHPrice() public view returns (uint256 price, uint256 timestamp, bool isValid) {
        if (!oracleEnabled || address(priceFeed) == address(0)) {
            return (0, 0, false);
        }
        
        try priceFeed.latestRoundData() returns (
            uint80 roundId,
            int256 answer,
            uint256, /* startedAt - unused */
            uint256 updatedAt,
            uint80 answeredInRound
        ) {
            // Chainlink best practice: Verify round is complete
            if (answeredInRound < roundId) return (0, 0, false);
            if (updatedAt == 0) return (0, 0, false);
            
            // Check for stale data (4 hour threshold)
            if (block.timestamp - updatedAt > ORACLE_STALENESS_THRESHOLD) {
                return (0, 0, false);
            }
            
            // Verify positive price
            if (answer <= 0) return (0, 0, false);
            
            price = uint256(answer);
            timestamp = updatedAt;
            isValid = true;
            
            return (price, timestamp, isValid);
        } catch {
            // Oracle call failed (contract paused, deprecated, etc.)
            return (0, 0, false);
        }
    }
    
    /**
     * @notice Calculate ETH fee for target $9 USD price
     * @return feeInWei The ETH amount in wei needed for $9
     * @return isValid Whether calculation used valid oracle data
     * @dev Falls back to current claimFee if oracle is invalid
     */
    function calculateDynamicFee() public view returns (uint256 feeInWei, bool isValid) {
        (uint256 ethPrice, , bool priceValid) = getLatestETHPrice();
        
        if (!priceValid) {
            // Oracle failed - return current fee as fallback
            return (claimFee, false);
        }
        
        // ethPrice has 8 decimals (e.g., 300000000000 = $3000.00)
        // TARGET_USD_PRICE has 8 decimals (900000000 = $9.00)
        // Result needs to be in wei (18 decimals)
        
        // Formula: fee = (TARGET_USD * 10^18) / ethPrice
        feeInWei = (TARGET_USD_PRICE * 1e18) / ethPrice;
        
        return (feeInWei, true);
    }
    
    /**
     * @notice Update claim fee using current oracle price with fallback
     * @dev Callable by anyone (public good). If oracle fails, falls back to manual bounds.
     * @return newFee The updated fee amount
     * @return usedOracle Whether oracle was used (false = oracle failed, used current)
     */
    function updateFeeFromOracle() external returns (uint256 newFee, bool usedOracle) {
        (uint256 calculatedFee, bool isValid) = calculateDynamicFee();
        
        uint256 oldFee = claimFee;
        
        if (isValid && oracleEnabled) {
            // Oracle worked - apply bounds
            newFee = calculatedFee;
            if (newFee < MIN_FEE) newFee = MIN_FEE;
            if (newFee > MAX_FEE) newFee = MAX_FEE;
            usedOracle = true;
            
            emit OracleFeeUpdate(newFee, block.timestamp);
        } else {
            // Oracle failed - keep current fee, emit warning
            newFee = claimFee;
            usedOracle = false;
            emit OracleValidationFailed("Oracle unavailable, manual update required");
        }
        
        claimFee = newFee;
        lastOracleUpdate = block.timestamp;
        
        if (newFee != oldFee) {
            emit ClaimFeeUpdated(oldFee, newFee);
        }
        
        return (newFee, usedOracle);
    }
    
    /**
     * @notice Owner can force fee recalculation to target $9 regardless of oracle
     * @dev Emergency use if oracle is broken but owner knows current ETH price
     * @param _manualEthPrice ETH price in USD with 8 decimals (e.g., 300000000000 = $3000)
     */
    function manualFeeUpdate(uint256 _manualEthPrice) external onlyOwner {
        if (_manualEthPrice == 0) revert InvalidAddressError();
        
        // Calculate fee manually: (9 * 10^8 * 10^18) / ethPrice
        uint256 newFee = (TARGET_USD_PRICE * 1e18) / _manualEthPrice;
        
        // Enforce safety bounds
        if (newFee < MIN_FEE) newFee = MIN_FEE;
        if (newFee > MAX_FEE) newFee = MAX_FEE;
        
        uint256 oldFee = claimFee;
        claimFee = newFee;
        lastOracleUpdate = block.timestamp;
        
        emit ClaimFeeUpdated(oldFee, newFee);
        emit OracleValidationFailed("Manual fee update applied");
    }
    
    /**
     * @notice Enable/disable oracle automatic updates
     * @param _enabled Whether oracle is enabled
     */
    function setOracleEnabled(bool _enabled) external onlyOwner {
        oracleEnabled = _enabled;
        emit OracleStatusChanged(_enabled);
    }
    
    /**
     * @notice Update the price feed address (emergency only)
     * @param _newPriceFeed New Chainlink oracle address
     */
    function updatePriceFeed(address _newPriceFeed) external onlyOwner {
        if (_newPriceFeed == address(0)) revert InvalidAddressError();
        priceFeed = AggregatorV3Interface(_newPriceFeed);
        emit PriceFeedUpdated(_newPriceFeed);
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get current fee and its USD equivalent
     * @return ethFee Fee in wei
     * @return usdValue USD value with 8 decimals
     * @return isOracleActive Whether oracle is providing valid data
     * @return lastUpdate Last time fee was updated
     */
    function getCurrentFeeDetails() external view returns (
        uint256 ethFee, 
        uint256 usdValue,
        bool isOracleActive,
        uint256 lastUpdate
    ) {
        ethFee = claimFee;
        lastUpdate = lastOracleUpdate;
        
        (uint256 ethPrice, , bool priceValid) = getLatestETHPrice();
        
        if (priceValid) {
            // usdValue = (ethFee * ethPrice) / 10^18
            usdValue = (claimFee * ethPrice) / 1e18;
            isOracleActive = true;
        } else {
            usdValue = 0;
            isOracleActive = false;
        }
        
        return (ethFee, usdValue, isOracleActive, lastUpdate);
    }
    
    /**
     * @notice Transfer ownership
     * @param _newOwner The new owner address
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        if (_newOwner == address(0)) revert InvalidAddressError();
        address previousOwner = owner;
        owner = _newOwner;
        emit OwnershipTransferred(previousOwner, _newOwner);
    }
    
    // ============ Receive/Fallback ============
    
    receive() external payable {
        revert("Do not send ETH directly");
    }
    
    fallback() external payable {
        revert("Function not found");
    }
}
