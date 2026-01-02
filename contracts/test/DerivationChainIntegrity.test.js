const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * Property-based tests for ProvenanceRegistry derivation chain integrity
 * Feature: decentralized-generative-content-platform
 */
describe("ProvenanceRegistry - Derivation Chain Integrity", function () {
  let registry;
  let admin, registrar, creator, collaborator1, collaborator2;

  beforeEach(async function () {
    [admin, registrar, creator, collaborator1, collaborator2] = await ethers.getSigners();

    const ProvenanceRegistry = await ethers.getContractFactory("ProvenanceRegistry");
    registry = await ProvenanceRegistry.deploy();
    await registry.waitForDeployment();

    // Grant registrar role
    const REGISTRAR_ROLE = await registry.REGISTRAR_ROLE();
    await registry.grantRole(REGISTRAR_ROLE, registrar.address);
  });

  /**
   * Property 17: Derivation Chain Integrity
   * Feature: decentralized-generative-content-platform, Property 17: Derivation Chain Integrity
   * Validates: Requirements 12.1, 12.2, 12.3, 12.6
   * 
   * For any derived token with parent token(s), querying the ancestry SHALL return a complete chain 
   * from the token to all its ancestors. For tokens with multiple parents, all parent links SHALL 
   * be recorded and queryable.
   */
  describe("Property 17: Derivation Chain Integrity", function () {
    it("should maintain complete ancestry chain for single-parent derivation", async function () {
      // Create a chain: grandparent -> parent -> child
      const grandparentHash = ethers.keccak256(ethers.toUtf8Bytes("grandparent"));
      const parentHash = ethers.keccak256(ethers.toUtf8Bytes("parent"));
      const childHash = ethers.keccak256(ethers.toUtf8Bytes("child"));

      // Register all provenance records
      await registry.connect(registrar).registerProvenance(
        grandparentHash,
        ethers.keccak256(ethers.toUtf8Bytes("grandparent-model")),
        ethers.keccak256(ethers.toUtf8Bytes("grandparent-prompt")),
        creator.address,
        []
      );

      await registry.connect(registrar).registerProvenance(
        parentHash,
        ethers.keccak256(ethers.toUtf8Bytes("parent-model")),
        ethers.keccak256(ethers.toUtf8Bytes("parent-prompt")),
        creator.address,
        []
      );

      await registry.connect(registrar).registerProvenance(
        childHash,
        ethers.keccak256(ethers.toUtf8Bytes("child-model")),
        ethers.keccak256(ethers.toUtf8Bytes("child-prompt")),
        creator.address,
        []
      );

      // Link derivations
      await registry.connect(registrar).linkDerivation(parentHash, [grandparentHash]);
      await registry.connect(registrar).linkDerivation(childHash, [parentHash]);

      // Verify parent relationships
      const parentRecord = await registry.getProvenance(parentHash);
      expect(parentRecord.parentHashes.length).to.equal(1);
      expect(parentRecord.parentHashes[0]).to.equal(grandparentHash);

      const childRecord = await registry.getProvenance(childHash);
      expect(childRecord.parentHashes.length).to.equal(1);
      expect(childRecord.parentHashes[0]).to.equal(parentHash);

      // Verify child relationships
      const grandparentChildren = await registry.getChildHashes(grandparentHash);
      expect(grandparentChildren.length).to.equal(1);
      expect(grandparentChildren[0]).to.equal(parentHash);

      const parentChildren = await registry.getChildHashes(parentHash);
      expect(parentChildren.length).to.equal(1);
      expect(parentChildren[0]).to.equal(childHash);

      // Verify complete ancestry chain
      const childAncestry = await registry.getAncestryChain(childHash);
      expect(childAncestry.length).to.equal(2);
      expect(childAncestry).to.include(parentHash);
      expect(childAncestry).to.include(grandparentHash);

      const parentAncestry = await registry.getAncestryChain(parentHash);
      expect(parentAncestry.length).to.equal(1);
      expect(parentAncestry[0]).to.equal(grandparentHash);

      const grandparentAncestry = await registry.getAncestryChain(grandparentHash);
      expect(grandparentAncestry.length).to.equal(0);
    });

    it("should maintain complete ancestry chain for multi-parent derivation", async function () {
      // Create a diamond pattern: parent1, parent2 -> child -> grandchild
      const parent1Hash = ethers.keccak256(ethers.toUtf8Bytes("parent1"));
      const parent2Hash = ethers.keccak256(ethers.toUtf8Bytes("parent2"));
      const childHash = ethers.keccak256(ethers.toUtf8Bytes("multi-parent-child"));
      const grandchildHash = ethers.keccak256(ethers.toUtf8Bytes("grandchild"));

      // Register all provenance records
      await registry.connect(registrar).registerProvenance(
        parent1Hash,
        ethers.keccak256(ethers.toUtf8Bytes("parent1-model")),
        ethers.keccak256(ethers.toUtf8Bytes("parent1-prompt")),
        creator.address,
        []
      );

      await registry.connect(registrar).registerProvenance(
        parent2Hash,
        ethers.keccak256(ethers.toUtf8Bytes("parent2-model")),
        ethers.keccak256(ethers.toUtf8Bytes("parent2-prompt")),
        creator.address,
        []
      );

      await registry.connect(registrar).registerProvenance(
        childHash,
        ethers.keccak256(ethers.toUtf8Bytes("child-model")),
        ethers.keccak256(ethers.toUtf8Bytes("child-prompt")),
        creator.address,
        []
      );

      await registry.connect(registrar).registerProvenance(
        grandchildHash,
        ethers.keccak256(ethers.toUtf8Bytes("grandchild-model")),
        ethers.keccak256(ethers.toUtf8Bytes("grandchild-prompt")),
        creator.address,
        []
      );

      // Link multi-parent derivation
      await registry.connect(registrar).linkDerivation(childHash, [parent1Hash, parent2Hash]);
      await registry.connect(registrar).linkDerivation(grandchildHash, [childHash]);

      // Verify multi-parent relationships
      const childRecord = await registry.getProvenance(childHash);
      expect(childRecord.parentHashes.length).to.equal(2);
      expect(childRecord.parentHashes).to.include(parent1Hash);
      expect(childRecord.parentHashes).to.include(parent2Hash);

      // Verify both parents have the child
      const parent1Children = await registry.getChildHashes(parent1Hash);
      expect(parent1Children).to.include(childHash);

      const parent2Children = await registry.getChildHashes(parent2Hash);
      expect(parent2Children).to.include(childHash);

      // Verify complete ancestry for grandchild includes all ancestors
      const grandchildAncestry = await registry.getAncestryChain(grandchildHash);
      expect(grandchildAncestry.length).to.equal(3);
      expect(grandchildAncestry).to.include(childHash);
      expect(grandchildAncestry).to.include(parent1Hash);
      expect(grandchildAncestry).to.include(parent2Hash);

      // Verify child ancestry includes both parents
      const childAncestry = await registry.getAncestryChain(childHash);
      expect(childAncestry.length).to.equal(2);
      expect(childAncestry).to.include(parent1Hash);
      expect(childAncestry).to.include(parent2Hash);
    });

    it("should handle complex derivation trees with multiple branches", async function () {
      // Create complex tree:
      //     root
      //    /    \
      //  branch1  branch2
      //    |        |
      //  leaf1    leaf2
      //     \      /
      //      merge
      
      const rootHash = ethers.keccak256(ethers.toUtf8Bytes("root"));
      const branch1Hash = ethers.keccak256(ethers.toUtf8Bytes("branch1"));
      const branch2Hash = ethers.keccak256(ethers.toUtf8Bytes("branch2"));
      const leaf1Hash = ethers.keccak256(ethers.toUtf8Bytes("leaf1"));
      const leaf2Hash = ethers.keccak256(ethers.toUtf8Bytes("leaf2"));
      const mergeHash = ethers.keccak256(ethers.toUtf8Bytes("merge"));

      // Register all nodes
      const nodes = [rootHash, branch1Hash, branch2Hash, leaf1Hash, leaf2Hash, mergeHash];
      for (let i = 0; i < nodes.length; i++) {
        await registry.connect(registrar).registerProvenance(
          nodes[i],
          ethers.keccak256(ethers.toUtf8Bytes(`model-${i}`)),
          ethers.keccak256(ethers.toUtf8Bytes(`prompt-${i}`)),
          creator.address,
          []
        );
      }

      // Link derivations to create the tree
      await registry.connect(registrar).linkDerivation(branch1Hash, [rootHash]);
      await registry.connect(registrar).linkDerivation(branch2Hash, [rootHash]);
      await registry.connect(registrar).linkDerivation(leaf1Hash, [branch1Hash]);
      await registry.connect(registrar).linkDerivation(leaf2Hash, [branch2Hash]);
      await registry.connect(registrar).linkDerivation(mergeHash, [leaf1Hash, leaf2Hash]);

      // Verify merge node has complete ancestry
      const mergeAncestry = await registry.getAncestryChain(mergeHash);
      expect(mergeAncestry.length).to.equal(5); // leaf1, leaf2, branch1, branch2, root
      expect(mergeAncestry).to.include(leaf1Hash);
      expect(mergeAncestry).to.include(leaf2Hash);
      expect(mergeAncestry).to.include(branch1Hash);
      expect(mergeAncestry).to.include(branch2Hash);
      expect(mergeAncestry).to.include(rootHash);

      // Verify intermediate nodes have correct ancestry
      const leaf1Ancestry = await registry.getAncestryChain(leaf1Hash);
      expect(leaf1Ancestry.length).to.equal(2);
      expect(leaf1Ancestry).to.include(branch1Hash);
      expect(leaf1Ancestry).to.include(rootHash);

      const branch1Ancestry = await registry.getAncestryChain(branch1Hash);
      expect(branch1Ancestry.length).to.equal(1);
      expect(branch1Ancestry[0]).to.equal(rootHash);

      // Verify root has correct children
      const rootChildren = await registry.getChildHashes(rootHash);
      expect(rootChildren.length).to.equal(2);
      expect(rootChildren).to.include(branch1Hash);
      expect(rootChildren).to.include(branch2Hash);
    });

    it("should prevent linking to non-existent parents", async function () {
      const childHash = ethers.keccak256(ethers.toUtf8Bytes("orphan-child"));
      const nonExistentParent = ethers.keccak256(ethers.toUtf8Bytes("non-existent"));

      // Register child
      await registry.connect(registrar).registerProvenance(
        childHash,
        ethers.keccak256(ethers.toUtf8Bytes("child-model")),
        ethers.keccak256(ethers.toUtf8Bytes("child-prompt")),
        creator.address,
        []
      );

      // Attempt to link to non-existent parent should fail
      await expect(
        registry.connect(registrar).linkDerivation(childHash, [nonExistentParent])
      ).to.be.revertedWith("ProvenanceRegistry: Parent provenance does not exist");
    });

    it("should prevent linking non-existent children", async function () {
      const parentHash = ethers.keccak256(ethers.toUtf8Bytes("lonely-parent"));
      const nonExistentChild = ethers.keccak256(ethers.toUtf8Bytes("non-existent-child"));

      // Register parent
      await registry.connect(registrar).registerProvenance(
        parentHash,
        ethers.keccak256(ethers.toUtf8Bytes("parent-model")),
        ethers.keccak256(ethers.toUtf8Bytes("parent-prompt")),
        creator.address,
        []
      );

      // Attempt to link non-existent child should fail
      await expect(
        registry.connect(registrar).linkDerivation(nonExistentChild, [parentHash])
      ).to.be.revertedWith("ProvenanceRegistry: Child provenance does not exist");
    });

    it("should handle edge cases in derivation linking", async function () {
      const childHash = ethers.keccak256(ethers.toUtf8Bytes("edge-case-child"));
      const parentHash = ethers.keccak256(ethers.toUtf8Bytes("edge-case-parent"));

      // Register both
      await registry.connect(registrar).registerProvenance(
        childHash,
        ethers.keccak256(ethers.toUtf8Bytes("child-model")),
        ethers.keccak256(ethers.toUtf8Bytes("child-prompt")),
        creator.address,
        []
      );

      await registry.connect(registrar).registerProvenance(
        parentHash,
        ethers.keccak256(ethers.toUtf8Bytes("parent-model")),
        ethers.keccak256(ethers.toUtf8Bytes("parent-prompt")),
        creator.address,
        []
      );

      // Test empty parent array
      await expect(
        registry.connect(registrar).linkDerivation(childHash, [])
      ).to.be.revertedWith("ProvenanceRegistry: Must have at least one parent");

      // Test invalid child hash
      await expect(
        registry.connect(registrar).linkDerivation(ethers.ZeroHash, [parentHash])
      ).to.be.revertedWith("ProvenanceRegistry: Invalid child hash");

      // Test invalid parent hash in array
      await expect(
        registry.connect(registrar).linkDerivation(childHash, [ethers.ZeroHash])
      ).to.be.revertedWith("ProvenanceRegistry: Invalid parent hash");
    });

    it("should maintain integrity after multiple derivation operations", async function () {
      // Create a series of derivations and verify integrity at each step
      const hashes = [];
      for (let i = 0; i < 10; i++) {
        hashes.push(ethers.keccak256(ethers.toUtf8Bytes(`node-${i}`)));
      }

      // Register all nodes
      for (let i = 0; i < hashes.length; i++) {
        await registry.connect(registrar).registerProvenance(
          hashes[i],
          ethers.keccak256(ethers.toUtf8Bytes(`model-${i}`)),
          ethers.keccak256(ethers.toUtf8Bytes(`prompt-${i}`)),
          creator.address,
          []
        );
      }

      // Create linear chain: 0 -> 1 -> 2 -> ... -> 9
      for (let i = 1; i < hashes.length; i++) {
        await registry.connect(registrar).linkDerivation(hashes[i], [hashes[i-1]]);
        
        // Verify ancestry grows correctly at each step
        const ancestry = await registry.getAncestryChain(hashes[i]);
        expect(ancestry.length).to.equal(i);
        
        // Verify all ancestors are present
        for (let j = 0; j < i; j++) {
          expect(ancestry).to.include(hashes[j]);
        }
      }

      // Verify final node has complete ancestry
      const finalAncestry = await registry.getAncestryChain(hashes[9]);
      expect(finalAncestry.length).to.equal(9);
      for (let i = 0; i < 9; i++) {
        expect(finalAncestry).to.include(hashes[i]);
      }
    });
  });
});