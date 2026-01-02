const { ethers } = require("hardhat");

/**
 * Property-Based Test Verification Script
 * Tests Property 7: Royalty Bounds Validation
 * Validates: Requirements 4.2, 4.3
 */
async function verifyRoyaltyBounds() {
    console.log("🧪 Testing Property 7: Royalty Bounds Validation");
    console.log("Feature: decentralized-generative-content-platform");
    console.log("Validates: Requirements 4.2, 4.3");
    console.log("");

    try {
        // Deploy contract
        const [admin, creator1] = await ethers.getSigners();
        const RoyaltySplitter = await ethers.getContractFactory("RoyaltySplitter");
        const royaltySplitter = await RoyaltySplitter.deploy();
        await royaltySplitter.waitForDeployment();

        console.log("✓ Contract deployed successfully");

        // Test data
        const recipients = [creator1.address];
        const shares = [10000]; // 100%
        let passedTests = 0;
        let totalTests = 0;

        // Test valid royalty percentages (0 to 2500 bps)
        console.log("\n📋 Testing valid royalty percentages (0-2500 bps)...");
        
        const validPercentages = [0, 1, 100, 500, 1000, 1500, 2000, 2499, 2500];
        
        for (const royaltyBps of validPercentages) {
            totalTests++;
            try {
                const tokenId = totalTests;
                await royaltySplitter.setRoyalty(tokenId, recipients, shares, royaltyBps);
                
                // Verify the royalty was set correctly
                const hasConfig = await royaltySplitter.hasRoyaltyConfig(tokenId);
                if (!hasConfig) {
                    throw new Error("Royalty config not found after setting");
                }
                
                const [, , storedRoyaltyBps] = await royaltySplitter.getRoyaltyConfig(tokenId);
                if (storedRoyaltyBps !== BigInt(royaltyBps)) {
                    throw new Error(`Stored royalty ${storedRoyaltyBps} doesn't match input ${royaltyBps}`);
                }
                
                console.log(`  ✓ ${royaltyBps} bps (${royaltyBps/100}%) - PASSED`);
                passedTests++;
            } catch (error) {
                console.log(`  ✗ ${royaltyBps} bps (${royaltyBps/100}%) - FAILED: ${error.message}`);
            }
        }

        // Test invalid royalty percentages (above 2500 bps)
        console.log("\n📋 Testing invalid royalty percentages (>2500 bps)...");
        
        const invalidPercentages = [2501, 2600, 3000, 5000, 10000, 65535];
        
        for (const royaltyBps of invalidPercentages) {
            totalTests++;
            try {
                const tokenId = totalTests + 1000; // Use different token IDs
                await royaltySplitter.setRoyalty(tokenId, recipients, shares, royaltyBps);
                
                // If we reach here, the transaction didn't revert (which is wrong)
                console.log(`  ✗ ${royaltyBps} bps (${royaltyBps/100}%) - FAILED: Should have reverted but didn't`);
            } catch (error) {
                if (error.message.includes("Total royalty exceeds maximum")) {
                    console.log(`  ✓ ${royaltyBps} bps (${royaltyBps/100}%) - PASSED: Correctly reverted`);
                    passedTests++;
                } else {
                    console.log(`  ✗ ${royaltyBps} bps (${royaltyBps/100}%) - FAILED: Wrong error: ${error.message}`);
                }
            }
        }

        // Test boundary values specifically
        console.log("\n📋 Testing boundary values...");
        
        // Test exactly at the boundary
        totalTests++;
        try {
            await royaltySplitter.setRoyalty(2000, recipients, shares, 2500);
            console.log("  ✓ Boundary value 2500 bps (25%) - PASSED");
            passedTests++;
        } catch (error) {
            console.log(`  ✗ Boundary value 2500 bps (25%) - FAILED: ${error.message}`);
        }

        // Test just above the boundary
        totalTests++;
        try {
            await royaltySplitter.setRoyalty(2001, recipients, shares, 2501);
            console.log("  ✗ Boundary value 2501 bps (25.01%) - FAILED: Should have reverted");
        } catch (error) {
            if (error.message.includes("Total royalty exceeds maximum")) {
                console.log("  ✓ Boundary value 2501 bps (25.01%) - PASSED: Correctly reverted");
                passedTests++;
            } else {
                console.log(`  ✗ Boundary value 2501 bps (25.01%) - FAILED: Wrong error: ${error.message}`);
            }
        }

        // Summary
        console.log("\n" + "=".repeat(60));
        console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`);
        
        if (passedTests === totalTests) {
            console.log("🎉 Property 7: Royalty Bounds Validation - PASSED");
            console.log("✅ All royalty percentage validations work correctly");
            return true;
        } else {
            console.log("❌ Property 7: Royalty Bounds Validation - FAILED");
            console.log(`💥 ${totalTests - passedTests} test(s) failed`);
            return false;
        }

    } catch (error) {
        console.error("💥 Test execution failed:", error.message);
        return false;
    }
}

// Run the verification
if (require.main === module) {
    verifyRoyaltyBounds()
        .then((success) => {
            process.exit(success ? 0 : 1);
        })
        .catch((error) => {
            console.error("Script failed:", error);
            process.exit(1);
        });
}

module.exports = { verifyRoyaltyBounds };