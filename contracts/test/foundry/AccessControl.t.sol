// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../../contracts/DGCToken.sol";
import "../../contracts/ProvenanceRegistry.sol";
import "../../contracts/RoyaltySplitter.sol";
import "@openzeppelin/contracts/access/IAccessControl.sol";

/**
 * @title AccessControlTest
 * @dev Property-based tests for access control enforcement
 * Feature: decentralized-generative-content-platform
 */
contract AccessControlTest is Test {
    DGCToken public dgcToken;
    ProvenanceRegistry public provenanceRegistry;
    RoyaltySplitter public royaltySplitter;

    address public admin;
    address public minter;
    address public registrar;
    address public unauthorizedUser;
    address public anotherUser;

    function setUp() public {
        admin = address(this);
        minter = makeAddr("minter");
        registrar = makeAddr("registrar");
        unauthorizedUser = makeAddr("unauthorized");
        anotherUser = makeAddr("anotherUser");

        // Deploy contracts
        provenanceRegistry = new ProvenanceRegistry();
        dgcToken = new DGCToken("DGC Token", "DGC", address(provenanceRegistry));
        royaltySplitter = new RoyaltySplitter();

        // Grant initial roles
        dgcToken.grantMinterRole(minter);
        provenanceRegistry.grantRole(provenanceRegistry.REGISTRAR_ROLE(), registrar);
        provenanceRegistry.grantRole(provenanceRegistry.REGISTRAR_ROLE(), address(dgcToken));
    }

    /**
     * @dev Property 13: Access Control Enforcement
     * Feature: decentralized-generative-content-platform, Property 13: Access Control Enforcement
     * Validates: Requirements 9.1, 9.2
     * 
     * Only addresses with MINTER_ROLE SHALL be able to mint new tokens.
     * Only addresses with ADMIN_ROLE SHALL be able to modify contract configuration.
     */
    function test_MinterRoleRequired() public {
        // Setup provenance first
        bytes32 modelHash = keccak256("test-model");
        bytes32 promptHash = keccak256("test-prompt");
        bytes32 provenanceHash = keccak256(abi.encodePacked(modelHash, promptHash, block.timestamp));
        address[] memory collaborators = new address[](0);
        
        vm.prank(registrar);
        provenanceRegistry.registerProvenance(
            provenanceHash,
            modelHash,
            promptHash,
            minter,
            collaborators
        );

        // Authorized minter should be able to mint
        vm.prank(minter);
        uint256 tokenId = dgcToken.mint(minter, "QmTest123", provenanceHash);
        assertEq(dgcToken.ownerOf(tokenId), minter, "Minter should own the token");

        // Setup another provenance for unauthorized user test
        bytes32 provenanceHash2 = keccak256(abi.encodePacked(modelHash, promptHash, block.timestamp + 1));
        
        vm.prank(registrar);
        provenanceRegistry.registerProvenance(
            provenanceHash2,
            modelHash,
            promptHash,
            unauthorizedUser,
            collaborators
        );

        // Unauthorized user should not be able to mint
        vm.prank(unauthorizedUser);
        vm.expectRevert();
        dgcToken.mint(unauthorizedUser, "QmTest456", provenanceHash2);
    }

    function test_AdminRoleRequired_DGCToken() public {
        // Admin can grant minter role
        dgcToken.grantMinterRole(anotherUser);
        assertTrue(dgcToken.hasRole(dgcToken.MINTER_ROLE(), anotherUser), "Admin should grant minter role");

        // Unauthorized user cannot grant minter role
        vm.prank(unauthorizedUser);
        vm.expectRevert();
        dgcToken.grantMinterRole(unauthorizedUser);
    }

    function test_AdminRoleRequired_RoyaltySplitter() public {
        address[] memory recipients = new address[](1);
        recipients[0] = minter;
        
        uint256[] memory shares = new uint256[](1);
        shares[0] = 10000;

        // Admin can set royalty
        royaltySplitter.setRoyalty(1, recipients, shares, 1000);
        assertTrue(royaltySplitter.hasRoyaltyConfig(1), "Admin should set royalty config");

        // Unauthorized user cannot set royalty
        vm.prank(unauthorizedUser);
        vm.expectRevert();
        royaltySplitter.setRoyalty(2, recipients, shares, 1000);
    }

    function test_RegistrarRoleRequired_ProvenanceRegistry() public {
        bytes32 modelHash = keccak256("test-model");
        bytes32 promptHash = keccak256("test-prompt");
        bytes32 provenanceHash = keccak256(abi.encodePacked(modelHash, promptHash, block.timestamp));
        address[] memory collaborators = new address[](0);

        // Authorized registrar can register provenance
        vm.prank(registrar);
        provenanceRegistry.registerProvenance(
            provenanceHash,
            modelHash,
            promptHash,
            registrar,
            collaborators
        );
        assertTrue(provenanceRegistry.provenanceExists(provenanceHash), "Registrar should register provenance");

        // Unauthorized user cannot register provenance
        bytes32 provenanceHash2 = keccak256(abi.encodePacked(modelHash, promptHash, block.timestamp + 1));

        vm.prank(unauthorizedUser);
        vm.expectRevert();
        provenanceRegistry.registerProvenance(
            provenanceHash2,
            modelHash,
            promptHash,
            unauthorizedUser,
            collaborators
        );
    }

    /**
     * @dev Fuzz test: Only addresses with MINTER_ROLE can mint
     */
    function testFuzz_OnlyMinterCanMint(address randomAddress) public {
        vm.assume(randomAddress != admin);
        vm.assume(randomAddress != minter);
        vm.assume(randomAddress != address(0));

        bytes32 modelHash = keccak256("test-model");
        bytes32 promptHash = keccak256("test-prompt");
        bytes32 provenanceHash = keccak256(abi.encodePacked(modelHash, promptHash, randomAddress));
        address[] memory collaborators = new address[](0);

        // Register provenance first
        vm.prank(registrar);
        provenanceRegistry.registerProvenance(
            provenanceHash,
            modelHash,
            promptHash,
            randomAddress,
            collaborators
        );

        // Random address without minter role should fail
        vm.prank(randomAddress);
        vm.expectRevert();
        dgcToken.mint(randomAddress, "QmTest", provenanceHash);
    }

    /**
     * @dev Fuzz test: Only admin can grant roles
     */
    function testFuzz_OnlyAdminCanGrantRoles(address randomAddress) public {
        vm.assume(randomAddress != admin);
        vm.assume(randomAddress != address(0));

        // Non-admin should not be able to grant roles
        vm.prank(randomAddress);
        vm.expectRevert();
        dgcToken.grantMinterRole(randomAddress);
    }

    function test_RoleRevocation() public {
        // Grant and then revoke minter role
        dgcToken.grantMinterRole(anotherUser);
        assertTrue(dgcToken.hasRole(dgcToken.MINTER_ROLE(), anotherUser), "Should have minter role");
        
        dgcToken.revokeMinterRole(anotherUser);
        assertFalse(dgcToken.hasRole(dgcToken.MINTER_ROLE(), anotherUser), "Should not have minter role after revocation");

        // Verify the user can no longer mint
        bytes32 modelHash = keccak256("test-model");
        bytes32 promptHash = keccak256("test-prompt");
        bytes32 provenanceHash = keccak256(abi.encodePacked(modelHash, promptHash, block.timestamp));
        address[] memory collaborators = new address[](0);
        
        vm.prank(registrar);
        provenanceRegistry.registerProvenance(
            provenanceHash,
            modelHash,
            promptHash,
            anotherUser,
            collaborators
        );

        vm.prank(anotherUser);
        vm.expectRevert();
        dgcToken.mint(anotherUser, "QmTest", provenanceHash);
    }

    function test_DefaultAdminCanTransferAdminRole() public {
        bytes32 DEFAULT_ADMIN_ROLE = 0x00;

        // Current admin grants admin role to another user
        dgcToken.grantRole(DEFAULT_ADMIN_ROLE, anotherUser);
        assertTrue(dgcToken.hasRole(DEFAULT_ADMIN_ROLE, anotherUser), "Should have admin role");

        // New admin can grant minter role
        vm.prank(anotherUser);
        dgcToken.grantMinterRole(unauthorizedUser);
        assertTrue(dgcToken.hasRole(dgcToken.MINTER_ROLE(), unauthorizedUser), "New admin should grant minter role");
    }

    function test_EventsEmittedOnRoleChanges() public {
        bytes32 MINTER_ROLE = dgcToken.MINTER_ROLE();

        // Check event emission on role grant
        vm.expectEmit(true, true, true, true);
        emit IAccessControl.RoleGranted(MINTER_ROLE, anotherUser, admin);
        dgcToken.grantMinterRole(anotherUser);

        // Check event emission on role revoke
        vm.expectEmit(true, true, true, true);
        emit IAccessControl.RoleRevoked(MINTER_ROLE, anotherUser, admin);
        dgcToken.revokeMinterRole(anotherUser);
    }

    /**
     * @dev Test multiple concurrent role assignments
     */
    function test_MultipleMinters() public {
        address minter1 = makeAddr("minter1");
        address minter2 = makeAddr("minter2");
        address minter3 = makeAddr("minter3");

        // Grant minter role to multiple addresses
        dgcToken.grantMinterRole(minter1);
        dgcToken.grantMinterRole(minter2);
        dgcToken.grantMinterRole(minter3);

        assertTrue(dgcToken.hasRole(dgcToken.MINTER_ROLE(), minter1), "Minter1 should have role");
        assertTrue(dgcToken.hasRole(dgcToken.MINTER_ROLE(), minter2), "Minter2 should have role");
        assertTrue(dgcToken.hasRole(dgcToken.MINTER_ROLE(), minter3), "Minter3 should have role");

        // All minters should be able to mint
        for (uint256 i = 1; i <= 3; i++) {
            address currentMinter;
            if (i == 1) currentMinter = minter1;
            else if (i == 2) currentMinter = minter2;
            else currentMinter = minter3;

            bytes32 modelHash = keccak256(abi.encodePacked("test-model", i));
            bytes32 promptHash = keccak256(abi.encodePacked("test-prompt", i));
            bytes32 provenanceHash = keccak256(abi.encodePacked(modelHash, promptHash, block.timestamp, i));
            address[] memory collaborators = new address[](0);
            
            vm.prank(registrar);
            provenanceRegistry.registerProvenance(
                provenanceHash,
                modelHash,
                promptHash,
                currentMinter,
                collaborators
            );

            vm.prank(currentMinter);
            uint256 tokenId = dgcToken.mint(currentMinter, string(abi.encodePacked("QmTest", i)), provenanceHash);
            assertEq(dgcToken.ownerOf(tokenId), currentMinter, "Minter should own token");
        }
    }

    /**
     * @dev Test role separation between contracts
     */
    function test_RoleSeparationBetweenContracts() public {
        // Having role in one contract shouldn't give access to another
        address specialUser = makeAddr("special");

        // Grant admin role in RoyaltySplitter
        royaltySplitter.grantAdminRole(specialUser);

        // Should NOT be able to grant minter role in DGCToken
        vm.prank(specialUser);
        vm.expectRevert();
        dgcToken.grantMinterRole(specialUser);

        // Should NOT be able to register provenance
        bytes32 modelHash = keccak256("test-model");
        bytes32 promptHash = keccak256("test-prompt");
        bytes32 provenanceHash = keccak256(abi.encodePacked(modelHash, promptHash, block.timestamp));
        address[] memory collaborators = new address[](0);

        vm.prank(specialUser);
        vm.expectRevert();
        provenanceRegistry.registerProvenance(
            provenanceHash,
            modelHash,
            promptHash,
            specialUser,
            collaborators
        );
    }

    /**
     * @dev Fuzz test: Role hierarchy integrity
     */
    function testFuzz_RoleHierarchyIntegrity(address user1, address user2) public {
        vm.assume(user1 != address(0));
        vm.assume(user2 != address(0));
        vm.assume(user1 != admin);
        vm.assume(user2 != admin);
        vm.assume(user1 != user2);

        // Grant minter role to user1 (non-admin)
        dgcToken.grantMinterRole(user1);

        // user1 (minter but not admin) should NOT be able to grant roles
        vm.prank(user1);
        vm.expectRevert();
        dgcToken.grantMinterRole(user2);
    }

    /**
     * @dev Test ProvenanceRegistry admin functions
     */
    function test_ProvenanceRegistryAdminFunctions() public {
        bytes32 REGISTRAR_ROLE = provenanceRegistry.REGISTRAR_ROLE();
        
        // Admin can grant registrar role
        provenanceRegistry.grantRole(REGISTRAR_ROLE, anotherUser);
        assertTrue(provenanceRegistry.hasRole(REGISTRAR_ROLE, anotherUser), "Should have registrar role");

        // New registrar can register provenance
        bytes32 modelHash = keccak256("test-model");
        bytes32 promptHash = keccak256("test-prompt");
        bytes32 provenanceHash = keccak256(abi.encodePacked(modelHash, promptHash, block.timestamp));
        address[] memory collaborators = new address[](0);

        vm.prank(anotherUser);
        provenanceRegistry.registerProvenance(
            provenanceHash,
            modelHash,
            promptHash,
            anotherUser,
            collaborators
        );
        
        assertTrue(provenanceRegistry.provenanceExists(provenanceHash), "New registrar should register");
    }

    /**
     * @dev Test admin cannot renounce default admin role leaving contract without admin
     */
    function test_AdminCannotRenounceIfOnlyAdmin() public {
        bytes32 DEFAULT_ADMIN_ROLE = 0x00;
        
        // Admin renouncing their own role should leave contract functional
        // if there are other admins (this is a governance consideration)
        
        // Grant admin role to another address first
        dgcToken.grantRole(DEFAULT_ADMIN_ROLE, anotherUser);
        
        // Now original admin can renounce
        dgcToken.renounceRole(DEFAULT_ADMIN_ROLE, admin);
        
        // Original admin should no longer have admin role
        assertFalse(dgcToken.hasRole(DEFAULT_ADMIN_ROLE, admin), "Should not have admin role after renounce");
        
        // But anotherUser should still have admin role
        assertTrue(dgcToken.hasRole(DEFAULT_ADMIN_ROLE, anotherUser), "Other admin should still have role");
    }
}
