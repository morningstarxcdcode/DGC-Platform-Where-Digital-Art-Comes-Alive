// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../../contracts/DGCToken.sol";
import "../../contracts/ProvenanceRegistry.sol";

/**
 * @title DGCTokenTest
 * @dev Property-based tests for DGCToken contract
 * Feature: decentralized-generative-content-platform
 */
contract DGCTokenTest is Test {
    DGCToken public dgcToken;
    ProvenanceRegistry public provenanceRegistry;
    
    address public admin;
    address public minter;
    address public creator1;
    address public creator2;
    address public creator3;

    function setUp() public {
        admin = address(this);
        minter = makeAddr("minter");
        creator1 = makeAddr("creator1");
        creator2 = makeAddr("creator2");
        creator3 = makeAddr("creator3");

        // Deploy ProvenanceRegistry first
        provenanceRegistry = new ProvenanceRegistry();
        provenanceRegistry.grantRegistrarRole(address(this));

        // Deploy DGCToken
        dgcToken = new DGCToken("DGC Token", "DGC", address(provenanceRegistry));
        dgcToken.grantMinterRole(minter);
        
        // Grant minter the registrar role so they can register provenance
        provenanceRegistry.grantRegistrarRole(minter);
        
        // Grant DGCToken the registrar role for collaborative minting
        provenanceRegistry.grantRegistrarRole(address(dgcToken));
    }

    /**
     * @dev Helper function to register provenance and return hash
     */
    function _registerProvenance(
        bytes32 modelHash,
        bytes32 promptHash,
        address creator,
        address[] memory collaborators
    ) internal returns (bytes32 provenanceHash) {
        provenanceHash = keccak256(abi.encodePacked(modelHash, promptHash, creator, block.timestamp));
        provenanceRegistry.registerProvenance(
            provenanceHash,
            modelHash,
            promptHash,
            creator,
            collaborators
        );
        return provenanceHash;
    }

    /**
     * @dev Property 5: Token ID Uniqueness
     * Feature: decentralized-generative-content-platform, Property 5: Token ID Uniqueness
     * Validates: Requirements 3.6
     * 
     * For any sequence of mint operations, all resulting token IDs SHALL be unique—no two tokens SHALL share the same ID.
     */
    function testFuzz_TokenIdUniqueness(
        uint8 mintCount,
        bytes32 baseSeed
    ) public {
        // Bound mint count to reasonable range (1-50 to avoid gas issues)
        mintCount = uint8(bound(mintCount, 1, 50));
        
        // Track all minted token IDs
        uint256[] memory mintedTokenIds = new uint256[](mintCount);
        
        vm.startPrank(minter);
        
        // Mint multiple tokens
        for (uint256 i = 0; i < mintCount; i++) {
            // Create unique provenance for each mint
            bytes32 modelHash = keccak256(abi.encodePacked(baseSeed, "model", i));
            bytes32 promptHash = keccak256(abi.encodePacked(baseSeed, "prompt", i));
            address creator = address(uint160(uint256(keccak256(abi.encodePacked(baseSeed, "creator", i)))));
            
            // Ensure creator is not zero address
            if (creator == address(0)) {
                creator = address(1);
            }
            
            address[] memory emptyCollaborators = new address[](0);
            
            // Register provenance
            bytes32 provenanceHash = _registerProvenance(modelHash, promptHash, creator, emptyCollaborators);
            
            // Create unique metadata CID
            string memory metadataCID = string(abi.encodePacked("Qm", uint2str(i), "TestMetadata"));
            
            // Mint token
            uint256 tokenId = dgcToken.mint(creator, metadataCID, provenanceHash);
            mintedTokenIds[i] = tokenId;
        }
        
        vm.stopPrank();
        
        // Verify all token IDs are unique
        for (uint256 i = 0; i < mintCount; i++) {
            for (uint256 j = i + 1; j < mintCount; j++) {
                assertTrue(
                    mintedTokenIds[i] != mintedTokenIds[j],
                    "Token IDs must be unique"
                );
            }
        }
        
        // Verify token IDs are sequential starting from 1
        for (uint256 i = 0; i < mintCount; i++) {
            assertEq(mintedTokenIds[i], i + 1, "Token IDs should be sequential starting from 1");
        }
        
        // Verify total supply matches mint count
        assertEq(dgcToken.totalSupply(), mintCount, "Total supply should match number of minted tokens");
        
        // Verify current token ID is correct
        assertEq(dgcToken.getCurrentTokenId(), mintCount + 1, "Current token ID should be next available ID");
    }

    /**
     * @dev Test that token IDs remain unique across different minters
     */
    function testFuzz_TokenIdUniquenessAcrossMinters(
        uint8 minter1Count,
        uint8 minter2Count,
        bytes32 baseSeed
    ) public {
        // Bound counts to reasonable ranges
        minter1Count = uint8(bound(minter1Count, 1, 25));
        minter2Count = uint8(bound(minter2Count, 1, 25));
        
        address minter2 = makeAddr("minter2");
        dgcToken.grantMinterRole(minter2);
        provenanceRegistry.grantRegistrarRole(minter2);
        
        uint256[] memory allTokenIds = new uint256[](minter1Count + minter2Count);
        uint256 tokenIndex = 0;
        
        // Mint tokens with first minter
        vm.startPrank(minter);
        for (uint256 i = 0; i < minter1Count; i++) {
            bytes32 modelHash = keccak256(abi.encodePacked(baseSeed, "model1", i));
            bytes32 promptHash = keccak256(abi.encodePacked(baseSeed, "prompt1", i));
            address creator = creator1;
            address[] memory emptyCollaborators = new address[](0);
            
            bytes32 provenanceHash = _registerProvenance(modelHash, promptHash, creator, emptyCollaborators);
            string memory metadataCID = string(abi.encodePacked("Qm1", uint2str(i), "TestMetadata"));
            
            uint256 tokenId = dgcToken.mint(creator, metadataCID, provenanceHash);
            allTokenIds[tokenIndex] = tokenId;
            tokenIndex++;
        }
        vm.stopPrank();
        
        // Mint tokens with second minter
        vm.startPrank(minter2);
        for (uint256 i = 0; i < minter2Count; i++) {
            bytes32 modelHash = keccak256(abi.encodePacked(baseSeed, "model2", i));
            bytes32 promptHash = keccak256(abi.encodePacked(baseSeed, "prompt2", i));
            address creator = creator2;
            address[] memory emptyCollaborators = new address[](0);
            
            bytes32 provenanceHash = _registerProvenance(modelHash, promptHash, creator, emptyCollaborators);
            string memory metadataCID = string(abi.encodePacked("Qm2", uint2str(i), "TestMetadata"));
            
            uint256 tokenId = dgcToken.mint(creator, metadataCID, provenanceHash);
            allTokenIds[tokenIndex] = tokenId;
            tokenIndex++;
        }
        vm.stopPrank();
        
        // Verify all token IDs are unique across both minters
        for (uint256 i = 0; i < allTokenIds.length; i++) {
            for (uint256 j = i + 1; j < allTokenIds.length; j++) {
                assertTrue(
                    allTokenIds[i] != allTokenIds[j],
                    "Token IDs must be unique across all minters"
                );
            }
        }
    }

    /**
     * @dev Test that minting fails with invalid inputs
     */
    function testFuzz_MintFailsWithInvalidInputs(
        address to,
        string calldata metadataCID,
        bytes32 provenanceHash
    ) public {
        vm.startPrank(minter);
        
        // Test minting to zero address
        if (to == address(0)) {
            vm.expectRevert("DGCToken: Cannot mint to zero address");
            dgcToken.mint(to, "QmTestCID", keccak256("validProvenance"));
        }
        
        // Test empty metadata CID
        if (bytes(metadataCID).length == 0 && to != address(0)) {
            vm.expectRevert("DGCToken: Metadata CID cannot be empty");
            dgcToken.mint(to, metadataCID, keccak256("validProvenance"));
        }
        
        // Test invalid provenance hash
        if (provenanceHash == bytes32(0) && to != address(0) && bytes(metadataCID).length > 0) {
            vm.expectRevert("DGCToken: Invalid provenance hash");
            dgcToken.mint(to, metadataCID, provenanceHash);
        }
        
        // Test non-existent provenance
        if (provenanceHash != bytes32(0) && to != address(0) && bytes(metadataCID).length > 0) {
            vm.expectRevert("DGCToken: Provenance record does not exist");
            dgcToken.mint(to, metadataCID, provenanceHash);
        }
        
        vm.stopPrank();
    }

    /**
     * @dev Test that only minter can mint tokens
     */
    function testFuzz_OnlyMinterCanMint(
        address unauthorizedCaller,
        bytes32 baseSeed
    ) public {
        vm.assume(unauthorizedCaller != minter);
        vm.assume(unauthorizedCaller != admin);
        
        // Register valid provenance
        bytes32 modelHash = keccak256(abi.encodePacked(baseSeed, "model"));
        bytes32 promptHash = keccak256(abi.encodePacked(baseSeed, "prompt"));
        address[] memory emptyCollaborators = new address[](0);
        bytes32 provenanceHash = _registerProvenance(modelHash, promptHash, creator1, emptyCollaborators);
        
        // Unauthorized caller should fail
        vm.prank(unauthorizedCaller);
        vm.expectRevert();
        dgcToken.mint(creator1, "QmTestCID", provenanceHash);
    }

    /**
     * @dev Property 16: Collaborative Provenance Recording
     * Feature: decentralized-generative-content-platform, Property 16: Collaborative Provenance Recording
     * Validates: Requirements 11.1, 11.5
     * 
     * For any collaboratively minted token with N collaborators, the provenance record SHALL contain 
     * all N collaborator addresses and their respective contribution types. No collaborator SHALL be omitted.
     */
    function testFuzz_CollaborativeProvenanceRecording(
        uint8 collaboratorCount,
        bytes32 baseSeed
    ) public {
        // Bound collaborator count to reasonable range (1-10)
        collaboratorCount = uint8(bound(collaboratorCount, 1, 10));
        
        // Create unique collaborator addresses
        address[] memory collaborators = new address[](collaboratorCount);
        for (uint256 i = 0; i < collaboratorCount; i++) {
            collaborators[i] = address(uint160(uint256(keccak256(abi.encodePacked(baseSeed, "collaborator", i)))));
            // Ensure no zero addresses
            if (collaborators[i] == address(0)) {
                collaborators[i] = address(uint160(i + 1));
            }
        }
        
        // Ensure all collaborators are unique
        for (uint256 i = 0; i < collaboratorCount; i++) {
            for (uint256 j = i + 1; j < collaboratorCount; j++) {
                if (collaborators[i] == collaborators[j]) {
                    collaborators[j] = address(uint160(uint160(collaborators[j]) + 1));
                }
            }
        }
        
        // Create unique model and prompt hashes
        bytes32 modelHash = keccak256(abi.encodePacked(baseSeed, "model"));
        bytes32 promptHash = keccak256(abi.encodePacked(baseSeed, "prompt"));
        string memory metadataCID = string(abi.encodePacked("Qm", "CollabTest"));
        
        // Mint collaborative token
        vm.prank(minter);
        uint256 tokenId = dgcToken.mintCollaborative(
            creator1,
            metadataCID,
            modelHash,
            promptHash,
            collaborators
        );
        
        // Get the provenance record
        ProvenanceRegistry.ProvenanceRecord memory record = dgcToken.getProvenance(tokenId);
        
        // Verify all collaborators are recorded
        assertEq(
            record.collaborators.length,
            collaboratorCount,
            "Provenance record should contain all collaborators"
        );
        
        // Verify each collaborator is present and correct
        for (uint256 i = 0; i < collaboratorCount; i++) {
            bool found = false;
            for (uint256 j = 0; j < record.collaborators.length; j++) {
                if (record.collaborators[j] == collaborators[i]) {
                    found = true;
                    break;
                }
            }
            assertTrue(found, "Each collaborator should be present in provenance record");
        }
        
        // Verify no duplicate collaborators in record
        for (uint256 i = 0; i < record.collaborators.length; i++) {
            for (uint256 j = i + 1; j < record.collaborators.length; j++) {
                assertTrue(
                    record.collaborators[i] != record.collaborators[j],
                    "No duplicate collaborators should exist in provenance record"
                );
            }
        }
        
        // Verify primary creator is recorded correctly
        assertEq(record.creator, creator1, "Primary creator should be recorded correctly");
        
        // Verify model and prompt hashes are recorded
        assertEq(record.modelHash, modelHash, "Model hash should be recorded correctly");
        assertEq(record.promptHash, promptHash, "Prompt hash should be recorded correctly");
        
        // Verify record exists and has valid timestamp
        assertTrue(record.exists, "Provenance record should exist");
        assertGt(record.timestamp, 0, "Timestamp should be valid");
    }

    /**
     * @dev Test collaborative minting fails with invalid collaborators
     */
    function testFuzz_CollaborativeMintFailsWithInvalidCollaborators(
        uint8 collaboratorCount,
        bytes32 baseSeed
    ) public {
        collaboratorCount = uint8(bound(collaboratorCount, 1, 5));
        
        bytes32 modelHash = keccak256(abi.encodePacked(baseSeed, "model"));
        bytes32 promptHash = keccak256(abi.encodePacked(baseSeed, "prompt"));
        string memory metadataCID = "QmTestCID";
        
        vm.startPrank(minter);
        
        // Test with empty collaborators array
        address[] memory emptyCollaborators = new address[](0);
        vm.expectRevert("DGCToken: Must have at least one collaborator");
        dgcToken.mintCollaborative(creator1, metadataCID, modelHash, promptHash, emptyCollaborators);
        
        // Test with zero address collaborator
        address[] memory invalidCollaborators = new address[](collaboratorCount);
        for (uint256 i = 0; i < collaboratorCount; i++) {
            if (i == 0) {
                invalidCollaborators[i] = address(0); // Invalid zero address
            } else {
                invalidCollaborators[i] = address(uint160(i));
            }
        }
        
        vm.expectRevert("DGCToken: Invalid collaborator address");
        dgcToken.mintCollaborative(creator1, metadataCID, modelHash, promptHash, invalidCollaborators);
        
        vm.stopPrank();
    }

    /**
     * @dev Test collaborative minting fails with invalid hashes
     */
    function testFuzz_CollaborativeMintFailsWithInvalidHashes(
        bytes32 modelHash,
        bytes32 promptHash
    ) public {
        address[] memory validCollaborators = new address[](1);
        validCollaborators[0] = creator2;
        string memory metadataCID = "QmTestCID";
        
        vm.startPrank(minter);
        
        // Test with invalid model hash
        if (modelHash == bytes32(0)) {
            vm.expectRevert("DGCToken: Invalid model hash");
            dgcToken.mintCollaborative(creator1, metadataCID, modelHash, keccak256("validPrompt"), validCollaborators);
        }
        
        // Test with invalid prompt hash
        if (promptHash == bytes32(0) && modelHash != bytes32(0)) {
            vm.expectRevert("DGCToken: Invalid prompt hash");
            dgcToken.mintCollaborative(creator1, metadataCID, modelHash, promptHash, validCollaborators);
        }
        
        vm.stopPrank();
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