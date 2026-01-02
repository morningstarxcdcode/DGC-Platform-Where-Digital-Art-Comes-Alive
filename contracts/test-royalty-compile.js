const { ethers } = require("hardhat");

async function main() {
    console.log("Testing RoyaltySplitter contract compilation and basic functionality...");
    
    try {
        // Get contract factory
        const RoyaltySplitter = await ethers.getContractFactory("RoyaltySplitter");
        console.log("✓ RoyaltySplitter contract compiled successfully");
        
        // Deploy contract
        const royaltySplitter = await RoyaltySplitter.deploy();
        await royaltySplitter.waitForDeployment();
        console.log("✓ RoyaltySplitter contract deployed successfully");
        
        // Get signers
        const [admin, creator1, creator2] = await ethers.getSigners();
        
        // Test basic royalty configuration
        const tokenId = 1;
        const recipients = [creator1.address];
        const shares = [10000]; // 100%
        const royaltyBps = 1000; // 10%
        
        await royaltySplitter.setRoyalty(tokenId, recipients, shares, royaltyBps);
        console.log("✓ Basic royalty configuration set successfully");
        
        // Verify configuration
        const hasConfig = await royaltySplitter.hasRoyaltyConfig(tokenId);
        if (hasConfig) {
            console.log("✓ Royalty configuration verified");
        } else {
            throw new Error("Royalty configuration not found");
        }
        
        // Test parent royalty setup
        const parentTokenId = 2;
        await royaltySplitter.setRoyalty(parentTokenId, [creator2.address], [10000], 500);
        
        const derivedTokenId = 3;
        await royaltySplitter.setRoyaltyWithParents(
            derivedTokenId,
            [creator1.address],
            [10000],
            750, // 7.5%
            [parentTokenId],
            200  // 2%
        );
        console.log("✓ Parent royalty enforcement configured successfully");
        
        // Test royalty info retrieval
        const salePrice = ethers.parseEther("1");
        const [totalRoyalty, parentRoyalty, hasParentRoyalty] = 
            await royaltySplitter.getCompleteRoyaltyInfo(derivedTokenId, salePrice);
        
        if (hasParentRoyalty && parentRoyalty > 0) {
            console.log("✓ Parent royalty info retrieved successfully");
        } else {
            throw new Error("Parent royalty info incorrect");
        }
        
        console.log("\n🎉 All RoyaltySplitter tests passed!");
        console.log("Contract address:", await royaltySplitter.getAddress());
        
    } catch (error) {
        console.error("❌ Test failed:", error.message);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });