// scripts/deploy.js
// Deployment script for DGC Platform contracts

const { ethers, network, run } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Deploying DGC Platform contracts...");
    console.log(`Network: ${network.name}`);

    const [deployer] = await ethers.getSigners();
    console.log(`Deployer: ${deployer.address}`);
    console.log(`Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH`);

    // Deploy ProvenanceRegistry
    console.log("\n📝 Deploying ProvenanceRegistry...");
    const ProvenanceRegistry = await ethers.getContractFactory("ProvenanceRegistry");
    const provenanceRegistry = await ProvenanceRegistry.deploy();
    await provenanceRegistry.waitForDeployment();
    const provenanceRegistryAddress = await provenanceRegistry.getAddress();
    console.log(`✅ ProvenanceRegistry deployed at: ${provenanceRegistryAddress}`);

    // Deploy DGCToken
    console.log("\n🎨 Deploying DGCToken...");
    const DGCToken = await ethers.getContractFactory("DGCToken");
    const dgcToken = await DGCToken.deploy(
        "DGC Token",
        "DGC",
        provenanceRegistryAddress
    );
    await dgcToken.waitForDeployment();
    const dgcTokenAddress = await dgcToken.getAddress();
    console.log(`✅ DGCToken deployed at: ${dgcTokenAddress}`);

    // Deploy RoyaltySplitter
    console.log("\n💰 Deploying RoyaltySplitter...");
    const RoyaltySplitter = await ethers.getContractFactory("RoyaltySplitter");
    const royaltySplitter = await RoyaltySplitter.deploy();
    await royaltySplitter.waitForDeployment();
    const royaltySplitterAddress = await royaltySplitter.getAddress();
    console.log(`✅ RoyaltySplitter deployed at: ${royaltySplitterAddress}`);

    // Deploy Marketplace
    console.log("\n🏪 Deploying Marketplace...");
    const Marketplace = await ethers.getContractFactory("Marketplace");
    const marketplace = await Marketplace.deploy(
        royaltySplitterAddress,
        deployer.address // Fee recipient is deployer for now
    );
    await marketplace.waitForDeployment();
    const marketplaceAddress = await marketplace.getAddress();
    console.log(`✅ Marketplace deployed at: ${marketplaceAddress}`);

    // Grant roles
    console.log("\n🔐 Setting up roles...");
    
    // Grant REGISTRAR_ROLE to DGCToken so it can register provenance
    const REGISTRAR_ROLE = await provenanceRegistry.REGISTRAR_ROLE();
    await provenanceRegistry.grantRole(REGISTRAR_ROLE, dgcTokenAddress);
    console.log(`✅ Granted REGISTRAR_ROLE to DGCToken`);

    // Grant ADMIN_ROLE to marketplace for royalty management
    const ADMIN_ROLE = await royaltySplitter.ADMIN_ROLE();
    await royaltySplitter.grantRole(ADMIN_ROLE, marketplaceAddress);
    console.log(`✅ Granted ADMIN_ROLE to Marketplace`);

    // Save deployment info
    const deploymentInfo = {
        network: network.name,
        chainId: network.config.chainId,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {
            ProvenanceRegistry: provenanceRegistryAddress,
            DGCToken: dgcTokenAddress,
            RoyaltySplitter: royaltySplitterAddress,
            Marketplace: marketplaceAddress
        }
    };

    const deploymentDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentDir)) {
        fs.mkdirSync(deploymentDir, { recursive: true });
    }

    const deploymentPath = path.join(deploymentDir, `${network.name}.json`);
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\n📄 Deployment info saved to: ${deploymentPath}`);

    // Verify contracts on Etherscan (if not localhost)
    if (network.name !== "localhost" && network.name !== "hardhat") {
        console.log("\n🔍 Verifying contracts on Etherscan...");
        
        // Wait for block confirmations
        console.log("Waiting for block confirmations...");
        await new Promise(resolve => setTimeout(resolve, 30000));

        try {
            await run("verify:verify", {
                address: provenanceRegistryAddress,
                constructorArguments: []
            });
            console.log("✅ ProvenanceRegistry verified");
        } catch (error) {
            console.log(`⚠️ ProvenanceRegistry verification failed: ${error.message}`);
        }

        try {
            await run("verify:verify", {
                address: dgcTokenAddress,
                constructorArguments: ["DGC Token", "DGC", provenanceRegistryAddress]
            });
            console.log("✅ DGCToken verified");
        } catch (error) {
            console.log(`⚠️ DGCToken verification failed: ${error.message}`);
        }

        try {
            await run("verify:verify", {
                address: royaltySplitterAddress,
                constructorArguments: []
            });
            console.log("✅ RoyaltySplitter verified");
        } catch (error) {
            console.log(`⚠️ RoyaltySplitter verification failed: ${error.message}`);
        }

        try {
            await run("verify:verify", {
                address: marketplaceAddress,
                constructorArguments: [royaltySplitterAddress, deployer.address]
            });
            console.log("✅ Marketplace verified");
        } catch (error) {
            console.log(`⚠️ Marketplace verification failed: ${error.message}`);
        }
    }

    console.log("\n🎉 Deployment complete!");
    console.log("\n📋 Contract Addresses:");
    console.log(`   ProvenanceRegistry: ${provenanceRegistryAddress}`);
    console.log(`   DGCToken:           ${dgcTokenAddress}`);
    console.log(`   RoyaltySplitter:    ${royaltySplitterAddress}`);
    console.log(`   Marketplace:        ${marketplaceAddress}`);

    return deploymentInfo;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
