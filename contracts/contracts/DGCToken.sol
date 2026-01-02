// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./ProvenanceRegistry.sol";

/**
 * @title DGCToken
 * @dev ERC-721 token for AI-generated content with provenance tracking
 * Each token represents a unique AI-generated digital asset with immutable provenance
 */
contract DGCToken is ERC721URIStorage, AccessControl, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // Token counter for unique IDs
    uint256 private _tokenCounter;
    
    // Reference to the ProvenanceRegistry contract
    ProvenanceRegistry public immutable provenanceRegistry;
    
    // Mapping from token ID to provenance hash
    mapping(uint256 => bytes32) private _tokenProvenance;
    
    // Events
    event Minted(
        uint256 indexed tokenId,
        address indexed creator,
        string metadataCID,
        bytes32 indexed provenanceHash
    );

    /**
     * @dev Constructor
     * @param name Token name
     * @param symbol Token symbol
     * @param provenanceRegistryAddress Address of the ProvenanceRegistry contract
     */
    constructor(
        string memory name,
        string memory symbol,
        address provenanceRegistryAddress
    ) ERC721(name, symbol) {
        require(provenanceRegistryAddress != address(0), "DGCToken: Invalid provenance registry address");
        
        provenanceRegistry = ProvenanceRegistry(provenanceRegistryAddress);
        _tokenCounter = 1; // Start token IDs at 1
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    /**
     * @dev Mint a new token with metadata and provenance
     * @param to Address to mint the token to
     * @param metadataCID IPFS CID of the token metadata
     * @param provenanceHash Hash linking to provenance record
     * @return tokenId The ID of the newly minted token
     */
    function mint(
        address to,
        string calldata metadataCID,
        bytes32 provenanceHash
    ) external onlyRole(MINTER_ROLE) nonReentrant returns (uint256) {
        require(to != address(0), "DGCToken: Cannot mint to zero address");
        require(bytes(metadataCID).length > 0, "DGCToken: Metadata CID cannot be empty");
        require(provenanceHash != bytes32(0), "DGCToken: Invalid provenance hash");
        require(provenanceRegistry.provenanceExists(provenanceHash), "DGCToken: Provenance record does not exist");

        uint256 tokenId = _tokenCounter;
        _tokenCounter++;

        // Mint the token
        _safeMint(to, tokenId);
        
        // Set the token URI to IPFS metadata
        string memory tokenURI = string(abi.encodePacked("ipfs://", metadataCID));
        _setTokenURI(tokenId, tokenURI);
        
        // Link token to provenance
        _tokenProvenance[tokenId] = provenanceHash;

        emit Minted(tokenId, to, metadataCID, provenanceHash);

        return tokenId;
    }

    /**
     * @dev Mint a new collaborative token with metadata, provenance, and collaborators
     * @param to Address to mint the token to
     * @param metadataCID IPFS CID of the token metadata
     * @param modelHash Hash of the AI model version used
     * @param promptHash Hash of the generation prompt
     * @param collaborators Array of collaborator addresses with their contribution types
     * @return tokenId The ID of the newly minted token
     */
    function mintCollaborative(
        address to,
        string calldata metadataCID,
        bytes32 modelHash,
        bytes32 promptHash,
        address[] calldata collaborators
    ) external onlyRole(MINTER_ROLE) nonReentrant returns (uint256) {
        require(to != address(0), "DGCToken: Cannot mint to zero address");
        require(bytes(metadataCID).length > 0, "DGCToken: Metadata CID cannot be empty");
        require(modelHash != bytes32(0), "DGCToken: Invalid model hash");
        require(promptHash != bytes32(0), "DGCToken: Invalid prompt hash");
        require(collaborators.length > 0, "DGCToken: Must have at least one collaborator");

        // Validate all collaborator addresses
        for (uint256 i = 0; i < collaborators.length; i++) {
            require(collaborators[i] != address(0), "DGCToken: Invalid collaborator address");
        }

        // Generate provenance hash for collaborative work
        bytes32 provenanceHash = keccak256(abi.encodePacked(
            modelHash,
            promptHash,
            to,
            collaborators,
            block.timestamp
        ));

        // Register provenance with collaborators in the registry
        // Note: This requires the DGCToken contract to have REGISTRAR_ROLE in ProvenanceRegistry
        provenanceRegistry.registerProvenance(
            provenanceHash,
            modelHash,
            promptHash,
            to, // Primary creator
            collaborators
        );

        uint256 tokenId = _tokenCounter;
        _tokenCounter++;

        // Mint the token
        _safeMint(to, tokenId);
        
        // Set the token URI to IPFS metadata
        string memory tokenURI = string(abi.encodePacked("ipfs://", metadataCID));
        _setTokenURI(tokenId, tokenURI);
        
        // Link token to provenance
        _tokenProvenance[tokenId] = provenanceHash;

        emit Minted(tokenId, to, metadataCID, provenanceHash);

        return tokenId;
    }

    /**
     * @dev Get the provenance hash for a token
     * @param tokenId The token ID to query
     * @return provenanceHash The provenance hash for the token
     */
    function getTokenProvenance(uint256 tokenId) external view returns (bytes32) {
        require(_ownerOf(tokenId) != address(0), "DGCToken: Token does not exist");
        return _tokenProvenance[tokenId];
    }

    /**
     * @dev Get the complete provenance record for a token
     * @param tokenId The token ID to query
     * @return record The complete provenance record
     */
    function getProvenance(uint256 tokenId) external view returns (ProvenanceRegistry.ProvenanceRecord memory) {
        require(_ownerOf(tokenId) != address(0), "DGCToken: Token does not exist");
        bytes32 provenanceHash = _tokenProvenance[tokenId];
        return provenanceRegistry.getProvenance(provenanceHash);
    }

    /**
     * @dev Get the current token counter value
     * @return The next token ID that will be minted
     */
    function getCurrentTokenId() external view returns (uint256) {
        return _tokenCounter;
    }

    /**
     * @dev Get the total number of tokens minted
     * @return The total supply of tokens
     */
    function totalSupply() external view returns (uint256) {
        return _tokenCounter - 1;
    }

    /**
     * @dev Grant minter role to an address
     * @param account Address to grant the role to
     */
    function grantMinterRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(MINTER_ROLE, account);
    }

    /**
     * @dev Revoke minter role from an address
     * @param account Address to revoke the role from
     */
    function revokeMinterRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(MINTER_ROLE, account);
    }

    /**
     * @dev Setup function to grant this contract REGISTRAR_ROLE in ProvenanceRegistry
     * This should be called after deployment to enable collaborative minting
     * Only callable by admin
     */
    function setupProvenanceRegistration() external onlyRole(DEFAULT_ADMIN_ROLE) {
        // Grant this contract the REGISTRAR_ROLE in the ProvenanceRegistry
        // This allows the contract to register provenance records during collaborative minting
        provenanceRegistry.grantRegistrarRole(address(this));
    }

    /**
     * @dev See {IERC165-supportsInterface}
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}