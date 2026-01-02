// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ProvenanceRegistry
 * @dev Registry for tracking AI-generated content provenance on-chain
 * Records immutable provenance data including model version, prompt, creator, and derivation chains
 */
contract ProvenanceRegistry is AccessControl {
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");

    struct ProvenanceRecord {
        bytes32 modelHash;        // Hash of AI model version
        bytes32 promptHash;       // Hash of generation prompt
        uint256 timestamp;        // Block timestamp of registration
        address creator;          // Original creator address
        address[] collaborators;  // Co-creator addresses
        bytes32[] parentHashes;   // Parent provenance hashes for derived works
        bool exists;              // Flag to check if record exists
    }

    // Mapping from provenance hash to provenance record
    mapping(bytes32 => ProvenanceRecord) private _provenanceRecords;
    
    // Mapping from provenance hash to child hashes (for derivation tree queries)
    mapping(bytes32 => bytes32[]) private _childHashes;

    // Events
    event ProvenanceRegistered(
        bytes32 indexed provenanceHash,
        bytes32 indexed modelHash,
        bytes32 indexed promptHash,
        address creator,
        uint256 timestamp
    );

    event DerivationLinked(
        bytes32 indexed childHash,
        bytes32[] parentHashes
    );

    event CollaboratorsAdded(
        bytes32 indexed provenanceHash,
        address[] collaborators
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REGISTRAR_ROLE, msg.sender);
    }

    /**
     * @dev Register a new provenance record
     * @param provenanceHash Unique hash identifying this provenance record
     * @param modelHash Hash of the AI model version used
     * @param promptHash Hash of the generation prompt
     * @param creator Address of the content creator
     * @param collaborators Array of collaborator addresses
     */
    function registerProvenance(
        bytes32 provenanceHash,
        bytes32 modelHash,
        bytes32 promptHash,
        address creator,
        address[] calldata collaborators
    ) external onlyRole(REGISTRAR_ROLE) {
        require(provenanceHash != bytes32(0), "ProvenanceRegistry: Invalid provenance hash");
        require(modelHash != bytes32(0), "ProvenanceRegistry: Invalid model hash");
        require(promptHash != bytes32(0), "ProvenanceRegistry: Invalid prompt hash");
        require(creator != address(0), "ProvenanceRegistry: Invalid creator address");
        require(!_provenanceRecords[provenanceHash].exists, "ProvenanceRegistry: Provenance already exists");

        ProvenanceRecord storage record = _provenanceRecords[provenanceHash];
        record.modelHash = modelHash;
        record.promptHash = promptHash;
        record.timestamp = block.timestamp;
        record.creator = creator;
        record.collaborators = collaborators;
        record.exists = true;

        emit ProvenanceRegistered(provenanceHash, modelHash, promptHash, creator, block.timestamp);
        
        if (collaborators.length > 0) {
            emit CollaboratorsAdded(provenanceHash, collaborators);
        }
    }

    /**
     * @dev Link a derived work to its parent works
     * @param childHash Hash of the derived work
     * @param parentHashes Array of parent provenance hashes
     */
    function linkDerivation(
        bytes32 childHash,
        bytes32[] calldata parentHashes
    ) external onlyRole(REGISTRAR_ROLE) {
        require(childHash != bytes32(0), "ProvenanceRegistry: Invalid child hash");
        require(parentHashes.length > 0, "ProvenanceRegistry: Must have at least one parent");
        require(_provenanceRecords[childHash].exists, "ProvenanceRegistry: Child provenance does not exist");

        // Verify all parent hashes exist
        for (uint256 i = 0; i < parentHashes.length; i++) {
            require(parentHashes[i] != bytes32(0), "ProvenanceRegistry: Invalid parent hash");
            require(_provenanceRecords[parentHashes[i]].exists, "ProvenanceRegistry: Parent provenance does not exist");
            
            // Add child to parent's children list
            _childHashes[parentHashes[i]].push(childHash);
        }

        // Update child's parent references
        _provenanceRecords[childHash].parentHashes = parentHashes;

        emit DerivationLinked(childHash, parentHashes);
    }

    /**
     * @dev Get provenance record by hash
     * @param provenanceHash The provenance hash to query
     * @return record The complete provenance record
     */
    function getProvenance(bytes32 provenanceHash) 
        external 
        view 
        returns (ProvenanceRecord memory record) 
    {
        require(_provenanceRecords[provenanceHash].exists, "ProvenanceRegistry: Provenance does not exist");
        return _provenanceRecords[provenanceHash];
    }

    /**
     * @dev Check if a provenance record exists
     * @param provenanceHash The provenance hash to check
     * @return exists True if the record exists
     */
    function provenanceExists(bytes32 provenanceHash) external view returns (bool) {
        return _provenanceRecords[provenanceHash].exists;
    }

    /**
     * @dev Get child hashes for a given provenance hash
     * @param provenanceHash The parent provenance hash
     * @return childHashes Array of child provenance hashes
     */
    function getChildHashes(bytes32 provenanceHash) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        require(_provenanceRecords[provenanceHash].exists, "ProvenanceRegistry: Provenance does not exist");
        return _childHashes[provenanceHash];
    }

    /**
     * @dev Get the complete ancestry chain for a provenance hash
     * @param provenanceHash The provenance hash to trace
     * @return ancestors Array of all ancestor hashes (parents, grandparents, etc.)
     */
    function getAncestryChain(bytes32 provenanceHash) 
        external 
        view 
        returns (bytes32[] memory ancestors) 
    {
        require(_provenanceRecords[provenanceHash].exists, "ProvenanceRegistry: Provenance does not exist");
        
        // Use a temporary array to collect ancestors
        bytes32[] memory tempAncestors = new bytes32[](1000); // Reasonable max depth
        uint256 ancestorCount = 0;
        
        // Queue for breadth-first traversal
        bytes32[] memory queue = new bytes32[](1000);
        uint256 queueStart = 0;
        uint256 queueEnd = 0;
        
        // Add initial parents to queue
        bytes32[] memory parents = _provenanceRecords[provenanceHash].parentHashes;
        for (uint256 i = 0; i < parents.length; i++) {
            queue[queueEnd] = parents[i];
            queueEnd++;
            tempAncestors[ancestorCount] = parents[i];
            ancestorCount++;
        }
        
        // Process queue to find all ancestors
        while (queueStart < queueEnd) {
            bytes32 current = queue[queueStart];
            queueStart++;
            
            bytes32[] memory currentParents = _provenanceRecords[current].parentHashes;
            for (uint256 i = 0; i < currentParents.length; i++) {
                // Check if already in ancestors to avoid duplicates
                bool alreadyAdded = false;
                for (uint256 j = 0; j < ancestorCount; j++) {
                    if (tempAncestors[j] == currentParents[i]) {
                        alreadyAdded = true;
                        break;
                    }
                }
                
                if (!alreadyAdded) {
                    queue[queueEnd] = currentParents[i];
                    queueEnd++;
                    tempAncestors[ancestorCount] = currentParents[i];
                    ancestorCount++;
                }
            }
        }
        
        // Create properly sized return array
        ancestors = new bytes32[](ancestorCount);
        for (uint256 i = 0; i < ancestorCount; i++) {
            ancestors[i] = tempAncestors[i];
        }
        
        return ancestors;
    }

    /**
     * @dev Grant registrar role to an address
     * @param account Address to grant the role to
     */
    function grantRegistrarRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(REGISTRAR_ROLE, account);
    }

    /**
     * @dev Revoke registrar role from an address
     * @param account Address to revoke the role from
     */
    function revokeRegistrarRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(REGISTRAR_ROLE, account);
    }
}