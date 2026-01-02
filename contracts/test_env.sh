#!/bin/bash

# Test script to verify Foundry environment
echo "Testing Foundry environment..."

# Check if forge is available
if command -v forge &> /dev/null; then
    echo "✓ Forge is available"
    forge --version
else
    echo "✗ Forge not found in PATH"
    echo "Trying ~/.foundry/bin/forge..."
    if [ -f ~/.foundry/bin/forge ]; then
        echo "✓ Found forge in ~/.foundry/bin/"
        ~/.foundry/bin/forge --version
        export PATH="$HOME/.foundry/bin:$PATH"
    else
        echo "✗ Forge not found"
        exit 1
    fi
fi

# Test compilation
echo "Testing compilation..."
forge build

# Test specific property test
echo "Testing royalty bounds validation..."
forge test --match-test testFuzz_RoyaltyBoundsValidation -vv

echo "Environment test complete!"