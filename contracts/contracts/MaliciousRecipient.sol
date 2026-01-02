// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IRoyaltySplitter {
    function processRoyalty(uint256 tokenId, uint256 salePrice) external payable;
}

/**
 * @title MaliciousRecipient
 * @dev Contract that attempts reentrancy attacks on RoyaltySplitter
 * Used for testing reentrancy protection
 */
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