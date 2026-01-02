// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../../contracts/Marketplace.sol";
import "../../contracts/DGCToken.sol";
import "../../contracts/ProvenanceRegistry.sol";
import "../../contracts/RoyaltySplitter.sol";

/**
 * @title MarketplaceTest
 * @dev Property-based tests for Marketplace contract
 * Feature: decentralized-generative-content-platform
 */
contract MarketplaceTest is Test {
    Marketplace public marketplace;
    DGCToken public dgcToken;
    ProvenanceRegistry public provenanceRegistry;
    RoyaltySplitter public royaltySplitter;
    
    address public admin;
    address public seller;
    address public buyer;
    address public creator;
    address public feeRecipient;
    
    uint256 public constant MARKETPLACE_FEE = 250; // 2.5%
    
    function setUp() public {
        admin = address(this);
        seller = makeAddr("seller");
        buyer = makeAddr("buyer");
        creator = makeAddr("creator");
        feeRecipient = makeAddr("feeRecipient");
        
        // Deploy contracts
        provenanceRegistry = new ProvenanceRegistry();
        dgcToken = new DGCToken("DGC Token", "DGC", address(provenanceRegistry));
        royaltySplitter = new RoyaltySplitter();
        marketplace = new Marketplace(address(royaltySplitter), feeRecipient);
        
        // Setup roles
        dgcToken.grantMinterRole(admin);
        provenanceRegistry.grantRegistrarRole(admin);
        royaltySplitter.grantAdminRole(admin);
        
        // Fund accounts
        vm.deal(buyer, 100 ether);
        vm.deal(seller, 10 ether);
    }
    
    /**
     * @dev Helper function to mint a test NFT
     */
    function _mintTestNFT(address to, uint256 royaltyBps) internal returns (uint256 tokenId) {
        // Register provenance
        bytes32 modelHash = keccak256("test-model");
        bytes32 promptHash = keccak256("test-prompt");
        bytes32 provenanceHash = keccak256(abi.encodePacked(modelHash, promptHash, block.timestamp, to));
        address[] memory collaborators = new address[](0);
        
        provenanceRegistry.registerProvenance(
            provenanceHash,
            modelHash,
            promptHash,
            to,
            collaborators
        );
        
        // Mint token
        tokenId = dgcToken.mint(to, "QmTest123", provenanceHash);
        
        // Set up royalty if specified
        if (royaltyBps > 0) {
            address[] memory recipients = new address[](1);
            recipients[0] = creator;
            uint256[] memory shares = new uint256[](1);
            shares[0] = 10000; // 100%
            
            royaltySplitter.setRoyalty(tokenId, recipients, shares, royaltyBps);
        }
        
        return tokenId;
    }

    /**
     * @dev Property 9: Sale Atomicity
     * Feature: decentralized-generative-content-platform, Property 9: Sale Atomicity
     * Validates: Requirements 4.6, 7.2
     * 
     * For any marketplace purchase, either: (a) ownership transfers to buyer AND payment transfers 
     * to seller AND royalties distribute to recipients, OR (b) the entire transaction reverts with 
     * no state changes. Partial completion SHALL never occur.
     */
    function testFuzz_SaleAtomicity(
        uint256 salePrice,
        uint16 royaltyBps,
        bool shouldSucceed
    ) public {
        // Bound inputs to reasonable ranges
        salePrice = bound(salePrice, 1000, 100 ether);
        royaltyBps = uint16(bound(royaltyBps, 0, 2500)); // 0% to 25%
        
        // Mint NFT to seller
        uint256 tokenId = _mintTestNFT(seller, royaltyBps);
        
        // Approve marketplace
        vm.prank(seller);
        dgcToken.approve(address(marketplace), tokenId);
        
        // List NFT
        vm.prank(seller);
        marketplace.listForSale(address(dgcToken), tokenId, salePrice);
        
        // Record initial states
        address initialOwner = dgcToken.ownerOf(tokenId);
        uint256 initialSellerBalance = seller.balance;
        uint256 initialBuyerBalance = buyer.balance;
        uint256 initialCreatorBalance = creator.balance;
        uint256 initialFeeRecipientBalance = feeRecipient.balance;
        bool initialListingActive = marketplace.isListed(address(dgcToken), tokenId);
        
        // Calculate expected amounts
        uint256 marketplaceFeeAmount = (salePrice * MARKETPLACE_FEE) / 10000;
        uint256 royaltyAmount = 0;
        if (royaltyBps > 0) {
            royaltyAmount = (salePrice * royaltyBps) / 10000;
        }
        uint256 expectedSellerProceeds = salePrice - marketplaceFeeAmount - royaltyAmount;
        
        // Determine if transaction should succeed or fail
        uint256 paymentAmount;
        if (shouldSucceed) {
            paymentAmount = salePrice; // Exact payment
        } else {
            // Insufficient payment to trigger failure
            paymentAmount = salePrice - 1;
        }
        
        if (shouldSucceed && paymentAmount >= salePrice) {
            // Transaction should succeed - verify atomicity of success
            vm.prank(buyer);
            marketplace.buy{value: paymentAmount}(address(dgcToken), tokenId);
            
            // Verify all state changes occurred atomically
            assertEq(dgcToken.ownerOf(tokenId), buyer, "Ownership should transfer to buyer");
            assertFalse(marketplace.isListed(address(dgcToken), tokenId), "Listing should be deactivated");
            
            // Verify payment distribution
            assertEq(
                seller.balance - initialSellerBalance,
                expectedSellerProceeds,
                "Seller should receive correct proceeds"
            );
            
            assertEq(
                feeRecipient.balance - initialFeeRecipientBalance,
                marketplaceFeeAmount,
                "Fee recipient should receive marketplace fee"
            );
            
            if (royaltyAmount > 0) {
                assertEq(
                    creator.balance - initialCreatorBalance,
                    royaltyAmount,
                    "Creator should receive royalty"
                );
            }
            
            // Verify buyer paid correct amount
            assertEq(
                initialBuyerBalance - buyer.balance,
                salePrice,
                "Buyer should pay exact sale price"
            );
            
        } else {
            // Transaction should fail - verify atomicity of failure
            vm.prank(buyer);
            vm.expectRevert();
            marketplace.buy{value: paymentAmount}(address(dgcToken), tokenId);
            
            // Verify NO state changes occurred
            assertEq(dgcToken.ownerOf(tokenId), initialOwner, "Ownership should not change on failure");
            assertEq(seller.balance, initialSellerBalance, "Seller balance should not change on failure");
            assertEq(buyer.balance, initialBuyerBalance, "Buyer balance should not change on failure");
            assertEq(creator.balance, initialCreatorBalance, "Creator balance should not change on failure");
            assertEq(feeRecipient.balance, initialFeeRecipientBalance, "Fee recipient balance should not change on failure");
            assertEq(marketplace.isListed(address(dgcToken), tokenId), initialListingActive, "Listing status should not change on failure");
        }
    }
    
    /**
     * @dev Test sale atomicity with multiple royalty recipients
     */
    function testFuzz_SaleAtomicityMultipleRoyaltyRecipients(
        uint256 salePrice,
        uint16 royaltyBps,
        uint8 recipientCount
    ) public {
        salePrice = bound(salePrice, 10000, 50 ether);
        royaltyBps = uint16(bound(royaltyBps, 100, 1000)); // 1% to 10%
        recipientCount = uint8(bound(recipientCount, 2, 4)); // 2-4 recipients
        
        // Mint NFT to seller
        uint256 tokenId = _mintTestNFT(seller, 0); // No initial royalty
        
        // Set up multiple royalty recipients
        address[] memory recipients = new address[](recipientCount);
        uint256[] memory shares = new uint256[](recipientCount);
        uint256[] memory initialBalances = new uint256[](recipientCount);
        
        uint256 sharePerRecipient = 10000 / recipientCount;
        uint256 remainder = 10000 % recipientCount;
        
        for (uint256 i = 0; i < recipientCount; i++) {
            recipients[i] = makeAddr(string(abi.encodePacked("recipient", i)));
            shares[i] = sharePerRecipient;
            if (i < remainder) {
                shares[i] += 1; // Distribute remainder
            }
            initialBalances[i] = recipients[i].balance;
        }
        
        royaltySplitter.setRoyalty(tokenId, recipients, shares, royaltyBps);
        
        // Approve and list
        vm.prank(seller);
        dgcToken.approve(address(marketplace), tokenId);
        vm.prank(seller);
        marketplace.listForSale(address(dgcToken), tokenId, salePrice);
        
        // Record initial states
        uint256 initialSellerBalance = seller.balance;
        uint256 initialBuyerBalance = buyer.balance;
        uint256 initialFeeRecipientBalance = feeRecipient.balance;
        
        // Execute purchase
        vm.prank(buyer);
        marketplace.buy{value: salePrice}(address(dgcToken), tokenId);
        
        // Verify atomicity - all changes should have occurred
        assertEq(dgcToken.ownerOf(tokenId), buyer, "Ownership should transfer atomically");
        assertFalse(marketplace.isListed(address(dgcToken), tokenId), "Listing should be deactivated atomically");
        
        // Verify all royalty recipients received their shares
        uint256 totalRoyalty = (salePrice * royaltyBps) / 10000;
        uint256 totalDistributed = 0;
        
        for (uint256 i = 0; i < recipientCount; i++) {
            uint256 expectedAmount = (totalRoyalty * shares[i]) / 10000;
            uint256 actualReceived = recipients[i].balance - initialBalances[i];
            
            // Allow for rounding differences in the last recipient
            if (i == recipientCount - 1) {
                expectedAmount = totalRoyalty - totalDistributed;
            } else {
                totalDistributed += expectedAmount;
            }
            
            assertEq(
                actualReceived,
                expectedAmount,
                string(abi.encodePacked("Recipient ", uint2str(i), " should receive correct royalty share"))
            );
        }
        
        // Verify other payments
        uint256 marketplaceFeeAmount = (salePrice * MARKETPLACE_FEE) / 10000;
        uint256 expectedSellerProceeds = salePrice - marketplaceFeeAmount - totalRoyalty;
        
        assertEq(
            seller.balance - initialSellerBalance,
            expectedSellerProceeds,
            "Seller should receive correct proceeds after all deductions"
        );
        
        assertEq(
            feeRecipient.balance - initialFeeRecipientBalance,
            marketplaceFeeAmount,
            "Fee recipient should receive marketplace fee"
        );
        
        assertEq(
            initialBuyerBalance - buyer.balance,
            salePrice,
            "Buyer should pay exact sale price"
        );
    }
    
    /**
     * @dev Test atomicity when royalty transfer fails
     */
    function test_SaleAtomicityRoyaltyFailure() public {
        uint256 salePrice = 1 ether;
        uint256 tokenId = _mintTestNFT(seller, 1000); // 10% royalty
        
        // Set royalty recipient to a contract that rejects payments
        RejectingContract rejectingContract = new RejectingContract();
        
        address[] memory recipients = new address[](1);
        recipients[0] = address(rejectingContract);
        uint256[] memory shares = new uint256[](1);
        shares[0] = 10000;
        
        royaltySplitter.setRoyalty(tokenId, recipients, shares, 1000);
        
        // Approve and list
        vm.prank(seller);
        dgcToken.approve(address(marketplace), tokenId);
        vm.prank(seller);
        marketplace.listForSale(address(dgcToken), tokenId, salePrice);
        
        // Record initial states
        address initialOwner = dgcToken.ownerOf(tokenId);
        uint256 initialSellerBalance = seller.balance;
        uint256 initialBuyerBalance = buyer.balance;
        bool initialListingActive = marketplace.isListed(address(dgcToken), tokenId);
        
        // Purchase should fail due to royalty transfer failure
        vm.prank(buyer);
        vm.expectRevert();
        marketplace.buy{value: salePrice}(address(dgcToken), tokenId);
        
        // Verify atomicity - NO state changes should have occurred
        assertEq(dgcToken.ownerOf(tokenId), initialOwner, "Ownership should not change when royalty fails");
        assertEq(seller.balance, initialSellerBalance, "Seller balance should not change when royalty fails");
        assertEq(buyer.balance, initialBuyerBalance, "Buyer balance should not change when royalty fails");
        assertEq(marketplace.isListed(address(dgcToken), tokenId), initialListingActive, "Listing should remain active when royalty fails");
    }
    
    /**
     * @dev Test atomicity with exact payment amounts
     */
    function test_SaleAtomicityExactPayment() public {
        uint256 salePrice = 1.5 ether;
        uint256 tokenId = _mintTestNFT(seller, 500); // 5% royalty
        
        // Approve and list
        vm.prank(seller);
        dgcToken.approve(address(marketplace), tokenId);
        vm.prank(seller);
        marketplace.listForSale(address(dgcToken), tokenId, salePrice);
        
        // Purchase with exact payment
        vm.prank(buyer);
        marketplace.buy{value: salePrice}(address(dgcToken), tokenId);
        
        // Verify successful atomic transaction
        assertEq(dgcToken.ownerOf(tokenId), buyer, "Ownership should transfer with exact payment");
        assertFalse(marketplace.isListed(address(dgcToken), tokenId), "Listing should be deactivated");
    }
    
    /**
     * @dev Test atomicity with overpayment (should refund excess)
     */
    function test_SaleAtomicityOverpayment() public {
        uint256 salePrice = 1 ether;
        uint256 overpayment = 0.5 ether;
        uint256 totalPayment = salePrice + overpayment;
        
        uint256 tokenId = _mintTestNFT(seller, 0); // No royalty
        
        // Approve and list
        vm.prank(seller);
        dgcToken.approve(address(marketplace), tokenId);
        vm.prank(seller);
        marketplace.listForSale(address(dgcToken), tokenId, salePrice);
        
        uint256 initialBuyerBalance = buyer.balance;
        
        // Purchase with overpayment
        vm.prank(buyer);
        marketplace.buy{value: totalPayment}(address(dgcToken), tokenId);
        
        // Verify atomic success with correct refund
        assertEq(dgcToken.ownerOf(tokenId), buyer, "Ownership should transfer");
        assertEq(
            initialBuyerBalance - buyer.balance,
            salePrice,
            "Buyer should only lose the sale price (excess refunded)"
        );
    }
    
    /**
     * @dev Helper function to convert uint to string
     */
    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
}

/**
 * @title RejectingContract
 * @dev Contract that rejects all ETH transfers to test failure scenarios
 */
contract RejectingContract {
    // Reject all ETH transfers
    receive() external payable {
        revert("RejectingContract: Payment rejected");
    }
    
    fallback() external payable {
        revert("RejectingContract: Payment rejected");
    }
}