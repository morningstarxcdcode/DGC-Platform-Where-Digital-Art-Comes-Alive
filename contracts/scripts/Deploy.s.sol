// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {DGCToken} from "../contracts/DGCToken.sol";
import {ProvenanceRegistry} from "../contracts/ProvenanceRegistry.sol";
import {RoyaltySplitter} from "../contracts/RoyaltySplitter.sol";
import {Marketplace} from "../contracts/Marketplace.sol";

/**
 * @title Deploy
 * @notice Foundry deployment script for DGC Platform contracts
 * @dev Run with: forge script scripts/Deploy.s.sol --rpc-url <RPC_URL> --broadcast
 */
contract Deploy is Script {
    // Deployed contract instances
    DGCToken public dgcToken;
    ProvenanceRegistry public provenanceRegistry;
    RoyaltySplitter public royaltySplitter;
    Marketplace public marketplace;

    // Configuration
    address public deployer;
    uint96 public defaultRoyaltyBps = 1000; // 10%
    uint256 public marketplaceFeeBps = 250; // 2.5%

    function setUp() public {
        deployer = vm.envOr("DEPLOYER_ADDRESS", address(0));
        if (deployer == address(0)) {
            deployer = msg.sender;
        }
    }

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        
        console.log("=== DGC Platform Deployment ===");
        console.log("Deployer:", deployer);
        console.log("Chain ID:", block.chainid);
        console.log("");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy ProvenanceRegistry
        console.log("Deploying ProvenanceRegistry...");
        provenanceRegistry = new ProvenanceRegistry();
        console.log("ProvenanceRegistry deployed at:", address(provenanceRegistry));

        // 2. Deploy RoyaltySplitter
        console.log("Deploying RoyaltySplitter...");
        royaltySplitter = new RoyaltySplitter();
        console.log("RoyaltySplitter deployed at:", address(royaltySplitter));

        // 3. Deploy DGCToken with registry and royalty splitter
        console.log("Deploying DGCToken...");
        dgcToken = new DGCToken(
            address(provenanceRegistry),
            address(royaltySplitter)
        );
        console.log("DGCToken deployed at:", address(dgcToken));

        // 4. Deploy Marketplace
        console.log("Deploying Marketplace...");
        marketplace = new Marketplace(
            address(dgcToken),
            address(royaltySplitter),
            marketplaceFeeBps
        );
        console.log("Marketplace deployed at:", address(marketplace));

        // 5. Configure permissions
        console.log("Configuring permissions...");
        
        // Grant REGISTRAR_ROLE to DGCToken on ProvenanceRegistry
        bytes32 REGISTRAR_ROLE = provenanceRegistry.REGISTRAR_ROLE();
        provenanceRegistry.grantRole(REGISTRAR_ROLE, address(dgcToken));
        console.log("Granted REGISTRAR_ROLE to DGCToken");

        // Grant MINTER_ROLE to deployer on DGCToken for initial minting
        bytes32 MINTER_ROLE = dgcToken.MINTER_ROLE();
        dgcToken.grantRole(MINTER_ROLE, deployer);
        console.log("Granted MINTER_ROLE to deployer");

        // Grant OPERATOR_ROLE to Marketplace for NFT transfers
        dgcToken.setApprovalForAll(address(marketplace), true);
        console.log("Approved Marketplace for NFT operations");

        vm.stopBroadcast();

        // Log deployment summary
        console.log("");
        console.log("=== Deployment Complete ===");
        console.log("ProvenanceRegistry:", address(provenanceRegistry));
        console.log("RoyaltySplitter:", address(royaltySplitter));
        console.log("DGCToken:", address(dgcToken));
        console.log("Marketplace:", address(marketplace));
        console.log("");
        console.log("Add these to your .env:");
        console.log("VITE_DGC_TOKEN_ADDRESS=", address(dgcToken));
        console.log("VITE_PROVENANCE_ADDRESS=", address(provenanceRegistry));
        console.log("VITE_ROYALTY_ADDRESS=", address(royaltySplitter));
        console.log("VITE_MARKETPLACE_ADDRESS=", address(marketplace));
    }

    /**
     * @notice Deploy to local Anvil instance
     */
    function deployLocal() public {
        vm.startBroadcast();
        
        provenanceRegistry = new ProvenanceRegistry();
        royaltySplitter = new RoyaltySplitter();
        dgcToken = new DGCToken(address(provenanceRegistry), address(royaltySplitter));
        marketplace = new Marketplace(address(dgcToken), address(royaltySplitter), marketplaceFeeBps);

        // Setup permissions
        provenanceRegistry.grantRole(provenanceRegistry.REGISTRAR_ROLE(), address(dgcToken));
        dgcToken.grantRole(dgcToken.MINTER_ROLE(), msg.sender);

        vm.stopBroadcast();

        console.log("Local deployment complete");
        console.log("DGCToken:", address(dgcToken));
        console.log("Marketplace:", address(marketplace));
    }
}
