// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./RoyaltySplitter.sol";

/**
 * @title Marketplace
 * @dev NFT marketplace with listing, buying, and auction functionality
 * Integrates with RoyaltySplitter for automatic royalty distribution
 */
contract Marketplace is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // Marketplace fee in basis points (2.5% = 250)
    uint256 public marketplaceFee = 250;
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MAX_MARKETPLACE_FEE = 1000; // 10% max
    
    // Reference to RoyaltySplitter contract
    RoyaltySplitter public immutable royaltySplitter;
    
    // Address to receive marketplace fees
    address public feeRecipient;

    struct Listing {
        address seller;
        uint256 price;
        bool active;
    }
    
    struct Auction {
        address seller;
        uint256 startPrice;
        uint256 highestBid;
        address highestBidder;
        uint256 endTime;
        bool active;
        bool settled;
    }

    // Mapping from NFT contract address => tokenId => Listing
    mapping(address => mapping(uint256 => Listing)) public listings;
    
    // Mapping from NFT contract address => tokenId => Auction
    mapping(address => mapping(uint256 => Auction)) public auctions;
    
    // Mapping to track pending withdrawals (for failed transfers)
    mapping(address => uint256) public pendingWithdrawals;

    // Events
    event Listed(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );
    
    event ListingCancelled(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed seller
    );
    
    event Sold(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed buyer,
        address seller,
        uint256 price
    );
    
    event AuctionCreated(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed seller,
        uint256 startPrice,
        uint256 endTime
    );
    
    event BidPlaced(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed bidder,
        uint256 amount
    );
    
    event AuctionSettled(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed winner,
        uint256 finalPrice
    );
    
    event AuctionCancelled(
        address indexed nftContract,
        uint256 indexed tokenId
    );
    
    event MarketplaceFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeRecipientUpdated(address oldRecipient, address newRecipient);

    /**
     * @dev Constructor
     * @param _royaltySplitter Address of the RoyaltySplitter contract
     * @param _feeRecipient Address to receive marketplace fees
     */
    constructor(address _royaltySplitter, address _feeRecipient) {
        require(_royaltySplitter != address(0), "Marketplace: Invalid royalty splitter");
        require(_feeRecipient != address(0), "Marketplace: Invalid fee recipient");
        
        royaltySplitter = RoyaltySplitter(_royaltySplitter);
        feeRecipient = _feeRecipient;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev List an NFT for sale at a fixed price
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to list
     * @param price Listing price in wei
     */
    function listForSale(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external whenNotPaused nonReentrant {
        require(price > 0, "Marketplace: Price must be greater than zero");
        require(!listings[nftContract][tokenId].active, "Marketplace: Already listed");
        require(!auctions[nftContract][tokenId].active, "Marketplace: Token in auction");
        
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Marketplace: Not token owner");
        require(
            nft.getApproved(tokenId) == address(this) || 
            nft.isApprovedForAll(msg.sender, address(this)),
            "Marketplace: Not approved"
        );

        listings[nftContract][tokenId] = Listing({
            seller: msg.sender,
            price: price,
            active: true
        });

        emit Listed(nftContract, tokenId, msg.sender, price);
    }

    /**
     * @dev Cancel an active listing
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to cancel listing for
     */
    function cancelListing(
        address nftContract,
        uint256 tokenId
    ) external nonReentrant {
        Listing storage listing = listings[nftContract][tokenId];
        require(listing.active, "Marketplace: Not listed");
        require(listing.seller == msg.sender, "Marketplace: Not seller");

        listing.active = false;

        emit ListingCancelled(nftContract, tokenId, msg.sender);
    }

    /**
     * @dev Buy a listed NFT
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to buy
     */
    function buy(
        address nftContract,
        uint256 tokenId
    ) external payable whenNotPaused nonReentrant {
        Listing storage listing = listings[nftContract][tokenId];
        require(listing.active, "Marketplace: Not listed");
        require(msg.value >= listing.price, "Marketplace: Insufficient payment");

        address seller = listing.seller;
        uint256 price = listing.price;

        // Deactivate listing first (checks-effects-interactions)
        listing.active = false;

        // Calculate fees and royalties
        uint256 marketplaceFeeAmount = (price * marketplaceFee) / BASIS_POINTS;
        uint256 sellerProceeds = price - marketplaceFeeAmount;

        // Process royalties if configured
        if (royaltySplitter.hasRoyaltyConfig(tokenId)) {
            (uint256 royaltyAmount,) = royaltySplitter.getTotalRoyalty(tokenId, price);
            if (royaltyAmount > 0 && royaltyAmount <= sellerProceeds) {
                sellerProceeds -= royaltyAmount;
                // Transfer royalty to RoyaltySplitter for distribution
                royaltySplitter.processRoyalty{value: royaltyAmount}(tokenId, price);
            }
        }

        // Transfer NFT to buyer (atomic with payment)
        IERC721(nftContract).safeTransferFrom(seller, msg.sender, tokenId);

        // Pay marketplace fee
        if (marketplaceFeeAmount > 0) {
            (bool feeSuccess, ) = payable(feeRecipient).call{value: marketplaceFeeAmount}("");
            if (!feeSuccess) {
                pendingWithdrawals[feeRecipient] += marketplaceFeeAmount;
            }
        }

        // Pay seller
        (bool sellerSuccess, ) = payable(seller).call{value: sellerProceeds}("");
        if (!sellerSuccess) {
            pendingWithdrawals[seller] += sellerProceeds;
        }

        // Refund excess payment
        if (msg.value > price) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - price}("");
            require(refundSuccess, "Marketplace: Refund failed");
        }

        emit Sold(nftContract, tokenId, msg.sender, seller, price);
    }

    /**
     * @dev Create an auction for an NFT
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to auction
     * @param startPrice Starting price in wei
     * @param duration Auction duration in seconds
     */
    function createAuction(
        address nftContract,
        uint256 tokenId,
        uint256 startPrice,
        uint256 duration
    ) external whenNotPaused nonReentrant {
        require(startPrice > 0, "Marketplace: Start price must be greater than zero");
        require(duration >= 1 hours, "Marketplace: Duration too short");
        require(duration <= 30 days, "Marketplace: Duration too long");
        require(!listings[nftContract][tokenId].active, "Marketplace: Token is listed");
        require(!auctions[nftContract][tokenId].active, "Marketplace: Auction exists");
        
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Marketplace: Not token owner");
        require(
            nft.getApproved(tokenId) == address(this) || 
            nft.isApprovedForAll(msg.sender, address(this)),
            "Marketplace: Not approved"
        );

        uint256 endTime = block.timestamp + duration;

        auctions[nftContract][tokenId] = Auction({
            seller: msg.sender,
            startPrice: startPrice,
            highestBid: 0,
            highestBidder: address(0),
            endTime: endTime,
            active: true,
            settled: false
        });

        emit AuctionCreated(nftContract, tokenId, msg.sender, startPrice, endTime);
    }

    /**
     * @dev Place a bid on an auction
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to bid on
     */
    function bid(
        address nftContract,
        uint256 tokenId
    ) external payable whenNotPaused nonReentrant {
        Auction storage auction = auctions[nftContract][tokenId];
        require(auction.active, "Marketplace: Auction not active");
        require(block.timestamp < auction.endTime, "Marketplace: Auction ended");
        require(msg.sender != auction.seller, "Marketplace: Seller cannot bid");
        
        uint256 minBid = auction.highestBid > 0 
            ? auction.highestBid + (auction.highestBid / 20) // 5% minimum increment
            : auction.startPrice;
        
        require(msg.value >= minBid, "Marketplace: Bid too low");

        // Refund previous highest bidder
        if (auction.highestBidder != address(0)) {
            pendingWithdrawals[auction.highestBidder] += auction.highestBid;
        }

        auction.highestBid = msg.value;
        auction.highestBidder = msg.sender;

        emit BidPlaced(nftContract, tokenId, msg.sender, msg.value);
    }

    /**
     * @dev Settle a completed auction
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to settle
     */
    function settleAuction(
        address nftContract,
        uint256 tokenId
    ) external nonReentrant {
        Auction storage auction = auctions[nftContract][tokenId];
        require(auction.active, "Marketplace: Auction not active");
        require(block.timestamp >= auction.endTime, "Marketplace: Auction not ended");
        require(!auction.settled, "Marketplace: Already settled");

        auction.active = false;
        auction.settled = true;

        // If no bids, return to seller
        if (auction.highestBidder == address(0)) {
            emit AuctionCancelled(nftContract, tokenId);
            return;
        }

        address seller = auction.seller;
        address winner = auction.highestBidder;
        uint256 finalPrice = auction.highestBid;

        // Calculate fees and royalties
        uint256 marketplaceFeeAmount = (finalPrice * marketplaceFee) / BASIS_POINTS;
        uint256 sellerProceeds = finalPrice - marketplaceFeeAmount;

        // Process royalties if configured
        if (royaltySplitter.hasRoyaltyConfig(tokenId)) {
            (uint256 royaltyAmount,) = royaltySplitter.getTotalRoyalty(tokenId, finalPrice);
            if (royaltyAmount > 0 && royaltyAmount <= sellerProceeds) {
                sellerProceeds -= royaltyAmount;
                royaltySplitter.processRoyalty{value: royaltyAmount}(tokenId, finalPrice);
            }
        }

        // Transfer NFT to winner
        IERC721(nftContract).safeTransferFrom(seller, winner, tokenId);

        // Pay marketplace fee
        if (marketplaceFeeAmount > 0) {
            (bool feeSuccess, ) = payable(feeRecipient).call{value: marketplaceFeeAmount}("");
            if (!feeSuccess) {
                pendingWithdrawals[feeRecipient] += marketplaceFeeAmount;
            }
        }

        // Pay seller
        (bool sellerSuccess, ) = payable(seller).call{value: sellerProceeds}("");
        if (!sellerSuccess) {
            pendingWithdrawals[seller] += sellerProceeds;
        }

        emit AuctionSettled(nftContract, tokenId, winner, finalPrice);
    }

    /**
     * @dev Cancel an auction (only if no bids)
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to cancel auction for
     */
    function cancelAuction(
        address nftContract,
        uint256 tokenId
    ) external nonReentrant {
        Auction storage auction = auctions[nftContract][tokenId];
        require(auction.active, "Marketplace: Auction not active");
        require(auction.seller == msg.sender, "Marketplace: Not seller");
        require(auction.highestBidder == address(0), "Marketplace: Has bids");

        auction.active = false;

        emit AuctionCancelled(nftContract, tokenId);
    }

    /**
     * @dev Withdraw pending funds from failed transfers
     */
    function withdraw() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "Marketplace: No pending withdrawals");

        pendingWithdrawals[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Marketplace: Withdrawal failed");
    }

    /**
     * @dev Update marketplace fee (admin only)
     * @param newFee New fee in basis points
     */
    function setMarketplaceFee(uint256 newFee) external onlyRole(ADMIN_ROLE) {
        require(newFee <= MAX_MARKETPLACE_FEE, "Marketplace: Fee too high");
        uint256 oldFee = marketplaceFee;
        marketplaceFee = newFee;
        emit MarketplaceFeeUpdated(oldFee, newFee);
    }

    /**
     * @dev Update fee recipient (admin only)
     * @param newRecipient New fee recipient address
     */
    function setFeeRecipient(address newRecipient) external onlyRole(ADMIN_ROLE) {
        require(newRecipient != address(0), "Marketplace: Invalid address");
        address oldRecipient = feeRecipient;
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(oldRecipient, newRecipient);
    }

    /**
     * @dev Pause marketplace (admin only)
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause marketplace (admin only)
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Check if a listing is active
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to check
     * @return True if listing is active
     */
    function isListed(address nftContract, uint256 tokenId) external view returns (bool) {
        return listings[nftContract][tokenId].active;
    }

    /**
     * @dev Get listing details
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to query
     * @return seller The seller address
     * @return price The listing price
     * @return active Whether the listing is active
     */
    function getListing(
        address nftContract,
        uint256 tokenId
    ) external view returns (address seller, uint256 price, bool active) {
        Listing storage listing = listings[nftContract][tokenId];
        return (listing.seller, listing.price, listing.active);
    }

    /**
     * @dev Get auction details
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to query
     */
    function getAuction(
        address nftContract,
        uint256 tokenId
    ) external view returns (
        address seller,
        uint256 startPrice,
        uint256 highestBid,
        address highestBidder,
        uint256 endTime,
        bool active,
        bool settled
    ) {
        Auction storage auction = auctions[nftContract][tokenId];
        return (
            auction.seller,
            auction.startPrice,
            auction.highestBid,
            auction.highestBidder,
            auction.endTime,
            auction.active,
            auction.settled
        );
    }

    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {}
}
