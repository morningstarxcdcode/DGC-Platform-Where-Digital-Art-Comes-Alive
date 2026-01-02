// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../../contracts/ProvenanceRegistry.sol";

/**
 * @title ProvenanceRegistryTest
 * @dev Property-based tests for ProvenanceRegistry contract
 * Feature: decentralized-generative-content-platform
 */
contract ProvenanceRegistryTest is Test {
    ProvenanceRegistry public registry;
    address public admin;
    address public registrar;
    address public creator;
    address public collaborator1;
    address public collaborator2;

    function setUp() public {
        admin = address(this);
        registrar = makeAddr("registrar");
        creator = makeAddr("creator");
        collaborator1 = makeAddr("collaborator1");
        collaborator2 = makeAddr("collaborator2");

        registry = new ProvenanceRegistry();
        registry.grantRegistrarRole(registrar);
    }

    /**
     * @dev Property 3: Provenance Completeness on Mint
     * Feature: decentralized-generative-content-platform, Property 3: Provenance Completeness on Mint
     * Validates: Requirements 2.1, 2.2, 2.3, 2.4
     * 
     * For any successfully registered provenance, querying its record SHALL return a complete record 
     * containing: non-empty modelHash, non-empty promptHash, timestamp <= current block timestamp, 
     * and creator address matching the registration address.
     */
    function testFuzz_ProvenanceCompletenessOnRegistration(
        bytes32 provenanceHash,
        bytes32 modelHash,
        bytes32 promptHash,
        address creatorAddr,
        uint8 collaboratorCount
    ) public {
        // Bound inputs to valid ranges
        vm.assume(provenanceHash != bytes32(0));
        vm.assume(modelHash != bytes32(0));
        vm.assume(promptHash != bytes32(0));
        vm.assume(creatorAddr != address(0));
        collaboratorCount = uint8(bound(collaboratorCount, 0, 5)); // Limit to reasonable number

        // Create collaborators array
        address[] memory collaborators = new address[](collaboratorCount);
        for (uint256 i = 0; i < collaboratorCount; i++) {
            collaborators[i] = makeAddr(string(abi.encodePacked("collaborator", i)));
        }

        // Record timestamp before registration
        uint256 timestampBefore = block.timestamp;

        // Register provenance as registrar
        vm.prank(registrar);
        registry.registerProvenance(
            provenanceHash,
            modelHash,
            promptHash,
            creatorAddr,
            collaborators
        );

        // Record timestamp after registration
        uint256 timestampAfter = block.timestamp;

        // Query the registered provenance
        ProvenanceRegistry.ProvenanceRecord memory record = registry.getProvenance(provenanceHash);

        // Verify completeness - all required fields must be present and valid
        assertEq(record.modelHash, modelHash, "Model hash should match registered value");
        assertEq(record.promptHash, promptHash, "Prompt hash should match registered value");
        assertEq(record.creator, creatorAddr, "Creator address should match registered value");
        assertTrue(record.exists, "Record should exist");
        
        // Timestamp should be within the registration window
        assertGe(record.timestamp, timestampBefore, "Timestamp should be >= timestamp before registration");
        assertLe(record.timestamp, timestampAfter, "Timestamp should be <= timestamp after registration");
        
        // Verify collaborators array matches
        assertEq(record.collaborators.length, collaboratorCount, "Collaborators count should match");
        for (uint256 i = 0; i < collaboratorCount; i++) {
            assertEq(record.collaborators[i], collaborators[i], "Collaborator address should match");
        }

        // Verify non-empty hashes (already assumed, but explicit check)
        assertTrue(record.modelHash != bytes32(0), "Model hash should not be empty");
        assertTrue(record.promptHash != bytes32(0), "Prompt hash should not be empty");
    }

    /**
     * @dev Test that provenance registration fails with invalid inputs
     */
    function testFuzz_ProvenanceRegistrationFailsWithInvalidInputs(
        bytes32 provenanceHash,
        bytes32 modelHash,
        bytes32 promptHash,
        address creatorAddr
    ) public {
        address[] memory emptyCollaborators = new address[](0);

        vm.startPrank(registrar);

        // Test invalid provenance hash
        if (provenanceHash == bytes32(0)) {
            vm.expectRevert("ProvenanceRegistry: Invalid provenance hash");
            registry.registerProvenance(provenanceHash, keccak256("model"), keccak256("prompt"), creator, emptyCollaborators);
        }

        // Test invalid model hash
        if (modelHash == bytes32(0) && provenanceHash != bytes32(0)) {
            vm.expectRevert("ProvenanceRegistry: Invalid model hash");
            registry.registerProvenance(provenanceHash, modelHash, keccak256("prompt"), creator, emptyCollaborators);
        }

        // Test invalid prompt hash
        if (promptHash == bytes32(0) && provenanceHash != bytes32(0) && modelHash != bytes32(0)) {
            vm.expectRevert("ProvenanceRegistry: Invalid prompt hash");
            registry.registerProvenance(provenanceHash, modelHash, promptHash, creator, emptyCollaborators);
        }

        // Test invalid creator address
        if (creatorAddr == address(0) && provenanceHash != bytes32(0) && modelHash != bytes32(0) && promptHash != bytes32(0)) {
            vm.expectRevert("ProvenanceRegistry: Invalid creator address");
            registry.registerProvenance(provenanceHash, modelHash, promptHash, creatorAddr, emptyCollaborators);
        }

        vm.stopPrank();
    }

    /**
     * @dev Test that duplicate provenance registration fails
     */
    function testFuzz_DuplicateProvenanceRegistrationFails(
        bytes32 provenanceHash,
        bytes32 modelHash,
        bytes32 promptHash
    ) public {
        vm.assume(provenanceHash != bytes32(0));
        vm.assume(modelHash != bytes32(0));
        vm.assume(promptHash != bytes32(0));

        address[] memory emptyCollaborators = new address[](0);

        vm.startPrank(registrar);

        // First registration should succeed
        registry.registerProvenance(provenanceHash, modelHash, promptHash, creator, emptyCollaborators);

        // Second registration with same hash should fail
        vm.expectRevert("ProvenanceRegistry: Provenance already exists");
        registry.registerProvenance(provenanceHash, modelHash, promptHash, creator, emptyCollaborators);

        vm.stopPrank();
    }

    /**
     * @dev Test that only registrar can register provenance
     */
    function testFuzz_OnlyRegistrarCanRegisterProvenance(
        address unauthorizedCaller,
        bytes32 provenanceHash,
        bytes32 modelHash,
        bytes32 promptHash
    ) public {
        vm.assume(unauthorizedCaller != registrar);
        vm.assume(unauthorizedCaller != admin);
        vm.assume(provenanceHash != bytes32(0));
        vm.assume(modelHash != bytes32(0));
        vm.assume(promptHash != bytes32(0));

        address[] memory emptyCollaborators = new address[](0);

        // Unauthorized caller should fail
        vm.prank(unauthorizedCaller);
        vm.expectRevert();
        registry.registerProvenance(provenanceHash, modelHash, promptHash, creator, emptyCollaborators);
    }
}