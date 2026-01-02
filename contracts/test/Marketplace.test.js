const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * @title Marketplace Tests
 * @dev Property-based tests for Marketplace contract
 * Feature: decentralized-generative-content-platform
 */
describe("Marketplace", function () {
    let marketplace;
    let dgcToken;
    let provenanceRegistry;
    let royaltySplitter;
    let admin, seller, buyer, creator, feeRecipient;

    beforeEach(async function () {
        [admin, seller, buyer, creator, feeRecipient] = await ethers.getSigners();
        
        // Deploy contracts
        const ProvenanceRegistry = await ethers.getContractFactory("ProvenanceRegistry");
        provenanceRegistry = await ProvenanceRegistry.deploy();
        await provenanceRegistry.waitForDeployment();

        const DGCToken = await ethers.getContractFactory("DGCToken");
        dgcToken = await DGCToken.deploy("DGC Token", "DGC", await provenanceRegistry.getAddress());
        await dgcToken.waitForDeployment();

        const RoyaltySplitter = await ethers.getContractFactory("RoyaltySplitter");
        royaltySplitter = await RoyaltySplitter.deploy();
        await royaltySplitter.waitForDeployment();

        const Marketplace = await ethers.getContractFactory("Marketplace");
        marketplace = await Marketplace.deploy(
            await royaltySplitter.getAddress(),
            feeRecipient.address
        );
        await marketplace.waitForDeployment();

        // Grant roles
        await dgcToken.grantMinterRole(admin.address);
        const REGISTRAR_ROLE = await provenanceRegistry.REGISTRAR_ROLE();
        await provenanceRegistry.grantRole(REGISTRAR_ROLE, admin.address);
    });

    async function mintToken(to) {
        const modelHash = ethers.keccak256(ethers.toUtf8Bytes("model" + Date.now() + to.address));
        const promptHash = ethers.keccak256(ethers.toUtf8Bytes("prompt" + Date.now() + to.address));
        const provenanceHash = ethers.keccak256(
            ethers.solidityPacked(
                ["bytes32", "bytes32", "uint256", "address"],
                [modelHash, promptHash, Math.floor(Date.now() / 1000), to.address]
            )
        );

        await provenanceRegistry.registerProvenance(
            provenanceHash,
            modelHash,
            promptHash,
            to.address,
            []
        );

        const tx = await dgcToken.mint(to.address, "QmTestCID", provenanceHash);
        const receipt = await tx.wait();
        
        // Get tokenId from event
        const mintedEvent = receipt.logs.find(
            log => log.fragment && log.fragment.name === 'Minted'
        );
        const tokenId = mintedEvent.args[0];

        // Approve marketplace
        await dgcToken.connect(to).approve(await marketplace.getAddress(), tokenId);

        return tokenId;
    }

    describe("Listing", function () {
        it("Should list an NFT for sale", async function () {
            const tokenId = await mintToken(seller);
            const price = ethers.parseEther("1");

            await marketplace.connect(seller).listForSale(
                await dgcToken.getAddress(),
                tokenId,
                price
            );

            const [listedSeller, listedPrice, active] = await marketplace.getListing(
                await dgcToken.getAddress(),
                tokenId
            );

            expect(listedSeller).to.equal(seller.address);
            expect(listedPrice).to.equal(price);
            expect(active).to.be.true;
        });

        it("Should reject listing with zero price", async function () {
            const tokenId = await mintToken(seller);

            await expect(
                marketplace.connect(seller).listForSale(
                    await dgcToken.getAddress(),
                    tokenId,
                    0
                )
            ).to.be.revertedWith("Marketplace: Price must be greater than zero");
        });

        it("Should reject listing from non-owner", async function () {
            const tokenId = await mintToken(seller);

            await expect(
                marketplace.connect(buyer).listForSale(
                    await dgcToken.getAddress(),
                    tokenId,
                    ethers.parseEther("1")
                )
            ).to.be.revertedWith("Marketplace: Not token owner");
        });
    });

    describe("Purchasing", function () {
        it("Should complete a purchase atomically", async function () {
            const tokenId = await mintToken(seller);
            const price = ethers.parseEther("1");

            await marketplace.connect(seller).listForSale(
                await dgcToken.getAddress(),
                tokenId,
                price
            );

            const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);

            await marketplace.connect(buyer).buy(
                await dgcToken.getAddress(),
                tokenId,
                { value: price }
            );

            // Verify ownership transferred
            expect(await dgcToken.ownerOf(tokenId)).to.equal(buyer.address);

            // Verify listing is inactive
            expect(await marketplace.isListed(await dgcToken.getAddress(), tokenId)).to.be.false;

            // Verify seller received payment (minus fees)
            const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);
            const marketplaceFee = await marketplace.marketplaceFee();
            const basisPoints = await marketplace.BASIS_POINTS();
            const feeAmount = (price * marketplaceFee) / basisPoints;
            const expectedSellerReceived = price - feeAmount;

            expect(sellerBalanceAfter - sellerBalanceBefore).to.be.closeTo(
                expectedSellerReceived,
                ethers.parseEther("0.0001") // Small tolerance for potential gas costs
            );
        });

        it("Should refund excess payment", async function () {
            const tokenId = await mintToken(seller);
            const price = ethers.parseEther("1");
            const excess = ethers.parseEther("0.5");

            await marketplace.connect(seller).listForSale(
                await dgcToken.getAddress(),
                tokenId,
                price
            );

            const buyerBalanceBefore = await ethers.provider.getBalance(buyer.address);

            const tx = await marketplace.connect(buyer).buy(
                await dgcToken.getAddress(),
                tokenId,
                { value: price + excess }
            );
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed * receipt.gasPrice;

            const buyerBalanceAfter = await ethers.provider.getBalance(buyer.address);

            // Buyer should have spent price + gas, not price + excess + gas
            expect(buyerBalanceBefore - buyerBalanceAfter).to.equal(price + gasUsed);
        });

        it("Should reject insufficient payment", async function () {
            const tokenId = await mintToken(seller);
            const price = ethers.parseEther("1");

            await marketplace.connect(seller).listForSale(
                await dgcToken.getAddress(),
                tokenId,
                price
            );

            await expect(
                marketplace.connect(buyer).buy(
                    await dgcToken.getAddress(),
                    tokenId,
                    { value: price - BigInt(1) }
                )
            ).to.be.revertedWith("Marketplace: Insufficient payment");
        });
    });

    describe("Auctions", function () {
        it("Should create an auction", async function () {
            const tokenId = await mintToken(seller);
            const startPrice = ethers.parseEther("1");
            const duration = 86400; // 1 day

            await marketplace.connect(seller).createAuction(
                await dgcToken.getAddress(),
                tokenId,
                startPrice,
                duration
            );

            const auction = await marketplace.getAuction(
                await dgcToken.getAddress(),
                tokenId
            );

            expect(auction.seller).to.equal(seller.address);
            expect(auction.startPrice).to.equal(startPrice);
            expect(auction.active).to.be.true;
        });

        it("Should accept bids", async function () {
            const tokenId = await mintToken(seller);
            const startPrice = ethers.parseEther("1");

            await marketplace.connect(seller).createAuction(
                await dgcToken.getAddress(),
                tokenId,
                startPrice,
                86400
            );

            await marketplace.connect(buyer).bid(
                await dgcToken.getAddress(),
                tokenId,
                { value: startPrice }
            );

            const auction = await marketplace.getAuction(
                await dgcToken.getAddress(),
                tokenId
            );

            expect(auction.highestBid).to.equal(startPrice);
            expect(auction.highestBidder).to.equal(buyer.address);
        });

        it("Should settle auction correctly", async function () {
            const tokenId = await mintToken(seller);
            const startPrice = ethers.parseEther("1");

            await marketplace.connect(seller).createAuction(
                await dgcToken.getAddress(),
                tokenId,
                startPrice,
                86400
            );

            await marketplace.connect(buyer).bid(
                await dgcToken.getAddress(),
                tokenId,
                { value: startPrice }
            );

            // Fast forward time
            await ethers.provider.send("evm_increaseTime", [86401]);
            await ethers.provider.send("evm_mine");

            const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);

            await marketplace.settleAuction(
                await dgcToken.getAddress(),
                tokenId
            );

            // Verify token transferred
            expect(await dgcToken.ownerOf(tokenId)).to.equal(buyer.address);

            // Verify seller received payment
            const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);
            expect(sellerBalanceAfter).to.be.gt(sellerBalanceBefore);
        });
    });

    describe("Admin Functions", function () {
        it("Should update marketplace fee", async function () {
            const newFee = 500; // 5%
            await marketplace.setMarketplaceFee(newFee);
            expect(await marketplace.marketplaceFee()).to.equal(newFee);
        });

        it("Should update fee recipient", async function () {
            await marketplace.setFeeRecipient(buyer.address);
            expect(await marketplace.feeRecipient()).to.equal(buyer.address);
        });

        it("Should pause and unpause", async function () {
            await marketplace.pause();
            
            const tokenId = await mintToken(seller);
            
            await expect(
                marketplace.connect(seller).listForSale(
                    await dgcToken.getAddress(),
                    tokenId,
                    ethers.parseEther("1")
                )
            ).to.be.reverted;

            await marketplace.unpause();

            await marketplace.connect(seller).listForSale(
                await dgcToken.getAddress(),
                tokenId,
                ethers.parseEther("1")
            );

            expect(await marketplace.isListed(await dgcToken.getAddress(), tokenId)).to.be.true;
        });
    });
});
