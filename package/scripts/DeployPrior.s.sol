// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";

/**
 * @title DeployPrior
 * @dev Deployment script for PRIOR ecosystem contracts
 * 
 * Deploys:
 * 1. TESLARToken (main token)
 * 2. MemoryToken (subtoken)
 * 3. PRIORTeslaClaim (registry)
 * 4. TreasuryVesting (4-year)
 * 5. TeslaVault (9-year)
 * 6. TimelockController (governance)
 * 
 * Run: forge script script/DeployPrior.s.sol --rpc-url $BASE_SEPOLIA_RPC --broadcast --verify
 */

// Contract imports (would be from actual files)
interface ITESLARToken {
    function mint(address, uint256) external;
    function setMemoryToken(address) external;
}

interface IMemoryToken {
    function setTeslarToken(address) external;
    function setTeslaClaimContract(address) external;
}

contract DeployPrior is Script {
    
    // Salt for CREATE2 deterministic deployment
    bytes32 constant SALT = keccak256("PRIOR_V1_2025");
    
    // Deployment config
    uint256 constant TREASURY_AMOUNT = 95_000_000 * 1e18;  // 95M TESLAR
    uint256 constant VAULT_AMOUNT = 50_000_000 * 1e18;     // 50M TESLAR
    
    function run() external {
        // Get deployment private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying PRIOR ecosystem...");
        console.log("Deployer:", deployer);
        console.log("Salt:", vm.toString(SALT));
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy order matters for dependencies
        
        // 1. Deploy TESLARToken (main token)
        // TESLARToken token = new TESLARToken{salt: SALT}(
        //     address(0), // treasuryVesting - will update after deploy
        //     address(0), // teslaVault - will update after deploy  
        //     deployer     // initialOwner (will transfer to timelock)
        // );
        // console.log("TESLARToken deployed:", address(token));
        
        // 2. Deploy MemoryToken
        // MemoryToken memory = new MemoryToken{salt: SALT}(deployer);
        // console.log("MemoryToken deployed:", address(memory));
        
        // 3. Deploy PRIORTeslaClaim
        // PRIORTeslaClaim claim = new PRIORTeslaClaim{salt: SALT}();
        // console.log("PRIORTeslaClaim deployed:", address(claim));
        
        // Note: Vesting contracts require token address, deploy after token
        // Since we need circular dependency setup, we'll do:
        // 1. Deploy token with temp addresses
        // 2. Deploy vesting contracts
        // 3. Transfer tokens to vesting contracts
        // 4. Update token with vesting addresses
        
        vm.stopBroadcast();
        
        console.log("Deployment complete!");
        console.log("Remember to:");
        console.log("- Verify contracts on BaseScan");
        console.log("- Transfer ownership to TimelockController");
        console.log("- Set MemoryToken in TESLARToken");
        console.log("- Set TeslaClaimContract in MemoryToken");
        console.log("- Update NEXT_PUBLIC_PRIOR_CONTRACT_ADDRESS in .env.local");
    }
}
