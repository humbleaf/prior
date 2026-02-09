// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/PRIORTeslaClaim.sol";

/**
 * @title DeployPRIORTeslaClaim
 * @notice Deployment script for PRIORTeslaClaim contract using CREATE2
 * @dev Uses salt: keccak256("PRIOR_CLAIM_V1")
 */
contract DeployPRIORTeslaClaim is Script {
    
    // Salt for CREATE2 deployment (changed after failed deployment)
    bytes32 constant SALT = keccak256("PRIOR_CLAIM_V1_2026");
    
    // Deployer address (must have the private key for this address)
    address constant DEPLOYER = 0xA510Cb2ebA75897C18793A169451307027c2c072;  // Your funded wallet
    
    // Fee recipient (your new wallet)
    address constant FEE_RECIPIENT = 0xA510Cb2ebA75897C18793A169451307027c2c072;
    
    // Initial claim fee: 0.003 ETH = ~$9 at current prices
    // 0.003 ETH = 3000000000000000 wei
    uint256 constant INITIAL_CLAIM_FEE = 0.003 ether;
    
    // Chainlink ETH/USD Price Feed on Base Mainnet
    // Source: https://docs.chain.link/data-feeds/price-feeds/addresses?network=base&page=1
    address constant CHAINLINK_ETH_USD = 0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70;
    
    function run() external {
        // Get private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Log deployment details
        console.log("Deploying PRIORTeslaClaim");
        console.log("Network: Base Mainnet");
        console.log("Deployer:", DEPLOYER);
        console.log("Fee Recipient:", FEE_RECIPIENT);
        console.log("Claim Fee:", INITIAL_CLAIM_FEE, "wei (0.003 ETH)");
        console.log("Oracle:", CHAINLINK_ETH_USD);
        console.log("Salt:", vm.toString(SALT));
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy using CREATE2 with salt + constructor arguments
        // DEPLOYER passed as explicit owner (for factory/non-factory compatibility)
        PRIORTeslaClaim claimContract = new PRIORTeslaClaim{salt: SALT}(
            FEE_RECIPIENT,
            INITIAL_CLAIM_FEE,
            CHAINLINK_ETH_USD,
            DEPLOYER  // Explicit owner
        );
        
        // Stop broadcasting
        vm.stopBroadcast();
        
        // Log deployment results
        console.log("========================================");
        console.log("PRIORTeslaClaim deployed successfully!");
        console.log("Contract Address:", address(claimContract));
        console.log("Deployment Salt:", vm.toString(SALT));
        console.log("========================================");
        
        // Verify parameters
        console.log("Contract Owner:", claimContract.owner());
        console.log("Fee Recipient:", claimContract.feeRecipient());
        console.log("Current Claim Fee:", claimContract.claimFee());
        console.log("Oracle Enabled:", claimContract.oracleEnabled());
    }
    
    /**
     * @notice Calculate the expected deployment address before deploying
     * @return The expected CREATE2 address
     */
    function getExpectedAddress() external pure returns (address) {
        // Get the creation bytecode hash
        bytes32 bytecodeHash = keccak256(
            abi.encodePacked(
                type(PRIORTeslaClaim).creationCode
            )
        );
        
        // Calculate CREATE2 address
        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                DEPLOYER,
                SALT,
                bytecodeHash
            )
        );
        
        return address(uint160(uint256(hash)));
    }
}
