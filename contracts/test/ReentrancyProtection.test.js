const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * @title Reentrancy Protection Tests
 * @dev Tests to verify reentrancy protection in RoyaltySplitter
 * This serves as a verification for Property 14: Reentrancy Protection
 */
describe("RoyaltySplitter - Reentrancy Protection", function () {
    let royaltySplitter;
    let maliciousContract;
    let admin, legitimateRecipient, attacker;

    beforeEach(async function () {
        [admin, legitimateRecipient, attacker] = await ethers.getSigners();
        
        // Deploy RoyaltySplitter
        const RoyaltySplitter = await ethers.getContractFactory("RoyaltySplitter");
        royaltySplitter = await RoyaltySplitter.deploy();
        await royaltySplitter.waitForDeployment();

        // Deploy malicious contract
        const MaliciousRecipient = await ethers.getContractFactory("MaliciousRecipient");
        maliciousContract = await MaliciousRecipient.deploy(await royaltySplitter.getAddress());
        await maliciousContract.waitForDeployment();
    });

    describe("Property 14: Reentrancy Protection", function () {
        it("Should prevent reentrancy attacks during royalty distribution", async function () {
            const tokenId = 1;
            const salePrice = ethers.parseEther("1");
            const royaltyBps = 1000; // 10%

            // Setup royalty configuration with malicious contract as recipient
            const recipients = [await maliciousContract.getAddress(), legitimateRecipient.address];
            const shares = [5000, 5000]; // 50% each
            
            await royaltySplitter.setRoyalty(tokenId, recipients, shares, royaltyBps);

            const expectedTotalRoyalty = salePrice * BigInt(royaltyBps) / BigInt(10000);
            const expectedMaliciousAmount = expectedTotalRoyalty / BigInt(2);
            const expectedLegitimateAmount = expectedTotalRoyalty - expectedMaliciousAmount;

            // Setup the attack
            await maliciousContract.setupAttack(tokenId, salePrice, true);

            // Record initial balances
            const maliciousBalanceBefore = await ethers.provider.getBalance(await maliciousContract.getAddress());
            const legitimateBalanceBefore = await ethers.provider.getBalance(legitimateRecipient.address);
            const attackerBalanceBefore = await ethers.provider.getBalance(attacker.address);

            // Attempt the attack - this should NOT revert, but should prevent reentrancy
            const tx = await royaltySplitter.connect(attacker).processRoyalty(tokenId, salePrice, {
                value: expectedTotalRoyalty
            });
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed * receipt.gasPrice;

            // Verify reentrancy protection worked
            const maliciousBalanceAfter = await ethers.provider.getBalance(await maliciousContract.getAddress());
            const legitimateBalanceAfter = await ethers.provider.getBalance(legitimateRecipient.address);
            const attackerBalanceAfter = await ethers.provider.getBalance(attacker.address);

            // Verify correct distribution despite reentrancy attempt
            expect(maliciousBalanceAfter - maliciousBalanceBefore).to.equal(expectedMaliciousAmount);
            expect(legitimateBalanceAfter - legitimateBalanceBefore).to.equal(expectedLegitimateAmount);

            // Verify attacker only lost the royalty amount + gas (no extra drainage)
            expect(attackerBalanceBefore - attackerBalanceAfter).to.equal(expectedTotalRoyalty + gasUsed);

            // Verify the attack was attempted but failed
            expect(await maliciousContract.attackCount()).to.be.greaterThan(0);
        });

        it("Should work normally with legitimate recipients", async function () {
            const tokenId = 2;
            const salePrice = ethers.parseEther("0.5");
            const royaltyBps = 500; // 5%

            // Setup with legitimate recipient only
            const recipients = [legitimateRecipient.address];
            const shares = [10000]; // 100%
            
            await royaltySplitter.setRoyalty(tokenId, recipients, shares, royaltyBps);

            const expectedRoyalty = salePrice * BigInt(royaltyBps) / BigInt(10000);

            // Setup malicious contract but disable attack
            await maliciousContract.setupAttack(tokenId, salePrice, false);

            // Record balances
            const legitimateBalanceBefore = await ethers.provider.getBalance(legitimateRecipient.address);
            const attackerBalanceBefore = await ethers.provider.getBalance(attacker.address);

            // Process legitimate payment
            const tx = await royaltySplitter.connect(attacker).processRoyalty(tokenId, salePrice, {
                value: expectedRoyalty
            });
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed * receipt.gasPrice;

            // Verify normal operation
            const legitimateBalanceAfter = await ethers.provider.getBalance(legitimateRecipient.address);
            const attackerBalanceAfter = await ethers.provider.getBalance(attacker.address);

            expect(legitimateBalanceAfter - legitimateBalanceBefore).to.equal(expectedRoyalty);
            expect(attackerBalanceBefore - attackerBalanceAfter).to.equal(expectedRoyalty + gasUsed);
        });

        it("Should handle multiple reentrancy attempts consistently", async function () {
            const salePrice = ethers.parseEther("1");
            const royaltyBps = 1000; // 10%

            // Setup with malicious recipient for multiple tokens
            const recipients = [await maliciousContract.getAddress()];
            const shares = [10000];

            // Setup royalty configs for multiple tokens
            for (let i = 1; i <= 3; i++) {
                await royaltySplitter.setRoyalty(i, recipients, shares, royaltyBps);
            }

            const expectedRoyalty = salePrice * BigInt(royaltyBps) / BigInt(10000);

            // Perform multiple attacks on different tokens
            for (let i = 1; i <= 3; i++) {
                await maliciousContract.setupAttack(i, salePrice, true);
                
                const balanceBefore = await ethers.provider.getBalance(await maliciousContract.getAddress());
                
                await royaltySplitter.connect(attacker).processRoyalty(i, salePrice, {
                    value: expectedRoyalty
                });
                
                const balanceAfter = await ethers.provider.getBalance(await maliciousContract.getAddress());
                
                // Each attack should only result in legitimate payment
                expect(balanceAfter - balanceBefore).to.equal(expectedRoyalty);
            }
        });
    });
});

// Malicious contract that attempts reentrancy
const maliciousContractSource = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IRoyaltySplitter {
    function processRoyalty(uint256 tokenId, uint256 salePrice) external payable;
}

contract MaliciousRecipient {
    IRoyaltySplitter public royaltySplitter;
    uint256 public tokenId;
    uint256 public salePrice;
    uint256 public attackCount;
    bool public shouldAttack;
    
    constructor(address _royaltySplitter) {
        royaltySplitter = IRoyaltySplitter(_royaltySplitter);
    }
    
    function setupAttack(uint256 _tokenId, uint256 _salePrice, bool _shouldAttack) external {
        tokenId = _tokenId;
        salePrice = _salePrice;
        shouldAttack = _shouldAttack;
        attackCount = 0;
    }
    
    receive() external payable {
        if (shouldAttack && attackCount < 3) { // Limit attempts to avoid infinite loop
            attackCount++;
            try royaltySplitter.processRoyalty{value: msg.value}(tokenId, salePrice) {
                // Reentrancy attack succeeded - this should not happen
            } catch {
                // Reentrancy attack failed - this is expected
            }
        }
    }
}
`;