// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../../contracts/RoyaltySplitter.sol";

/**
 * @title RoyaltySplitterTest
 * @dev Property-based tests for RoyaltySplitter contract
 * Feature: decentralized-generative-content-platform
 */
contract RoyaltySplitterTest is Test {
    RoyaltySplitter public royaltySplitter;
    
    address public admin;
    address public creator1;
    address public creator2;
    address public creator3;
    address public buyer;

    function setUp() public {
        admin = address(this);
        creator1 = makeAddr("creator1");
        creator2 = makeAddr("creator2");
        creator3 = makeAddr("creator3");
        buyer = makeAddr("buyer");

        // Deploy RoyaltySplitter
        royaltySplitter = new RoyaltySplitter();
        
        // Fund test accounts
        vm.deal(buyer, 100 ether);
        vm.deal(address(this), 100 ether);
    }

    /**
     * @dev Property 6: Royalty Calculation Correctness
     * Feature: decentralized-generative-content-platform, Property 6: Royalty Calculation Correctness
     * Validates: Requirements 4.1
     * 
     * For any token sale where royalties are configured, the original creator SHALL receive exactly 
     * (salePrice * royaltyPercentage / 10000) wei, within rounding tolerance of 1 wei.
     */
    function testFuzz_RoyaltyCalculationCorrectness(
        uint256 tokenId,
        uint256 salePrice,
        uint16 royaltyBps
    ) public {
        // Bound inputs to reasonable ranges
        tokenId = bound(tokenId, 1, type(uint128).max);
        salePrice = bound(salePrice, 1000, 100 ether); // Minimum 1000 wei to avoid rounding issues
        royaltyBps = uint16(bound(royaltyBps, 1, 2500)); // 0.01% to 25%
        
        // Setup single recipient royalty configuration
        address[] memory recipients = new address[](1);
        recipients[0] = creator1;
        
        uint256[] memory shares = new uint256[](1);
        shares[0] = 10000; // 100% of royalty goes to creator1
        
        // Set royalty configuration
        royaltySplitter.setRoyalty(tokenId, recipients, shares, royaltyBps);
        
        // Calculate expected royalty amount
        uint256 expectedRoyalty = (salePrice * royaltyBps) / 10000;
        
        // Record creator's balance before payment
        uint256 creatorBalanceBefore = creator1.balance;
        
        // Process royalty payment
        vm.prank(buyer);
        royaltySplitter.processRoyalty{value: expectedRoyalty}(tokenId, salePrice);
        
        // Verify creator received correct amount
        uint256 creatorBalanceAfter = creator1.balance;
        uint256 actualRoyaltyReceived = creatorBalanceAfter - creatorBalanceBefore;
        
        // Should receive exactly the calculated amount (no rounding tolerance needed for single recipient)
        assertEq(
            actualRoyaltyReceived,
            expectedRoyalty,
            "Creator should receive exactly the calculated royalty amount"
        );
        
        // Verify getRoyaltyInfo returns correct values
        (address[] memory returnedRecipients, uint256[] memory returnedAmounts) = 
            royaltySplitter.getRoyaltyInfo(tokenId, salePrice);
        
        assertEq(returnedRecipients.length, 1, "Should return one recipient");
        assertEq(returnedRecipients[0], creator1, "Should return correct recipient address");
        assertEq(returnedAmounts[0], expectedRoyalty, "Should return correct royalty amount");
    }

    /**
     * @dev Test royalty calculation with zero royalty percentage
     */
    function testFuzz_ZeroRoyaltyCalculation(
        uint256 tokenId,
        uint256 salePrice
    ) public {
        tokenId = bound(tokenId, 1, type(uint128).max);
        salePrice = bound(salePrice, 1000, 100 ether);
        
        // Setup zero royalty configuration
        address[] memory recipients = new address[](1);
        recipients[0] = creator1;
        
        uint256[] memory shares = new uint256[](1);
        shares[0] = 10000; // 100% of royalty goes to creator1
        
        // Set zero royalty
        royaltySplitter.setRoyalty(tokenId, recipients, shares, 0);
        
        // Record creator's balance before payment
        uint256 creatorBalanceBefore = creator1.balance;
        
        // Process royalty payment (should be no-op)
        vm.prank(buyer);
        royaltySplitter.processRoyalty{value: 0}(tokenId, salePrice);
        
        // Verify creator received nothing
        uint256 creatorBalanceAfter = creator1.balance;
        assertEq(
            creatorBalanceAfter,
            creatorBalanceBefore,
            "Creator should receive no royalty when percentage is zero"
        );
        
        // Verify getRoyaltyInfo returns empty arrays for zero royalty
        (address[] memory returnedRecipients, uint256[] memory returnedAmounts) = 
            royaltySplitter.getRoyaltyInfo(tokenId, salePrice);
        
        assertEq(returnedRecipients.length, 0, "Should return empty recipients array for zero royalty");
        assertEq(returnedAmounts.length, 0, "Should return empty amounts array for zero royalty");
    }

    /**
     * @dev Test royalty calculation with maximum royalty percentage
     */
    function testFuzz_MaxRoyaltyCalculation(
        uint256 tokenId,
        uint256 salePrice
    ) public {
        tokenId = bound(tokenId, 1, type(uint128).max);
        salePrice = bound(salePrice, 10000, 100 ether); // Ensure minimum for 25% calculation
        
        // Setup maximum royalty configuration (25%)
        address[] memory recipients = new address[](1);
        recipients[0] = creator1;
        
        uint256[] memory shares = new uint256[](1);
        shares[0] = 10000; // 100% of royalty goes to creator1
        
        uint256 maxRoyaltyBps = 2500; // 25%
        royaltySplitter.setRoyalty(tokenId, recipients, shares, maxRoyaltyBps);
        
        // Calculate expected royalty amount (25% of sale price)
        uint256 expectedRoyalty = (salePrice * maxRoyaltyBps) / 10000;
        
        // Record creator's balance before payment
        uint256 creatorBalanceBefore = creator1.balance;
        
        // Process royalty payment
        vm.prank(buyer);
        royaltySplitter.processRoyalty{value: expectedRoyalty}(tokenId, salePrice);
        
        // Verify creator received correct amount
        uint256 creatorBalanceAfter = creator1.balance;
        uint256 actualRoyaltyReceived = creatorBalanceAfter - creatorBalanceBefore;
        
        assertEq(
            actualRoyaltyReceived,
            expectedRoyalty,
            "Creator should receive exactly 25% of sale price"
        );
        
        // Verify the amount is indeed 25% of sale price
        assertEq(
            actualRoyaltyReceived,
            salePrice / 4,
            "Royalty should be exactly 25% (1/4) of sale price"
        );
    }

    /**
     * @dev Test that excess payment is returned to sender
     */
    function testFuzz_ExcessPaymentReturned(
        uint256 tokenId,
        uint256 salePrice,
        uint16 royaltyBps,
        uint256 excessAmount
    ) public {
        tokenId = bound(tokenId, 1, type(uint128).max);
        salePrice = bound(salePrice, 1000, 10 ether);
        royaltyBps = uint16(bound(royaltyBps, 1, 2500));
        excessAmount = bound(excessAmount, 1, 1 ether);
        
        // Setup royalty configuration
        address[] memory recipients = new address[](1);
        recipients[0] = creator1;
        
        uint256[] memory shares = new uint256[](1);
        shares[0] = 10000;
        
        royaltySplitter.setRoyalty(tokenId, recipients, shares, royaltyBps);
        
        uint256 expectedRoyalty = (salePrice * royaltyBps) / 10000;
        uint256 totalPayment = expectedRoyalty + excessAmount;
        
        // Record balances before payment
        uint256 buyerBalanceBefore = buyer.balance;
        uint256 creatorBalanceBefore = creator1.balance;
        
        // Process royalty payment with excess
        vm.prank(buyer);
        uint256 gasBefore = gasleft();
        royaltySplitter.processRoyalty{value: totalPayment}(tokenId, salePrice);
        uint256 gasUsed = gasBefore - gasleft();
        
        // Verify creator received only the royalty amount
        uint256 creatorBalanceAfter = creator1.balance;
        assertEq(
            creatorBalanceAfter - creatorBalanceBefore,
            expectedRoyalty,
            "Creator should receive only the royalty amount"
        );
        
        // Verify buyer got excess back (account for gas spent in foundry)
        // In Foundry tests with vm.prank, gas costs are not deducted from the pranked address
        uint256 buyerBalanceAfter = buyer.balance;
        assertEq(
            buyerBalanceBefore - buyerBalanceAfter,
            expectedRoyalty,
            "Buyer should only lose the royalty amount, excess should be returned"
        );
    }

    /**
     * @dev Property 7: Royalty Bounds Validation
     * Feature: decentralized-generative-content-platform, Property 7: Royalty Bounds Validation
     * Validates: Requirements 4.2, 4.3
     * 
     * For any royalty percentage value, setting royalties SHALL succeed if and only if the percentage 
     * is in the range [0, 2500] basis points (0-25%). Values outside this range SHALL cause the transaction to revert.
     */
    function testFuzz_RoyaltyBoundsValidation(
        uint256 tokenId,
        uint16 royaltyBps
    ) public {
        tokenId = bound(tokenId, 1, type(uint128).max);
        
        // Setup valid recipients and shares
        address[] memory recipients = new address[](1);
        recipients[0] = creator1;
        
        uint256[] memory shares = new uint256[](1);
        shares[0] = 10000; // 100%
        
        if (royaltyBps <= 2500) {
            // Valid royalty percentage - should succeed
            royaltySplitter.setRoyalty(tokenId, recipients, shares, royaltyBps);
            
            // Verify the royalty was set correctly
            assertTrue(
                royaltySplitter.hasRoyaltyConfig(tokenId),
                "Royalty config should exist for valid percentage"
            );
            
            (,, uint256 storedRoyaltyBps) = royaltySplitter.getRoyaltyConfig(tokenId);
            assertEq(
                storedRoyaltyBps,
                royaltyBps,
                "Stored royalty percentage should match input"
            );
        } else {
            // Invalid royalty percentage - should revert
            vm.expectRevert("RoyaltySplitter: Total royalty exceeds maximum");
            royaltySplitter.setRoyalty(tokenId, recipients, shares, royaltyBps);
        }
    }

    /**
     * @dev Test boundary values for royalty percentage
     */
    function test_RoyaltyBoundaryValues() public {
        uint256 tokenId = 1;
        
        address[] memory recipients = new address[](1);
        recipients[0] = creator1;
        
        uint256[] memory shares = new uint256[](1);
        shares[0] = 10000;
        
        // Test minimum valid value (0%)
        royaltySplitter.setRoyalty(tokenId, recipients, shares, 0);
        assertTrue(royaltySplitter.hasRoyaltyConfig(tokenId), "Should accept 0% royalty");
        
        // Test maximum valid value (25% = 2500 bps)
        royaltySplitter.setRoyalty(tokenId + 1, recipients, shares, 2500);
        assertTrue(royaltySplitter.hasRoyaltyConfig(tokenId + 1), "Should accept 25% royalty");
        
        // Test just above maximum (25.01% = 2501 bps) - should fail
        vm.expectRevert("RoyaltySplitter: Total royalty exceeds maximum");
        royaltySplitter.setRoyalty(tokenId + 2, recipients, shares, 2501);
        
        // Test way above maximum - should fail
        vm.expectRevert("RoyaltySplitter: Total royalty exceeds maximum");
        royaltySplitter.setRoyalty(tokenId + 3, recipients, shares, 10000); // 100%
        
        // Test maximum uint16 value - should fail
        vm.expectRevert("RoyaltySplitter: Total royalty exceeds maximum");
        royaltySplitter.setRoyalty(tokenId + 4, recipients, shares, type(uint16).max);
    }

    /**
     * @dev Test that shares must sum to 100%
     */
    function testFuzz_SharesMustSumToOneHundredPercent(
        uint256 tokenId,
        uint16 royaltyBps,
        uint16 share1,
        uint16 share2
    ) public {
        tokenId = bound(tokenId, 1, type(uint128).max);
        royaltyBps = uint16(bound(royaltyBps, 0, 2500));
        
        // Ensure shares don't overflow when added
        share1 = uint16(bound(share1, 1, 9999));
        share2 = uint16(bound(share2, 1, 9999));
        
        address[] memory recipients = new address[](2);
        recipients[0] = creator1;
        recipients[1] = creator2;
        
        uint256[] memory shares = new uint256[](2);
        shares[0] = share1;
        shares[1] = share2;
        
        uint256 totalShares = uint256(share1) + uint256(share2);
        
        if (totalShares == 10000) {
            // Shares sum to 100% - should succeed
            royaltySplitter.setRoyalty(tokenId, recipients, shares, royaltyBps);
            assertTrue(
                royaltySplitter.hasRoyaltyConfig(tokenId),
                "Should accept shares that sum to 100%"
            );
        } else {
            // Shares don't sum to 100% - should fail
            vm.expectRevert("RoyaltySplitter: Shares must sum to 100%");
            royaltySplitter.setRoyalty(tokenId, recipients, shares, royaltyBps);
        }
    }

    /**
     * @dev Test validation of recipient addresses
     */
    function testFuzz_RecipientValidation(
        uint256 tokenId,
        address recipient1,
        address recipient2
    ) public {
        tokenId = bound(tokenId, 1, type(uint128).max);
        
        uint256[] memory shares = new uint256[](2);
        shares[0] = 5000; // 50%
        shares[1] = 5000; // 50%
        
        address[] memory recipients = new address[](2);
        recipients[0] = recipient1;
        recipients[1] = recipient2;
        
        // Check if any recipient is zero address
        bool hasZeroAddress = (recipient1 == address(0)) || (recipient2 == address(0));
        
        if (hasZeroAddress) {
            // Should revert with zero address
            vm.expectRevert("RoyaltySplitter: Invalid recipient address");
            royaltySplitter.setRoyalty(tokenId, recipients, shares, 1000);
        } else {
            // Should succeed with valid addresses
            royaltySplitter.setRoyalty(tokenId, recipients, shares, 1000);
            assertTrue(
                royaltySplitter.hasRoyaltyConfig(tokenId),
                "Should accept valid recipient addresses"
            );
        }
    }

    /**
     * @dev Property 8: Multi-Recipient Royalty Distribution
     * Feature: decentralized-generative-content-platform, Property 8: Multi-Recipient Royalty Distribution
     * Validates: Requirements 4.5
     * 
     * For any token with N royalty recipients and configured share percentages summing to 100%, 
     * a sale SHALL distribute royalties such that each recipient receives their proportional share 
     * of the total royalty amount, within rounding tolerance.
     */
    function testFuzz_MultiRecipientRoyaltyDistribution(
        uint256 tokenId,
        uint256 salePrice,
        uint16 royaltyBps,
        uint8 recipientCount,
        bytes32 seed
    ) public {
        tokenId = bound(tokenId, 1, type(uint128).max);
        salePrice = bound(salePrice, 10000, 100 ether); // Ensure sufficient precision
        royaltyBps = uint16(bound(royaltyBps, 100, 2500)); // 1% to 25%
        recipientCount = uint8(bound(recipientCount, 2, 5)); // 2-5 recipients for manageable testing
        
        // Generate unique recipient addresses
        address[] memory recipients = new address[](recipientCount);
        for (uint256 i = 0; i < recipientCount; i++) {
            recipients[i] = address(uint160(uint256(keccak256(abi.encodePacked(seed, "recipient", i)))));
            // Ensure no zero addresses
            if (recipients[i] == address(0)) {
                recipients[i] = address(uint160(i + 1));
            }
        }
        
        // Ensure all recipients are unique
        for (uint256 i = 0; i < recipientCount; i++) {
            for (uint256 j = i + 1; j < recipientCount; j++) {
                if (recipients[i] == recipients[j]) {
                    recipients[j] = address(uint160(uint160(recipients[j]) + 1));
                }
            }
        }
        
        // Generate shares that sum to 10000 (100%)
        uint256[] memory shares = new uint256[](recipientCount);
        uint256 remainingShares = 10000;
        
        // Distribute shares randomly, ensuring they sum to 10000
        for (uint256 i = 0; i < recipientCount - 1; i++) {
            // Generate random share between 1 and remaining shares - (recipients left - 1)
            uint256 maxShare = remainingShares - (recipientCount - i - 1);
            uint256 minShare = 1;
            shares[i] = bound(
                uint256(keccak256(abi.encodePacked(seed, "share", i))),
                minShare,
                maxShare
            );
            remainingShares -= shares[i];
        }
        // Last recipient gets remaining shares
        shares[recipientCount - 1] = remainingShares;
        
        // Set royalty configuration
        royaltySplitter.setRoyalty(tokenId, recipients, shares, royaltyBps);
        
        // Calculate expected total royalty
        uint256 expectedTotalRoyalty = (salePrice * royaltyBps) / 10000;
        
        // Record balances before payment
        uint256[] memory balancesBefore = new uint256[](recipientCount);
        for (uint256 i = 0; i < recipientCount; i++) {
            balancesBefore[i] = recipients[i].balance;
        }
        
        // Process royalty payment
        vm.prank(buyer);
        royaltySplitter.processRoyalty{value: expectedTotalRoyalty}(tokenId, salePrice);
        
        // Verify each recipient received correct proportional amount
        uint256 totalDistributed = 0;
        for (uint256 i = 0; i < recipientCount; i++) {
            uint256 balanceAfter = recipients[i].balance;
            uint256 actualReceived = balanceAfter - balancesBefore[i];
            
            uint256 expectedAmount;
            if (i == recipientCount - 1) {
                // Last recipient gets remainder to handle rounding
                expectedAmount = expectedTotalRoyalty - totalDistributed;
            } else {
                expectedAmount = (expectedTotalRoyalty * shares[i]) / 10000;
                totalDistributed += expectedAmount;
            }
            
            assertEq(
                actualReceived,
                expectedAmount,
                string(abi.encodePacked("Recipient ", uint2str(i), " should receive correct proportional amount"))
            );
        }
        
        // Verify total distributed equals expected total royalty
        uint256 actualTotalDistributed = 0;
        for (uint256 i = 0; i < recipientCount; i++) {
            actualTotalDistributed += recipients[i].balance - balancesBefore[i];
        }
        
        assertEq(
            actualTotalDistributed,
            expectedTotalRoyalty,
            "Total distributed should equal expected total royalty"
        );
        
        // Verify getRoyaltyInfo returns correct values
        (address[] memory returnedRecipients, uint256[] memory returnedAmounts) = 
            royaltySplitter.getRoyaltyInfo(tokenId, salePrice);
        
        assertEq(returnedRecipients.length, recipientCount, "Should return correct number of recipients");
        
        uint256 totalReturnedAmounts = 0;
        for (uint256 i = 0; i < recipientCount; i++) {
            assertEq(returnedRecipients[i], recipients[i], "Should return correct recipient address");
            totalReturnedAmounts += returnedAmounts[i];
        }
        
        assertEq(
            totalReturnedAmounts,
            expectedTotalRoyalty,
            "Returned amounts should sum to total royalty"
        );
    }

    /**
     * @dev Test multi-recipient distribution with equal shares
     */
    function testFuzz_EqualShareDistribution(
        uint256 tokenId,
        uint256 salePrice,
        uint16 royaltyBps,
        uint8 recipientCount
    ) public {
        tokenId = bound(tokenId, 1, type(uint128).max);
        salePrice = bound(salePrice, 10000, 100 ether);
        royaltyBps = uint16(bound(royaltyBps, 100, 2500));
        recipientCount = uint8(bound(recipientCount, 2, 10));
        
        // Create recipients with equal shares using makeAddr for valid addresses
        address[] memory recipients = new address[](recipientCount);
        uint256[] memory shares = new uint256[](recipientCount);
        
        uint256 sharePerRecipient = 10000 / recipientCount;
        uint256 remainder = 10000 % recipientCount;
        
        for (uint256 i = 0; i < recipientCount; i++) {
            recipients[i] = makeAddr(string(abi.encodePacked("recipient", uint2str(i))));
            shares[i] = sharePerRecipient;
            if (i < remainder) {
                shares[i] += 1; // Distribute remainder to first few recipients
            }
        }
        
        // Set royalty configuration
        royaltySplitter.setRoyalty(tokenId, recipients, shares, royaltyBps);
        
        uint256 expectedTotalRoyalty = (salePrice * royaltyBps) / 10000;
        
        // Record balances before payment
        uint256[] memory balancesBefore = new uint256[](recipientCount);
        for (uint256 i = 0; i < recipientCount; i++) {
            balancesBefore[i] = recipients[i].balance;
        }
        
        // Process royalty payment
        vm.prank(buyer);
        royaltySplitter.processRoyalty{value: expectedTotalRoyalty}(tokenId, salePrice);
        
        // Verify distribution
        uint256 totalDistributed = 0;
        for (uint256 i = 0; i < recipientCount; i++) {
            uint256 actualReceived = recipients[i].balance - balancesBefore[i];
            totalDistributed += actualReceived;
            
            // Each recipient should receive amount proportional to their share
            // Account for the fact that first `remainder` recipients have 1 extra share point
            uint256 expectedForRecipient = (expectedTotalRoyalty * shares[i]) / 10000;
            
            // Allow for rounding differences (1 wei tolerance per recipient due to integer division)
            assertApproxEqAbs(
                actualReceived,
                expectedForRecipient,
                recipientCount, // tolerance for cumulative rounding errors
                "Each recipient should receive share proportional to their allocation"
            );
        }
        
        assertEq(
            totalDistributed,
            expectedTotalRoyalty,
            "Total distributed should equal expected total royalty"
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
 * @title MaliciousRecipient
 * @dev Contract that attempts reentrancy attacks on RoyaltySplitter
 */
contract MaliciousRecipient {
    RoyaltySplitter public royaltySplitter;
    uint256 public tokenId;
    uint256 public salePrice;
    uint256 public attackCount;
    bool public shouldAttack;
    
    constructor(address _royaltySplitter) {
        royaltySplitter = RoyaltySplitter(_royaltySplitter);
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

/**
 * @title ReentrancyProtectionTest
 * @dev Additional test contract for reentrancy protection
 */
contract ReentrancyProtectionTest is Test {
    RoyaltySplitter public royaltySplitter;
    MaliciousRecipient public maliciousRecipient;
    
    address public admin;
    address public legitimateRecipient;
    address public attacker;

    function setUp() public {
        admin = address(this);
        legitimateRecipient = makeAddr("legitimate");
        attacker = makeAddr("attacker");

        // Deploy contracts
        royaltySplitter = new RoyaltySplitter();
        maliciousRecipient = new MaliciousRecipient(address(royaltySplitter));
        
        // Fund accounts
        vm.deal(attacker, 100 ether);
        vm.deal(address(this), 100 ether);
    }

    /**
     * @dev Property 14: Reentrancy Protection
     * Feature: decentralized-generative-content-platform, Property 14: Reentrancy Protection
     * Validates: Requirements 9.5
     * 
     * For any payment function, a reentrant call attempt (via a malicious contract callback) 
     * SHALL fail, and the original transaction SHALL either complete normally or revert entirely—
     * no funds SHALL be drained through reentrancy.
     */
    function testFuzz_ReentrancyProtection(
        uint256 tokenId,
        uint256 salePrice,
        uint16 royaltyBps
    ) public {
        tokenId = bound(tokenId, 1, type(uint128).max);
        salePrice = bound(salePrice, 10000, 10 ether);
        royaltyBps = uint16(bound(royaltyBps, 100, 2500));
        
        // Setup royalty configuration with malicious recipient
        address[] memory recipients = new address[](2);
        recipients[0] = address(maliciousRecipient); // Malicious contract
        recipients[1] = legitimateRecipient;         // Legitimate recipient
        
        uint256[] memory shares = new uint256[](2);
        shares[0] = 5000; // 50% to malicious recipient
        shares[1] = 5000; // 50% to legitimate recipient
        
        royaltySplitter.setRoyalty(tokenId, recipients, shares, royaltyBps);
        
        uint256 expectedTotalRoyalty = (salePrice * royaltyBps) / 10000;
        
        // Setup the attack
        maliciousRecipient.setupAttack(tokenId, salePrice, true);
        
        // Record initial balances
        uint256 maliciousBalanceBefore = address(maliciousRecipient).balance;
        uint256 legitimateBalanceBefore = legitimateRecipient.balance;
        uint256 attackerBalanceBefore = attacker.balance;
        uint256 contractBalanceBefore = address(royaltySplitter).balance;
        
        // Attempt the attack
        vm.prank(attacker);
        royaltySplitter.processRoyalty{value: expectedTotalRoyalty}(tokenId, salePrice);
        
        // Verify reentrancy protection worked
        uint256 maliciousBalanceAfter = address(maliciousRecipient).balance;
        uint256 legitimateBalanceAfter = legitimateRecipient.balance;
        uint256 attackerBalanceAfter = attacker.balance;
        uint256 contractBalanceAfter = address(royaltySplitter).balance;
        
        // Calculate expected amounts
        uint256 expectedMaliciousAmount = (expectedTotalRoyalty * 5000) / 10000;
        uint256 expectedLegitimateAmount = expectedTotalRoyalty - expectedMaliciousAmount;
        
        // Verify correct distribution despite reentrancy attempt
        assertEq(
            maliciousBalanceAfter - maliciousBalanceBefore,
            expectedMaliciousAmount,
            "Malicious recipient should receive exactly their share, no more"
        );
        
        assertEq(
            legitimateBalanceAfter - legitimateBalanceBefore,
            expectedLegitimateAmount,
            "Legitimate recipient should receive their correct share"
        );
        
        // Verify attacker only lost the royalty amount (no extra drainage)
        assertEq(
            attackerBalanceBefore - attackerBalanceAfter,
            expectedTotalRoyalty,
            "Attacker should only lose the exact royalty amount"
        );
        
        // Verify contract has no remaining balance
        assertEq(
            contractBalanceAfter,
            contractBalanceBefore,
            "Contract should not retain any funds"
        );
        
        // Verify the attack was attempted but failed
        assertTrue(
            maliciousRecipient.attackCount() > 0,
            "Reentrancy attack should have been attempted"
        );
        
        // Verify total funds conservation
        uint256 totalDistributed = (maliciousBalanceAfter - maliciousBalanceBefore) + 
                                  (legitimateBalanceAfter - legitimateBalanceBefore);
        assertEq(
            totalDistributed,
            expectedTotalRoyalty,
            "Total distributed should equal expected royalty amount"
        );
    }

    /**
     * @dev Test that legitimate transactions work normally without reentrancy
     */
    function testFuzz_LegitimateTransactionsWork(
        uint256 tokenId,
        uint256 salePrice,
        uint16 royaltyBps
    ) public {
        tokenId = bound(tokenId, 1, type(uint128).max);
        salePrice = bound(salePrice, 1000, 10 ether);
        royaltyBps = uint16(bound(royaltyBps, 1, 2500));
        
        // Setup royalty configuration with non-malicious recipient
        address[] memory recipients = new address[](1);
        recipients[0] = legitimateRecipient;
        
        uint256[] memory shares = new uint256[](1);
        shares[0] = 10000; // 100%
        
        royaltySplitter.setRoyalty(tokenId, recipients, shares, royaltyBps);
        
        uint256 expectedRoyalty = (salePrice * royaltyBps) / 10000;
        
        // Setup malicious recipient but disable attack
        maliciousRecipient.setupAttack(tokenId, salePrice, false);
        
        // Record balances
        uint256 legitimateBalanceBefore = legitimateRecipient.balance;
        uint256 attackerBalanceBefore = attacker.balance;
        
        // Process legitimate payment
        vm.prank(attacker);
        royaltySplitter.processRoyalty{value: expectedRoyalty}(tokenId, salePrice);
        
        // Verify normal operation
        uint256 legitimateBalanceAfter = legitimateRecipient.balance;
        uint256 attackerBalanceAfter = attacker.balance;
        
        assertEq(
            legitimateBalanceAfter - legitimateBalanceBefore,
            expectedRoyalty,
            "Legitimate recipient should receive full royalty"
        );
        
        assertEq(
            attackerBalanceBefore - attackerBalanceAfter,
            expectedRoyalty,
            "Attacker should lose exactly the royalty amount"
        );
    }

    /**
     * @dev Test multiple reentrancy attempts fail consistently
     */
    function test_MultipleReentrancyAttemptsFail() public {
        uint256 salePrice = 1 ether;
        uint16 royaltyBps = 1000; // 10%
        
        // Setup with malicious recipient for multiple tokens
        address[] memory recipients = new address[](1);
        recipients[0] = address(maliciousRecipient);
        
        uint256[] memory shares = new uint256[](1);
        shares[0] = 10000;
        
        // Setup royalty configs for multiple tokens
        for (uint256 i = 1; i <= 5; i++) {
            royaltySplitter.setRoyalty(i, recipients, shares, royaltyBps);
        }
        
        uint256 expectedRoyalty = (salePrice * royaltyBps) / 10000;
        
        // Perform multiple attacks on different tokens
        for (uint256 i = 1; i <= 5; i++) {
            maliciousRecipient.setupAttack(i, salePrice, true);
            
            uint256 balanceBefore = address(maliciousRecipient).balance;
            
            vm.prank(attacker);
            royaltySplitter.processRoyalty{value: expectedRoyalty}(i, salePrice);
            
            uint256 balanceAfter = address(maliciousRecipient).balance;
            
            // Each attack should only result in legitimate payment
            assertEq(
                balanceAfter - balanceBefore,
                expectedRoyalty,
                "Each reentrancy attempt should only result in legitimate payment"
            );
        }
    }
}

/**
 * @title ParentRoyaltyEnforcementTest
 * @dev Additional test contract for parent royalty enforcement
 */
contract ParentRoyaltyEnforcementTest is Test {
    RoyaltySplitter public royaltySplitter;
    
    address public admin;
    address public parentCreator1;
    address public parentCreator2;
    address public derivedCreator1;
    address public derivedCreator2;
    address public buyer;

    function setUp() public {
        admin = address(this);
        parentCreator1 = makeAddr("parentCreator1");
        parentCreator2 = makeAddr("parentCreator2");
        derivedCreator1 = makeAddr("derivedCreator1");
        derivedCreator2 = makeAddr("derivedCreator2");
        buyer = makeAddr("buyer");

        // Deploy RoyaltySplitter
        royaltySplitter = new RoyaltySplitter();
        
        // Fund test accounts
        vm.deal(buyer, 100 ether);
        vm.deal(address(this), 100 ether);
    }

    /**
     * @dev Property 18: Parent Royalty Enforcement
     * Feature: decentralized-generative-content-platform, Property 18: Parent Royalty Enforcement
     * Validates: Requirements 12.4
     * 
     * For any derived token where parent royalties are enabled, a sale SHALL distribute the configured 
     * percentage to parent token creators in addition to the derived token's own royalty configuration.
     */
    function testFuzz_ParentRoyaltyEnforcement(
        uint256 parentTokenId1,
        uint256 parentTokenId2,
        uint256 derivedTokenId,
        uint256 salePrice,
        uint16 parentRoyaltyBps,
        uint16 derivedRoyaltyBps,
        bytes32 seed
    ) public {
        // Bound inputs to reasonable ranges
        parentTokenId1 = bound(parentTokenId1, 1, 1000);
        parentTokenId2 = bound(parentTokenId2, 1001, 2000); // Ensure different from parent1
        derivedTokenId = bound(derivedTokenId, 2001, 3000); // Ensure different from parents
        salePrice = bound(salePrice, 10000, 100 ether);
        parentRoyaltyBps = uint16(bound(parentRoyaltyBps, 100, 1000)); // 1% to 10% for parents
        derivedRoyaltyBps = uint16(bound(derivedRoyaltyBps, 100, 1500)); // 1% to 15% for derived
        
        // Setup parent token 1 royalty configuration
        address[] memory parent1Recipients = new address[](1);
        parent1Recipients[0] = parentCreator1;
        uint256[] memory parent1Shares = new uint256[](1);
        parent1Shares[0] = 10000; // 100%
        
        royaltySplitter.setRoyalty(parentTokenId1, parent1Recipients, parent1Shares, 500); // 5% royalty
        
        // Setup parent token 2 royalty configuration
        address[] memory parent2Recipients = new address[](2);
        parent2Recipients[0] = parentCreator2;
        parent2Recipients[1] = address(uint160(uint256(keccak256(abi.encodePacked(seed, "parent2_collab")))));
        if (parent2Recipients[1] == address(0)) parent2Recipients[1] = address(1);
        
        uint256[] memory parent2Shares = new uint256[](2);
        parent2Shares[0] = 6000; // 60%
        parent2Shares[1] = 4000; // 40%
        
        royaltySplitter.setRoyalty(parentTokenId2, parent2Recipients, parent2Shares, 750); // 7.5% royalty
        
        // Setup derived token with parent royalty enforcement
        address[] memory derivedRecipients = new address[](2);
        derivedRecipients[0] = derivedCreator1;
        derivedRecipients[1] = derivedCreator2;
        
        uint256[] memory derivedShares = new uint256[](2);
        derivedShares[0] = 7000; // 70%
        derivedShares[1] = 3000; // 30%
        
        uint256[] memory parentTokenIds = new uint256[](2);
        parentTokenIds[0] = parentTokenId1;
        parentTokenIds[1] = parentTokenId2;
        
        royaltySplitter.setRoyaltyWithParents(
            derivedTokenId,
            derivedRecipients,
            derivedShares,
            derivedRoyaltyBps,
            parentTokenIds,
            parentRoyaltyBps
        );
        
        // Calculate expected amounts
        uint256 expectedDerivedRoyalty = (salePrice * derivedRoyaltyBps) / 10000;
        uint256 expectedParentRoyalty = (salePrice * parentRoyaltyBps) / 10000;
        uint256 totalExpectedPayment = expectedDerivedRoyalty + expectedParentRoyalty;
        
        // Record balances before payment
        uint256 derivedCreator1BalanceBefore = derivedCreator1.balance;
        uint256 derivedCreator2BalanceBefore = derivedCreator2.balance;
        uint256 parentCreator1BalanceBefore = parentCreator1.balance;
        uint256 parentCreator2BalanceBefore = parentCreator2.balance;
        uint256 parent2CollabBalanceBefore = parent2Recipients[1].balance;
        
        // Process royalty payment
        vm.prank(buyer);
        royaltySplitter.processRoyalty{value: totalExpectedPayment}(derivedTokenId, salePrice);
        
        // Verify derived token creators received their shares
        uint256 derivedCreator1Received = derivedCreator1.balance - derivedCreator1BalanceBefore;
        uint256 derivedCreator2Received = derivedCreator2.balance - derivedCreator2BalanceBefore;
        
        uint256 expectedDerived1 = (expectedDerivedRoyalty * 7000) / 10000;
        uint256 expectedDerived2 = expectedDerivedRoyalty - expectedDerived1; // Remainder for rounding
        
        assertEq(
            derivedCreator1Received,
            expectedDerived1,
            "Derived creator 1 should receive correct share"
        );
        
        assertEq(
            derivedCreator2Received,
            expectedDerived2,
            "Derived creator 2 should receive correct share"
        );
        
        // Verify parent creators received their shares
        uint256 parentCreator1Received = parentCreator1.balance - parentCreator1BalanceBefore;
        uint256 parentCreator2Received = parentCreator2.balance - parentCreator2BalanceBefore;
        uint256 parent2CollabReceived = parent2Recipients[1].balance - parent2CollabBalanceBefore;
        
        // Each parent gets half of the parent royalty amount
        uint256 royaltyPerParent = expectedParentRoyalty / 2;
        
        // Parent 1 gets 100% of their share
        // Note: Due to rounding with 2 parents, the first parent might get remainder
        uint256 parent1Expected = expectedParentRoyalty - (expectedParentRoyalty / 2);
        assertApproxEqAbs(
            parentCreator1Received,
            parent1Expected,
            2, // Allow 2 wei tolerance for rounding
            "Parent creator 1 should receive their full parent royalty share"
        );
        
        // Parent 2 recipients split their share (60%/40%)
        uint256 parent2Share = expectedParentRoyalty / 2;
        uint256 expectedParent2Creator = (parent2Share * 6000) / 10000;
        uint256 expectedParent2Collab = parent2Share - expectedParent2Creator; // Remainder
        
        assertApproxEqAbs(
            parentCreator2Received,
            expectedParent2Creator,
            2, // Allow 2 wei tolerance for rounding
            "Parent creator 2 should receive 60% of parent royalty share"
        );
        
        assertApproxEqAbs(
            parent2CollabReceived,
            expectedParent2Collab,
            2, // Allow 2 wei tolerance for rounding
            "Parent 2 collaborator should receive 40% of parent royalty share"
        );
        
        // Verify total distribution equals expected payment (within rounding tolerance)
        uint256 totalDistributed = derivedCreator1Received + derivedCreator2Received + 
                                  parentCreator1Received + parentCreator2Received + parent2CollabReceived;
        
        assertApproxEqAbs(
            totalDistributed,
            totalExpectedPayment,
            5, // Allow small tolerance for multiple rounding operations
            "Total distributed should approximately equal expected payment"
        );
        
        // Verify getCompleteRoyaltyInfo returns correct values
        (uint256 totalRoyalty, uint256 parentRoyalty, bool hasParentRoyalty) = 
            royaltySplitter.getCompleteRoyaltyInfo(derivedTokenId, salePrice);
        
        assertEq(totalRoyalty, expectedDerivedRoyalty, "Should return correct derived royalty amount");
        assertEq(parentRoyalty, expectedParentRoyalty, "Should return correct parent royalty amount");
        assertTrue(hasParentRoyalty, "Should indicate parent royalties are enabled");
    }

    /**
     * @dev Test parent royalty enforcement with single parent
     */
    function testFuzz_SingleParentRoyaltyEnforcement(
        uint256 parentTokenId,
        uint256 derivedTokenId,
        uint256 salePrice,
        uint16 parentRoyaltyBps,
        uint16 derivedRoyaltyBps
    ) public {
        parentTokenId = bound(parentTokenId, 1, 1000);
        derivedTokenId = bound(derivedTokenId, 1001, 2000);
        salePrice = bound(salePrice, 10000, 50 ether);
        parentRoyaltyBps = uint16(bound(parentRoyaltyBps, 50, 500)); // 0.5% to 5%
        derivedRoyaltyBps = uint16(bound(derivedRoyaltyBps, 100, 1000)); // 1% to 10%
        
        // Setup parent token
        address[] memory parentRecipients = new address[](1);
        parentRecipients[0] = parentCreator1;
        uint256[] memory parentShares = new uint256[](1);
        parentShares[0] = 10000;
        
        royaltySplitter.setRoyalty(parentTokenId, parentRecipients, parentShares, 1000); // 10%
        
        // Setup derived token
        address[] memory derivedRecipients = new address[](1);
        derivedRecipients[0] = derivedCreator1;
        uint256[] memory derivedShares = new uint256[](1);
        derivedShares[0] = 10000;
        
        uint256[] memory parentTokenIds = new uint256[](1);
        parentTokenIds[0] = parentTokenId;
        
        royaltySplitter.setRoyaltyWithParents(
            derivedTokenId,
            derivedRecipients,
            derivedShares,
            derivedRoyaltyBps,
            parentTokenIds,
            parentRoyaltyBps
        );
        
        uint256 expectedDerivedRoyalty = (salePrice * derivedRoyaltyBps) / 10000;
        uint256 expectedParentRoyalty = (salePrice * parentRoyaltyBps) / 10000;
        uint256 totalExpected = expectedDerivedRoyalty + expectedParentRoyalty;
        
        // Record balances
        uint256 derivedBalanceBefore = derivedCreator1.balance;
        uint256 parentBalanceBefore = parentCreator1.balance;
        
        // Process payment
        vm.prank(buyer);
        royaltySplitter.processRoyalty{value: totalExpected}(derivedTokenId, salePrice);
        
        // Verify distribution
        assertEq(
            derivedCreator1.balance - derivedBalanceBefore,
            expectedDerivedRoyalty,
            "Derived creator should receive full derived royalty"
        );
        
        assertEq(
            parentCreator1.balance - parentBalanceBefore,
            expectedParentRoyalty,
            "Parent creator should receive full parent royalty"
        );
    }

    /**
     * @dev Test that regular tokens (non-derived) don't enforce parent royalties
     */
    function testFuzz_RegularTokensNoParentRoyalty(
        uint256 tokenId,
        uint256 salePrice,
        uint16 royaltyBps
    ) public {
        tokenId = bound(tokenId, 1, 1000);
        salePrice = bound(salePrice, 1000, 10 ether);
        royaltyBps = uint16(bound(royaltyBps, 1, 2500));
        
        // Setup regular token (no parent royalties)
        address[] memory recipients = new address[](1);
        recipients[0] = derivedCreator1;
        uint256[] memory shares = new uint256[](1);
        shares[0] = 10000;
        
        royaltySplitter.setRoyalty(tokenId, recipients, shares, royaltyBps);
        
        uint256 expectedRoyalty = (salePrice * royaltyBps) / 10000;
        
        // Verify no parent royalty info
        (uint256 totalRoyalty, uint256 parentRoyalty, bool hasParentRoyalty) = 
            royaltySplitter.getCompleteRoyaltyInfo(tokenId, salePrice);
        
        assertEq(totalRoyalty, expectedRoyalty, "Should return correct royalty amount");
        assertEq(parentRoyalty, 0, "Should return zero parent royalty");
        assertFalse(hasParentRoyalty, "Should indicate no parent royalties");
        
        // Process payment - should only need the direct royalty amount
        uint256 balanceBefore = derivedCreator1.balance;
        
        vm.prank(buyer);
        royaltySplitter.processRoyalty{value: expectedRoyalty}(tokenId, salePrice);
        
        assertEq(
            derivedCreator1.balance - balanceBefore,
            expectedRoyalty,
            "Should receive only the direct royalty amount"
        );
    }

    /**
     * @dev Test insufficient payment for parent royalties
     */
    function test_InsufficientPaymentForParentRoyalties() public {
        uint256 parentTokenId = 1;
        uint256 derivedTokenId = 2;
        uint256 salePrice = 1 ether;
        
        // Setup parent token
        address[] memory parentRecipients = new address[](1);
        parentRecipients[0] = parentCreator1;
        uint256[] memory parentShares = new uint256[](1);
        parentShares[0] = 10000;
        
        royaltySplitter.setRoyalty(parentTokenId, parentRecipients, parentShares, 1000);
        
        // Setup derived token with parent royalties
        address[] memory derivedRecipients = new address[](1);
        derivedRecipients[0] = derivedCreator1;
        uint256[] memory derivedShares = new uint256[](1);
        derivedShares[0] = 10000;
        
        uint256[] memory parentTokenIds = new uint256[](1);
        parentTokenIds[0] = parentTokenId;
        
        royaltySplitter.setRoyaltyWithParents(
            derivedTokenId,
            derivedRecipients,
            derivedShares,
            500, // 5% derived royalty
            parentTokenIds,
            300  // 3% parent royalty
        );
        
        uint256 expectedTotal = (salePrice * 800) / 10000; // 8% total
        uint256 insufficientPayment = expectedTotal - 1; // 1 wei short
        
        // Should revert with insufficient payment
        vm.prank(buyer);
        vm.expectRevert("RoyaltySplitter: Insufficient payment for royalties");
        royaltySplitter.processRoyalty{value: insufficientPayment}(derivedTokenId, salePrice);
    }
}