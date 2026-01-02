const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * Property-based tests for ProvenanceRegistry immutability
 * Feature: decentralized-generative-content-platform
 */
describe("ProvenanceRegistry - Immutability", function () {
  let registry;
  let admin, registrar, creator, collaborator1;

  beforeEach(async function () {
    [admin, registrar, creator, collaborator1] = await ethers.getSigners();

    const ProvenanceRegistry = await ethers.getContractFactory("ProvenanceRegistry");
    registry = await ProvenanceRegistry.deploy();
    await registry.waitForDeployment();

    // Grant registrar role
    const REGISTRAR_ROLE = await registry.REGISTRAR_ROLE();
    await registry.grantRole(REGISTRAR_ROLE, registrar.address);
  });

  /**
   * Property 4: Provenance Immutability
   * Feature: decentralized-generative-content-platform, Property 4: Provenance Immutability
   * Validates: Requirements 2.5
   * 
   * For any minted token, any attempt to modify its provenance record after creation SHALL revert, 
   * and subsequent queries SHALL return the original provenance data unchanged.
   */
  describe("Property 4: Provenance Immutability", function () {
    it("should prevent modification of existing provenance records", async function () {
      // Register initial provenance
      const provenanceHash = ethers.keccak256(ethers.toUtf8Bytes("immutable-test-1"));
      const originalModelHash = ethers.keccak256(ethers.toUtf8Bytes("stable-diffusion-xl-1.0"));
      const originalPromptHash = ethers.keccak256(ethers.toUtf8Bytes("original prompt"));
      const originalCollaborators = [collaborator1.address];

      await registry.connect(registrar).registerProvenance(
        provenanceHash,
        originalModelHash,
        originalPromptHash,
        creator.address,
        originalCollaborators
      );

      // Get original record
      const originalRecord = await registry.getProvenance(provenanceHash);

      // Attempt to register the same provenance hash with different data should fail
      const newModelHash = ethers.keccak256(ethers.toUtf8Bytes("different-model"));
      const newPromptHash = ethers.keccak256(ethers.toUtf8Bytes("different prompt"));
      const newCollaborators = [];

      await expect(
        registry.connect(registrar).registerProvenance(
          provenanceHash,
          newModelHash,
          newPromptHash,
          creator.address,
          newCollaborators
        )
      ).to.be.revertedWith("ProvenanceRegistry: Provenance already exists");

      // Verify original data is unchanged
      const recordAfterAttempt = await registry.getProvenance(provenanceHash);
      
      expect(recordAfterAttempt.modelHash).to.equal(originalRecord.modelHash);
      expect(recordAfterAttempt.promptHash).to.equal(originalRecord.promptHash);
      expect(recordAfterAttempt.creator).to.equal(originalRecord.creator);
      expect(recordAfterAttempt.timestamp).to.equal(originalRecord.timestamp);
      expect(recordAfterAttempt.collaborators.length).to.equal(originalRecord.collaborators.length);
      expect(recordAfterAttempt.collaborators[0]).to.equal(originalRecord.collaborators[0]);
    });

    it("should maintain immutability across multiple modification attempts", async function () {
      // Register provenance with multiple collaborators
      const provenanceHash = ethers.keccak256(ethers.toUtf8Bytes("immutable-test-2"));
      const modelHash = ethers.keccak256(ethers.toUtf8Bytes("gpt-4"));
      const promptHash = ethers.keccak256(ethers.toUtf8Bytes("complex prompt"));
      const collaborators = [collaborator1.address, creator.address];

      await registry.connect(registrar).registerProvenance(
        provenanceHash,
        modelHash,
        promptHash,
        creator.address,
        collaborators
      );

      const originalRecord = await registry.getProvenance(provenanceHash);

      // Multiple attempts to modify should all fail
      for (let i = 0; i < 5; i++) {
        const attemptModelHash = ethers.keccak256(ethers.toUtf8Bytes(`attempt-${i}-model`));
        const attemptPromptHash = ethers.keccak256(ethers.toUtf8Bytes(`attempt-${i}-prompt`));
        
        await expect(
          registry.connect(registrar).registerProvenance(
            provenanceHash,
            attemptModelHash,
            attemptPromptHash,
            creator.address,
            []
          )
        ).to.be.revertedWith("ProvenanceRegistry: Provenance already exists");
      }

      // Verify data remains unchanged after all attempts
      const finalRecord = await registry.getProvenance(provenanceHash);
      
      expect(finalRecord.modelHash).to.equal(originalRecord.modelHash);
      expect(finalRecord.promptHash).to.equal(originalRecord.promptHash);
      expect(finalRecord.creator).to.equal(originalRecord.creator);
      expect(finalRecord.timestamp).to.equal(originalRecord.timestamp);
      expect(finalRecord.collaborators.length).to.equal(originalRecord.collaborators.length);
      for (let i = 0; i < originalRecord.collaborators.length; i++) {
        expect(finalRecord.collaborators[i]).to.equal(originalRecord.collaborators[i]);
      }
    });

    it("should prevent modification attempts from different callers", async function () {
      const provenanceHash = ethers.keccak256(ethers.toUtf8Bytes("immutable-test-3"));
      const modelHash = ethers.keccak256(ethers.toUtf8Bytes("musicgen"));
      const promptHash = ethers.keccak256(ethers.toUtf8Bytes("jazz music"));

      // Register as registrar
      await registry.connect(registrar).registerProvenance(
        provenanceHash,
        modelHash,
        promptHash,
        creator.address,
        []
      );

      const originalRecord = await registry.getProvenance(provenanceHash);

      // Attempt modification as admin should also fail (no direct modification function exists)
      // The contract doesn't provide any function to modify existing records
      
      // Attempt to register same hash as admin (who also has registrar role)
      await expect(
        registry.connect(admin).registerProvenance(
          provenanceHash,
          ethers.keccak256(ethers.toUtf8Bytes("different-model")),
          ethers.keccak256(ethers.toUtf8Bytes("different-prompt")),
          creator.address,
          []
        )
      ).to.be.revertedWith("ProvenanceRegistry: Provenance already exists");

      // Verify immutability
      const recordAfterAdminAttempt = await registry.getProvenance(provenanceHash);
      expect(recordAfterAdminAttempt.modelHash).to.equal(originalRecord.modelHash);
      expect(recordAfterAdminAttempt.promptHash).to.equal(originalRecord.promptHash);
    });

    it("should maintain immutability even after derivation linking", async function () {
      // Register parent provenance
      const parentHash = ethers.keccak256(ethers.toUtf8Bytes("parent-immutable"));
      const parentModelHash = ethers.keccak256(ethers.toUtf8Bytes("parent-model"));
      const parentPromptHash = ethers.keccak256(ethers.toUtf8Bytes("parent-prompt"));

      await registry.connect(registrar).registerProvenance(
        parentHash,
        parentModelHash,
        parentPromptHash,
        creator.address,
        []
      );

      // Register child provenance
      const childHash = ethers.keccak256(ethers.toUtf8Bytes("child-immutable"));
      const childModelHash = ethers.keccak256(ethers.toUtf8Bytes("child-model"));
      const childPromptHash = ethers.keccak256(ethers.toUtf8Bytes("child-prompt"));

      await registry.connect(registrar).registerProvenance(
        childHash,
        childModelHash,
        childPromptHash,
        creator.address,
        []
      );

      // Link derivation
      await registry.connect(registrar).linkDerivation(childHash, [parentHash]);

      // Get records after linking
      const parentAfterLinking = await registry.getProvenance(parentHash);
      const childAfterLinking = await registry.getProvenance(childHash);

      // Attempt to modify parent after derivation linking should still fail
      await expect(
        registry.connect(registrar).registerProvenance(
          parentHash,
          ethers.keccak256(ethers.toUtf8Bytes("modified-parent-model")),
          ethers.keccak256(ethers.toUtf8Bytes("modified-parent-prompt")),
          creator.address,
          []
        )
      ).to.be.revertedWith("ProvenanceRegistry: Provenance already exists");

      // Attempt to modify child after derivation linking should still fail
      await expect(
        registry.connect(registrar).registerProvenance(
          childHash,
          ethers.keccak256(ethers.toUtf8Bytes("modified-child-model")),
          ethers.keccak256(ethers.toUtf8Bytes("modified-child-prompt")),
          creator.address,
          []
        )
      ).to.be.revertedWith("ProvenanceRegistry: Provenance already exists");

      // Verify both records remain unchanged
      const finalParent = await registry.getProvenance(parentHash);
      const finalChild = await registry.getProvenance(childHash);

      expect(finalParent.modelHash).to.equal(parentAfterLinking.modelHash);
      expect(finalParent.promptHash).to.equal(parentAfterLinking.promptHash);
      expect(finalChild.modelHash).to.equal(childAfterLinking.modelHash);
      expect(finalChild.promptHash).to.equal(childAfterLinking.promptHash);
    });

    it("should preserve immutability with edge case inputs", async function () {
      // Test with maximum length collaborators array
      const [, , , ...signers] = await ethers.getSigners();
      const maxCollaborators = signers.slice(0, 15).map(s => s.address);
      
      const provenanceHash = ethers.keccak256(ethers.toUtf8Bytes("edge-case-immutable"));
      const modelHash = ethers.keccak256(ethers.toUtf8Bytes("edge-case-model"));
      const promptHash = ethers.keccak256(ethers.toUtf8Bytes("edge-case-prompt"));

      await registry.connect(registrar).registerProvenance(
        provenanceHash,
        modelHash,
        promptHash,
        creator.address,
        maxCollaborators
      );

      const originalRecord = await registry.getProvenance(provenanceHash);

      // Attempt modification should fail
      await expect(
        registry.connect(registrar).registerProvenance(
          provenanceHash,
          ethers.keccak256(ethers.toUtf8Bytes("different-model")),
          ethers.keccak256(ethers.toUtf8Bytes("different-prompt")),
          creator.address,
          [] // Different collaborators array
        )
      ).to.be.revertedWith("ProvenanceRegistry: Provenance already exists");

      // Verify all collaborators are preserved
      const finalRecord = await registry.getProvenance(provenanceHash);
      expect(finalRecord.collaborators.length).to.equal(maxCollaborators.length);
      for (let i = 0; i < maxCollaborators.length; i++) {
        expect(finalRecord.collaborators[i]).to.equal(maxCollaborators[i]);
      }
    });
  });
});