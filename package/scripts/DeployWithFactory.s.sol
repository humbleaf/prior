// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/Create2Factory.sol";
import "../src/PRIORTeslaClaim.sol";

/**
 * @title DeployWithFactory
 * @notice Two-step deployment: factory first, then CREATE2 contract through factory
 */
contract DeployWithFactory is Script {
    
    // Salt for CREATE2 deployment (v2 with explicit owner param)
    bytes32 constant SALT = keccak256("PRIOR_CLAIM_V2_OWNER");
    
    // Deployer address (must have private key)
    address constant DEPLOYER = 0xA510Cb2ebA75897C18793A169451307027c2c072;
    
    // Fee recipient
    address constant FEE_RECIPIENT = 0xA510Cb2ebA75897C18793A169451307027c2c072;
    
    // Initial claim fee: 0.003 ETH
    uint256 constant INITIAL_CLAIM_FEE = 0.003 ether;
    
    // Chainlink ETH/USD on Base Mainnet
    address constant CHAINLINK_ETH_USD = 0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        console.log("=== PRIOR Deployment with Custom Factory ===");
        console.log("Deployer:", DEPLOYER);
        console.log("Network: Base Mainnet");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Step 1: Deploy the factory
        Create2Factory factory = new Create2Factory();
        console.log("Step 1 - Factory deployed at:", address(factory));
        
        // Step 2: Prepare PRIORTeslaClaim bytecode with constructor args
        // Pass DEPLOYER as explicit owner (not msg.sender which would be factory)
        bytes memory bytecode = abi.encodePacked(
            type(PRIORTeslaClaim).creationCode,
            abi.encode(FEE_RECIPIENT, INITIAL_CLAIM_FEE, CHAINLINK_ETH_USD, DEPLOYER)
        );
        
        bytes32 bytecodeHash = keccak256(bytecode);
        address expectedAddr = factory.computeAddress(SALT, bytecodeHash);
        console.log("Step 2 - Expected PRIOR address:", expectedAddr);
        
        // Step 3: Deploy PRIORTeslaClaim through factory
        address payable claimContractAddr = payable(factory.deploy{value: 0}(SALT, bytecode));
        console.log("Step 3 - PRIOR deployed at:", claimContractAddr);
        
        vm.stopBroadcast();
        
        // Verify
        require(claimContractAddr == expectedAddr, "Address mismatch!");
        
        PRIORTeslaClaim claim = PRIORTeslaClaim(claimContractAddr);
        
        console.log("\n=== Deployment Successful ===");
        console.log("Factory:", address(factory));
        console.log("PRIOR:", claimContractAddr);
        console.log("Salt:", vm.toString(SALT));
        console.log("Owner:", claim.owner());
        console.log("Fee Recipient:", claim.feeRecipient());
        console.log("Fee:", claim.claimFee());
        console.log("Oracle:", claim.oracleEnabled());
    }
}
