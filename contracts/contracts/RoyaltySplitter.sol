// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title RoyaltySplitter
 * @dev Contract for managing and distributing royalties for NFT sales
 * Supports multiple recipients with configurable percentage splits
 */
contract RoyaltySplitter is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // Maximum royalty percentage (25% = 2500 basis points)
    uint256 public constant MAX_ROYALTY_BPS = 2500;
    uint256 public constant BASIS_POINTS = 10000;

    struct RoyaltyConfig {
        address[] recipients;     // Array of royalty recipients
        uint256[] shares;        // Share percentages in basis points (10000 = 100%)
        uint256 totalRoyaltyBps; // Total royalty percentage in basis points
        bool exists;             // Flag to check if config exists
        bool parentRoyaltyEnabled; // Flag to enable parent royalty enforcement
        uint256[] parentTokenIds; // Array of parent token IDs for derived works
        uint256 parentRoyaltyBps; // Royalty percentage for parent creators
    }

    // Mapping from token ID to royalty configuration
    mapping(uint256 => RoyaltyConfig) private _royaltyConfigs;

    // Events
    event RoyaltySet(
        uint256 indexed tokenId,
        address[] recipients,
        uint256[] shares,
        uint256 totalRoyaltyBps
    );

    event ParentRoyaltySet(
        uint256 indexed tokenId,
        uint256[] parentTokenIds,
        uint256 parentRoyaltyBps
    );

    event RoyaltyPaid(
        uint256 indexed tokenId,
        address indexed recipient,
        uint256 amount
    );

    event ParentRoyaltyPaid(
        uint256 indexed tokenId,
        uint256 indexed parentTokenId,
        address indexed recipient,
        uint256 amount
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Set royalty configuration for a token
     * @param tokenId The token ID to configure royalties for
     * @param recipients Array of recipient addresses
     * @param shares Array of share percentages in basis points
     * @param totalRoyaltyBps Total royalty percentage in basis points (0-2500)
     */
    function setRoyalty(
        uint256 tokenId,
        address[] calldata recipients,
        uint256[] calldata shares,
        uint256 totalRoyaltyBps
    ) external onlyRole(ADMIN_ROLE) {
        require(recipients.length > 0, "RoyaltySplitter: Must have at least one recipient");
        require(recipients.length == shares.length, "RoyaltySplitter: Recipients and shares length mismatch");
        require(totalRoyaltyBps <= MAX_ROYALTY_BPS, "RoyaltySplitter: Total royalty exceeds maximum");

        // Validate recipients and calculate total shares
        uint256 totalShares = 0;
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "RoyaltySplitter: Invalid recipient address");
            require(shares[i] > 0, "RoyaltySplitter: Share must be greater than zero");
            totalShares += shares[i];
        }
        require(totalShares == BASIS_POINTS, "RoyaltySplitter: Shares must sum to 100%");

        // Store the configuration
        RoyaltyConfig storage config = _royaltyConfigs[tokenId];
        config.recipients = recipients;
        config.shares = shares;
        config.totalRoyaltyBps = totalRoyaltyBps;
        config.parentRoyaltyEnabled = false; // No parent royalty for regular tokens
        config.exists = true;

        emit RoyaltySet(tokenId, recipients, shares, totalRoyaltyBps);
    }

    /**
     * @dev Set royalty configuration for a derived token with parent royalty enforcement
     * @param tokenId The token ID to configure royalties for
     * @param recipients Array of recipient addresses for the derived token
     * @param shares Array of share percentages in basis points for the derived token
     * @param totalRoyaltyBps Total royalty percentage in basis points for the derived token (0-2500)
     * @param parentTokenIds Array of parent token IDs
     * @param parentRoyaltyBps Royalty percentage for parent creators in basis points (0-2500)
     */
    function setRoyaltyWithParents(
        uint256 tokenId,
        address[] calldata recipients,
        uint256[] calldata shares,
        uint256 totalRoyaltyBps,
        uint256[] calldata parentTokenIds,
        uint256 parentRoyaltyBps
    ) external onlyRole(ADMIN_ROLE) {
        require(recipients.length > 0, "RoyaltySplitter: Must have at least one recipient");
        require(recipients.length == shares.length, "RoyaltySplitter: Recipients and shares length mismatch");
        require(totalRoyaltyBps <= MAX_ROYALTY_BPS, "RoyaltySplitter: Total royalty exceeds maximum");
        require(parentRoyaltyBps <= MAX_ROYALTY_BPS, "RoyaltySplitter: Parent royalty exceeds maximum");
        require(parentTokenIds.length > 0, "RoyaltySplitter: Must have at least one parent token");

        // Validate recipients and calculate total shares
        uint256 totalShares = 0;
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "RoyaltySplitter: Invalid recipient address");
            require(shares[i] > 0, "RoyaltySplitter: Share must be greater than zero");
            totalShares += shares[i];
        }
        require(totalShares == BASIS_POINTS, "RoyaltySplitter: Shares must sum to 100%");

        // Validate parent tokens exist
        for (uint256 i = 0; i < parentTokenIds.length; i++) {
            require(_royaltyConfigs[parentTokenIds[i]].exists, "RoyaltySplitter: Parent token must have royalty config");
        }

        // Store the configuration
        RoyaltyConfig storage config = _royaltyConfigs[tokenId];
        config.recipients = recipients;
        config.shares = shares;
        config.totalRoyaltyBps = totalRoyaltyBps;
        config.parentRoyaltyEnabled = true;
        config.parentTokenIds = parentTokenIds;
        config.parentRoyaltyBps = parentRoyaltyBps;
        config.exists = true;

        emit RoyaltySet(tokenId, recipients, shares, totalRoyaltyBps);
        emit ParentRoyaltySet(tokenId, parentTokenIds, parentRoyaltyBps);
    }

    /**
     * @dev Process royalty payment for a token sale
     * @param tokenId The token ID that was sold
     * @param salePrice The sale price in wei
     */
    function processRoyalty(uint256 tokenId, uint256 salePrice) 
        external 
        payable 
        nonReentrant 
    {
        RoyaltyConfig storage config = _royaltyConfigs[tokenId];
        require(config.exists, "RoyaltySplitter: No royalty config for token");
        
        uint256 totalRoyaltyNeeded = 0;
        uint256 parentRoyaltyNeeded = 0;
        
        // Calculate total royalty amount for this token
        if (config.totalRoyaltyBps > 0) {
            totalRoyaltyNeeded = (salePrice * config.totalRoyaltyBps) / BASIS_POINTS;
        }
        
        // Calculate parent royalty amount if enabled
        if (config.parentRoyaltyEnabled && config.parentRoyaltyBps > 0) {
            parentRoyaltyNeeded = (salePrice * config.parentRoyaltyBps) / BASIS_POINTS;
        }
        
        uint256 totalPaymentNeeded = totalRoyaltyNeeded + parentRoyaltyNeeded;
        
        if (totalPaymentNeeded == 0) {
            // Return any funds sent when no royalty is due
            if (msg.value > 0) {
                (bool success, ) = msg.sender.call{value: msg.value}("");
                require(success, "RoyaltySplitter: Failed to return payment");
            }
            return; // No royalties to distribute
        }
        
        require(msg.value >= totalPaymentNeeded, "RoyaltySplitter: Insufficient payment for royalties");

        // Distribute royalties to direct recipients
        if (totalRoyaltyNeeded > 0) {
            uint256 distributedAmount = 0;
            for (uint256 i = 0; i < config.recipients.length; i++) {
                uint256 recipientAmount;
                
                // For the last recipient, give them the remainder to handle rounding
                if (i == config.recipients.length - 1) {
                    recipientAmount = totalRoyaltyNeeded - distributedAmount;
                } else {
                    recipientAmount = (totalRoyaltyNeeded * config.shares[i]) / BASIS_POINTS;
                    distributedAmount += recipientAmount;
                }

                if (recipientAmount > 0) {
                    (bool success, ) = config.recipients[i].call{value: recipientAmount}("");
                    require(success, "RoyaltySplitter: Failed to send royalty payment");
                    
                    emit RoyaltyPaid(tokenId, config.recipients[i], recipientAmount);
                }
            }
        }
        
        // Distribute parent royalties if enabled
        if (config.parentRoyaltyEnabled && parentRoyaltyNeeded > 0) {
            _distributeParentRoyalties(tokenId, config.parentTokenIds, parentRoyaltyNeeded);
        }

        // Return any excess payment
        uint256 excess = msg.value - totalPaymentNeeded;
        if (excess > 0) {
            (bool success, ) = msg.sender.call{value: excess}("");
            require(success, "RoyaltySplitter: Failed to return excess payment");
        }
    }

    /**
     * @dev Internal function to distribute royalties to parent token creators
     * @param derivedTokenId The derived token ID
     * @param parentTokenIds Array of parent token IDs
     * @param totalParentRoyalty Total amount to distribute to parent creators
     */
    function _distributeParentRoyalties(
        uint256 derivedTokenId,
        uint256[] memory parentTokenIds,
        uint256 totalParentRoyalty
    ) internal {
        uint256 royaltyPerParent = totalParentRoyalty / parentTokenIds.length;
        uint256 distributedTotal = 0;
        
        for (uint256 i = 0; i < parentTokenIds.length; i++) {
            uint256 parentTokenId = parentTokenIds[i];
            RoyaltyConfig storage parentConfig = _royaltyConfigs[parentTokenId];
            
            uint256 parentAmount;
            // For the last parent, give remainder to handle rounding
            if (i == parentTokenIds.length - 1) {
                parentAmount = totalParentRoyalty - distributedTotal;
            } else {
                parentAmount = royaltyPerParent;
                distributedTotal += parentAmount;
            }
            
            if (parentAmount > 0 && parentConfig.exists) {
                // Distribute to parent token's recipients proportionally
                uint256 parentDistributed = 0;
                for (uint256 j = 0; j < parentConfig.recipients.length; j++) {
                    uint256 recipientAmount;
                    
                    // For the last recipient, give remainder
                    if (j == parentConfig.recipients.length - 1) {
                        recipientAmount = parentAmount - parentDistributed;
                    } else {
                        recipientAmount = (parentAmount * parentConfig.shares[j]) / BASIS_POINTS;
                        parentDistributed += recipientAmount;
                    }
                    
                    if (recipientAmount > 0) {
                        (bool success, ) = parentConfig.recipients[j].call{value: recipientAmount}("");
                        require(success, "RoyaltySplitter: Failed to send parent royalty payment");
                        
                        emit ParentRoyaltyPaid(derivedTokenId, parentTokenId, parentConfig.recipients[j], recipientAmount);
                    }
                }
            }
        }
    }

    /**
     * @dev Get royalty information for a token (direct recipients only)
     * @param tokenId The token ID to query
     * @param salePrice The hypothetical sale price
     * @return recipients Array of recipient addresses
     * @return amounts Array of royalty amounts for each recipient
     */
    function getRoyaltyInfo(uint256 tokenId, uint256 salePrice)
        external
        view
        returns (address[] memory recipients, uint256[] memory amounts)
    {
        RoyaltyConfig storage config = _royaltyConfigs[tokenId];
        
        if (!config.exists || config.totalRoyaltyBps == 0) {
            // Return empty arrays if no royalty config
            return (new address[](0), new uint256[](0));
        }

        recipients = new address[](config.recipients.length);
        amounts = new uint256[](config.recipients.length);

        uint256 totalRoyalty = (salePrice * config.totalRoyaltyBps) / BASIS_POINTS;
        uint256 distributedAmount = 0;

        for (uint256 i = 0; i < config.recipients.length; i++) {
            recipients[i] = config.recipients[i];
            
            // For the last recipient, give them the remainder to handle rounding
            if (i == config.recipients.length - 1) {
                amounts[i] = totalRoyalty - distributedAmount;
            } else {
                amounts[i] = (totalRoyalty * config.shares[i]) / BASIS_POINTS;
                distributedAmount += amounts[i];
            }
        }

        return (recipients, amounts);
    }

    /**
     * @dev Get complete royalty information including parent royalties
     * @param tokenId The token ID to query
     * @param salePrice The hypothetical sale price
     * @return totalRoyaltyAmount Total royalty amount for direct recipients
     * @return parentRoyaltyAmount Total royalty amount for parent creators
     * @return hasParentRoyalty Whether parent royalties are enabled
     */
    function getCompleteRoyaltyInfo(uint256 tokenId, uint256 salePrice)
        external
        view
        returns (
            uint256 totalRoyaltyAmount,
            uint256 parentRoyaltyAmount,
            bool hasParentRoyalty
        )
    {
        RoyaltyConfig storage config = _royaltyConfigs[tokenId];
        
        if (!config.exists) {
            return (0, 0, false);
        }
        
        totalRoyaltyAmount = (salePrice * config.totalRoyaltyBps) / BASIS_POINTS;
        
        if (config.parentRoyaltyEnabled) {
            parentRoyaltyAmount = (salePrice * config.parentRoyaltyBps) / BASIS_POINTS;
            hasParentRoyalty = true;
        } else {
            parentRoyaltyAmount = 0;
            hasParentRoyalty = false;
        }
        
        return (totalRoyaltyAmount, parentRoyaltyAmount, hasParentRoyalty);
    }

    /**
     * @dev Get the royalty configuration for a token
     * @param tokenId The token ID to query
     * @return recipients Array of recipient addresses
     * @return shares Array of share percentages
     * @return totalRoyaltyBps Total royalty percentage in basis points
     */
    function getRoyaltyConfig(uint256 tokenId)
        external
        view
        returns (
            address[] memory recipients,
            uint256[] memory shares,
            uint256 totalRoyaltyBps
        )
    {
        RoyaltyConfig storage config = _royaltyConfigs[tokenId];
        require(config.exists, "RoyaltySplitter: No royalty config for token");
        
        return (config.recipients, config.shares, config.totalRoyaltyBps);
    }

    /**
     * @dev Get parent royalty information for a derived token
     * @param tokenId The token ID to query
     * @return parentTokenIds Array of parent token IDs
     * @return parentRoyaltyBps Parent royalty percentage in basis points
     * @return parentRoyaltyEnabled Whether parent royalties are enabled
     */
    function getParentRoyaltyInfo(uint256 tokenId)
        external
        view
        returns (
            uint256[] memory parentTokenIds,
            uint256 parentRoyaltyBps,
            bool parentRoyaltyEnabled
        )
    {
        RoyaltyConfig storage config = _royaltyConfigs[tokenId];
        require(config.exists, "RoyaltySplitter: No royalty config for token");
        
        return (config.parentTokenIds, config.parentRoyaltyBps, config.parentRoyaltyEnabled);
    }

    /**
     * @dev Check if a token has royalty configuration
     * @param tokenId The token ID to check
     * @return exists True if royalty config exists
     */
    function hasRoyaltyConfig(uint256 tokenId) external view returns (bool) {
        return _royaltyConfigs[tokenId].exists;
    }

    /**
     * @dev Get total royalty amount for a sale (including parent royalties)
     * @param tokenId The token ID to query
     * @param salePrice The sale price
     * @return totalAmount Total royalty amount (direct + parent)
     * @return directAmount Direct royalty amount only
     */
    function getTotalRoyalty(uint256 tokenId, uint256 salePrice)
        external
        view
        returns (uint256 totalAmount, uint256 directAmount)
    {
        RoyaltyConfig storage config = _royaltyConfigs[tokenId];
        
        if (!config.exists) {
            return (0, 0);
        }
        
        directAmount = (salePrice * config.totalRoyaltyBps) / BASIS_POINTS;
        totalAmount = directAmount;
        
        if (config.parentRoyaltyEnabled) {
            totalAmount += (salePrice * config.parentRoyaltyBps) / BASIS_POINTS;
        }
        
        return (totalAmount, directAmount);
    }

    /**
     * @dev Grant admin role to an address
     * @param account Address to grant the role to
     */
    function grantAdminRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(ADMIN_ROLE, account);
    }

    /**
     * @dev Revoke admin role from an address
     * @param account Address to revoke the role from
     */
    function revokeAdminRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(ADMIN_ROLE, account);
    }
}
