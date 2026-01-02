// Simple contract structure test
const fs = require('fs');
const path = require('path');

console.log('Running simple contract structure test...');

// Check if contracts directory exists
const contractsDir = path.join(__dirname, 'contracts');
if (!fs.existsSync(contractsDir)) {
    console.error('❌ Contracts directory not found');
    process.exit(1);
}

// Check for Solidity files
const solidityFiles = fs.readdirSync(contractsDir).filter(file => file.endsWith('.sol'));
if (solidityFiles.length === 0) {
    console.error('❌ No Solidity files found');
    process.exit(1);
}

console.log(`✅ Found ${solidityFiles.length} Solidity files:`);
solidityFiles.forEach(file => console.log(`   - ${file}`));

console.log('✅ Contract structure test passed');
