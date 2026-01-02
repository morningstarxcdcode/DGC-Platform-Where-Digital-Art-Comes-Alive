const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * @title RoyaltySplitter Tests
 * @dev Basic functionality tests for RoyaltySplitter contract
 * These tests verify the core functionality works correctly
 */
describe("RoyaltySplitter", function () {
    let royaltySplitter;
    let admin, creator1, creator2, buyer;

    beforeEach(async function () {
        [admin, creator1, creator2, buyer] = await ethers.getSigners();
        
        const RoyaltySplitter = await ethers.getContractFactory("RoyaltySplitter");
        royaltySplitter = await RoyaltySplitter.deploy();
        await royaltySplitter.waitForDeployment();
    });

    describe("Basic Royalty Configuration", function () {
        it("Should set royalty configuration correctly", async function () {
            const tokenId = 1;
            const recipients = [creator1.address];
            const shares = [10000]; // 100%
            const royaltyBps = 1000; // 10%

            await royaltySplitter.setRoyalty(tokenId, recipients, shares, royaltyBps);

            expect(await royaltySplitter.hasRoyaltyConfig(tokenId)).to.be.true;

            const [returnedRecipients, returnedShares, returnedRoyaltyBps] = 
                await royaltySplitter.getRoyaltyConfig(tokenId);

            expect(returnedRecipients).to.deep.equal(recipients);
            expect(returnedShares).to.deep.equal(shares);
            expect(returnedRoyaltyBps).to.equal(royaltyBps);
        });

        it("Should reject royalty percentage above maximum", async function () {
            const tokenId = 1;
            const recipients = [creator1.address];
            const shares = [10000];
            const invalidRoyaltyBps = 2501; // Above 25% limit

            await expect(
                royaltySplitter.setRoyalty(tokenId, recipients, shares, invalidRoyaltyBps)
            ).to.be.revertedWith("RoyaltySplitter: Total royalty exceeds maximum");
        });

        it("Should reject shares that don't sum to 100%", async function () {
            const tokenId = 1;
            const recipients = [creator1.address, creator2.address];
            const invalidShares = [5000, 4000]; // Only 90%
            const royaltyBps = 1000;

            await expect(
                royaltySplitter.setRoyalty(tokenId, recipients, invalidShares, royaltyBps)
            ).to.be.revertedWith("RoyaltySplitter: Shares must sum to 100%");
        });
    });

    describe("Royalty Processing", function () {
        it("Should process single recipient royalty correctly", async function () {
            const tokenId = 1;
            const recipients = [creator1.address];
            const shares = [10000]; // 100%
            const royaltyBps = 1000; // 10%
            const salePrice = ethers.parseEther("1");

            await royaltySplitter.setRoyalty(tokenId, recipients, shares, royaltyBps);

            const expectedRoyalty = salePrice * BigInt(royaltyBps) / BigInt(10000);
            const initialBalance = await ethers.provider.getBalance(creator1.address);

            await royaltySplitter.connect(buyer).processRoyalty(tokenId, salePrice, {
                value: expectedRoyalty
            });

            const finalBalance = await ethers.provider.getBalance(creator1.address);
            expect(finalBalance - initialBalance).to.equal(expectedRoyalty);
        });

        it("Should process multi-recipient royalty correctly", async function () {
            const tokenId = 1;
            const recipients = [creator1.address, creator2.address];
            const shares = [6000, 4000]; // 60%, 40%
            const royaltyBps = 1000; // 10%
            const salePrice = ethers.parseEther("1");

            await royaltySplitter.setRoyalty(tokenId, recipients, shares, royaltyBps);

            const totalRoyalty = salePrice * BigInt(royaltyBps) / BigInt(10000);
            const expectedCreator1 = totalRoyalty * BigInt(6000) / BigInt(10000);
            const expectedCreator2 = totalRoyalty - expectedCreator1; // Remainder for rounding

            const initialBalance1 = await ethers.provider.getBalance(creator1.address);
            const initialBalance2 = await ethers.provider.getBalance(creator2.address);

            await royaltySplitter.connect(buyer).processRoyalty(tokenId, salePrice, {
                value: totalRoyalty
            });

            const finalBalance1 = await ethers.provider.getBalance(creator1.address);
            const finalBalance2 = await ethers.provider.getBalance(creator2.address);

            expect(finalBalance1 - initialBalance1).to.equal(expectedCreator1);
            expect(finalBalance2 - initialBalance2).to.equal(expectedCreator2);
        });

        it("Should return excess payment", async function () {
            const tokenId = 1;
            const recipients = [creator1.address];
            const shares = [10000];
            const royaltyBps = 1000; // 10%
            const salePrice = ethers.parseEther("1");

            await royaltySplitter.setRoyalty(tokenId, recipients, shares, royaltyBps);

            const expectedRoyalty = salePrice * BigInt(royaltyBps) / BigInt(10000);
            const excessPayment = ethers.parseEther("0.1");
            const totalPayment = expectedRoyalty + excessPayment;

            const initialBuyerBalance = await ethers.provider.getBalance(buyer.address);
            const initialCreatorBalance = await ethers.provider.getBalance(creator1.address);

            const tx = await royaltySplitter.connect(buyer).processRoyalty(tokenId, salePrice, {
                value: totalPayment
            });
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed * receipt.gasPrice;

            const finalBuyerBalance = await ethers.provider.getBalance(buyer.address);
            const finalCreatorBalance = await ethers.provider.getBalance(creator1.address);

            // Creator should receive exactly the royalty amount
            expect(finalCreatorBalance - initialCreatorBalance).to.equal(expectedRoyalty);
            
            // Buyer should only lose royalty amount + gas (excess should be returned)
            expect(initialBuyerBalance - finalBuyerBalance).to.equal(expectedRoyalty + gasUsed);
        });
    });

    describe("Parent Royalty Enforcement", function () {
        it("Should set up derived token with parent royalties", async function () {
            // Setup parent token first
            const parentTokenId = 1;
            const parentRecipients = [creator1.address];
            const parentShares = [10000];
            const parentRoyaltyBps = 500; // 5%

            await royaltySplitter.setRoyalty(parentTokenId, parentRecipients, parentShares, parentRoyaltyBps);

            // Setup derived token with parent royalties
            const derivedTokenId = 2;
            const derivedRecipients = [creator2.address];
            const derivedShares = [10000];
            const derivedRoyaltyBps = 750; // 7.5%
            const parentTokenIds = [parentTokenId];
            const parentRoyaltyEnforcementBps = 200; // 2%

            await royaltySplitter.setRoyaltyWithParents(
                derivedTokenId,
                derivedRecipients,
                derivedShares,
                derivedRoyaltyBps,
                parentTokenIds,
                parentRoyaltyEnforcementBps
            );

            expect(await royaltySplitter.hasRoyaltyConfig(derivedTokenId)).to.be.true;

            const [parentIds, parentRoyalty, hasParentRoyalty] = 
                await royaltySplitter.getParentRoyaltyInfo(derivedTokenId);

            expect(parentIds).to.deep.equal(parentTokenIds);
            expect(parentRoyalty).to.equal(parentRoyaltyEnforcementBps);
            expect(hasParentRoyalty).to.be.true;
        });

        it("Should process parent royalties correctly", async function () {
            // Setup parent token
            const parentTokenId = 1;
            const parentRecipients = [creator1.address];
            const parentShares = [10000];
            await royaltySplitter.setRoyalty(parentTokenId, parentRecipients, parentShares, 500);

            // Setup derived token with parent royalties
            const derivedTokenId = 2;
            const derivedRecipients = [creator2.address];
            const derivedShares = [10000];
            const derivedRoyaltyBps = 1000; // 10%
            const parentTokenIds = [parentTokenId];
            const parentRoyaltyBps = 300; // 3%

            await royaltySplitter.setRoyaltyWithParents(
                derivedTokenId,
                derivedRecipients,
                derivedShares,
                derivedRoyaltyBps,
                parentTokenIds,
                parentRoyaltyBps
            );

            const salePrice = ethers.parseEther("1");
            const expectedDerivedRoyalty = salePrice * BigInt(derivedRoyaltyBps) / BigInt(10000);
            const expectedParentRoyalty = salePrice * BigInt(parentRoyaltyBps) / BigInt(10000);
            const totalPayment = expectedDerivedRoyalty + expectedParentRoyalty;

            const initialCreator1Balance = await ethers.provider.getBalance(creator1.address);
            const initialCreator2Balance = await ethers.provider.getBalance(creator2.address);

            await royaltySplitter.connect(buyer).processRoyalty(derivedTokenId, salePrice, {
                value: totalPayment
            });

            const finalCreator1Balance = await ethers.provider.getBalance(creator1.address);
            const finalCreator2Balance = await ethers.provider.getBalance(creator2.address);

            // Derived creator should receive derived royalty
            expect(finalCreator2Balance - initialCreator2Balance).to.equal(expectedDerivedRoyalty);
            
            // Parent creator should receive parent royalty
            expect(finalCreator1Balance - initialCreator1Balance).to.equal(expectedParentRoyalty);
        });
    });

    describe("Access Control", function () {
        it("Should only allow admin to set royalties", async function () {
            const tokenId = 1;
            const recipients = [creator1.address];
            const shares = [10000];
            const royaltyBps = 1000;

            await expect(
                royaltySplitter.connect(creator1).setRoyalty(tokenId, recipients, shares, royaltyBps)
            ).to.be.reverted;
        });

        it("Should allow admin to grant admin role", async function () {
            await royaltySplitter.grantAdminRole(creator1.address);
            
            // creator1 should now be able to set royalties
            const tokenId = 1;
            const recipients = [creator2.address];
            const shares = [10000];
            const royaltyBps = 1000;

            await expect(
                royaltySplitter.connect(creator1).setRoyalty(tokenId, recipients, shares, royaltyBps)
            ).to.not.be.reverted;
        });
    });

    describe("View Functions", function () {
        it("Should return correct royalty info", async function () {
            const tokenId = 1;
            const recipients = [creator1.address, creator2.address];
            const shares = [7000, 3000]; // 70%, 30%
            const royaltyBps = 1500; // 15%
            const salePrice = ethers.parseEther("2");

            await royaltySplitter.setRoyalty(tokenId, recipients, shares, royaltyBps);

            const [returnedRecipients, returnedAmounts] = 
                await royaltySplitter.getRoyaltyInfo(tokenId, salePrice);

            const totalRoyalty = salePrice * BigInt(royaltyBps) / BigInt(10000);
            const expectedAmount1 = totalRoyalty * BigInt(7000) / BigInt(10000);
            const expectedAmount2 = totalRoyalty - expectedAmount1; // Remainder

            expect(returnedRecipients).to.deep.equal(recipients);
            expect(returnedAmounts[0]).to.equal(expectedAmount1);
            expect(returnedAmounts[1]).to.equal(expectedAmount2);
        });

        it("Should return complete royalty info for derived tokens", async function () {
            // Setup parent and derived tokens
            const parentTokenId = 1;
            await royaltySplitter.setRoyalty(parentTokenId, [creator1.address], [10000], 500);

            const derivedTokenId = 2;
            const derivedRoyaltyBps = 1000;
            const parentRoyaltyBps = 300;

            await royaltySplitter.setRoyaltyWithParents(
                derivedTokenId,
                [creator2.address],
                [10000],
                derivedRoyaltyBps,
                [parentTokenId],
                parentRoyaltyBps
            );

            const salePrice = ethers.parseEther("1");
            const [totalRoyalty, parentRoyalty, hasParentRoyalty] = 
                await royaltySplitter.getCompleteRoyaltyInfo(derivedTokenId, salePrice);

            const expectedDerivedRoyalty = salePrice * BigInt(derivedRoyaltyBps) / BigInt(10000);
            const expectedParentRoyalty = salePrice * BigInt(parentRoyaltyBps) / BigInt(10000);

            expect(totalRoyalty).to.equal(expectedDerivedRoyalty);
            expect(parentRoyalty).to.equal(expectedParentRoyalty);
            expect(hasParentRoyalty).to.be.true;
        });
    });
});