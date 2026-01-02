// Simple test script for RoyaltySplitter without foundry dependency
const { execSync } = require('child_process');
const fs = require('fs');

async function main() {
    console.log("Testing RoyaltySplitter contract compilation...");
    
    try {
        // Backup original config
        if (fs.existsSync('hardhat.config.js')) {
            fs.copyFileSync('hardhat.config.js', 'hardhat.config.backup.js');
        }
        
        // Use temporary config without foundry
        if (fs.existsSync('hardhat.config.temp.js')) {
            fs.copyFileSync('hardhat.config.temp.js', 'hardhat.config.js');
        }
        
        console.log("Compiling contracts...");
        
        // Try to compile the contracts
        try {
            execSync('npx hardhat compile --force', { 
                stdio: 'pipe',
                timeout: 30000 
            });
            console.log("✓ RoyaltySplitter contract compiled successfully!");
            
            // Try to run a simple test
            console.log("Running basic functionality test...");
            execSync('npx hardhat test test/RoyaltySplitter.test.js', { 
                stdio: 'pipe',
                timeout: 60000 
            });
            console.log("✓ RoyaltySplitter tests passed!");
            
        } catch (compileError) {
            console.log("Compilation output:", compileError.stdout?.toString());
            console.log("Compilation error:", compileError.stderr?.toString());
            throw new Error("Compilation failed");
        }
        
    } catch (error) {
        console.error("❌ Test failed:", error.message);
        return false;
    } finally {
        // Restore original config
        if (fs.existsSync('hardhat.config.backup.js')) {
            fs.copyFileSync('hardhat.config.backup.js', 'hardhat.config.js');
            fs.unlinkSync('hardhat.config.backup.js');
        }
    }
    
    return true;
}

main()
    .then((success) => {
        if (success) {
            console.log("\n🎉 RoyaltySplitter contract verification completed successfully!");
            console.log("The contract compiles and basic functionality works correctly.");
            console.log("Property-based tests are ready to run once Foundry is installed.");
        }
        process.exit(success ? 0 : 1);
    })
    .catch((error) => {
        console.error("Unexpected error:", error);
        process.exit(1);
    });