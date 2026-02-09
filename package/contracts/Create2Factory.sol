// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Create2Factory
 * @notice Minimal CREATE2 factory for deterministic deployments
 * @dev Deploy this first, then use it to deploy other contracts
 */
contract Create2Factory {
    event Deployed(address indexed addr, bytes32 indexed salt, bytes32 bytecodeHash);

    /**
     * @notice Deploy a contract using CREATE2
     * @param salt Unique salt for deterministic address
     * @param bytecode Contract creation bytecode (with constructor args encoded)
     * @return addr The deployed contract address
     */
    function deploy(bytes32 salt, bytes memory bytecode) external payable returns (address addr) {
        require(bytecode.length > 0, "Create2Factory: no bytecode");
        
        assembly {
            addr := create2(callvalue(), add(bytecode, 0x20), mload(bytecode), salt)
        }
        
        require(addr != address(0), "Create2Factory: deployment failed");
        
        emit Deployed(addr, salt, keccak256(bytecode));
        
        return addr;
    }

    /**
     * @notice Calculate the CREATE2 address for a deployment
     * @param salt Unique salt
     * @param bytecodeHash keccak256 of contract creation bytecode
     * @return The deterministic address where contract will be deployed
     */
    function computeAddress(bytes32 salt, bytes32 bytecodeHash) external view returns (address) {
        return address(
            uint160(
                uint256(
                    keccak256(
                        abi.encodePacked(
                            bytes1(0xff),
                            address(this),
                            salt,
                            bytecodeHash
                        )
                    )
                )
            )
        );
    }
}
