// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/PRIORTeslaClaim.sol";

contract TestDeploy is Script {
    address constant EXPECTED_DEPLOYER = 0xA510Cb2ebA75897C18793A169451307027c2c072;
    
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address derived = vm.addr(pk);
        
        console.log("Expected deployer (from constant):", EXPECTED_DEPLOYER);
        console.log("Derived address (from private key):", derived);
        console.log("Match:", derived == EXPECTED_DEPLOYER);
        
        // Try simple deployment first
        vm.startBroadcast(pk);
        
        // Deploy a simple test first
        PRIORTeslaClaim testContract = new PRIORTeslaClaim(
            EXPECTED_DEPLOYER,  // feeRecipient
            0.003 ether,        // fee
            address(0),         // no oracle for test
            EXPECTED_DEPLOYER   // owner
        );
        
        vm.stopBroadcast();
        
        console.log("\nTest contract deployed at:", address(testContract));
        console.log("Owner is:", testContract.owner());
    }
}
