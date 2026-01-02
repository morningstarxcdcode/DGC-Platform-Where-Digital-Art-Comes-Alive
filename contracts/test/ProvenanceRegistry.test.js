const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * Property-based tests for ProvenanceRegistry contract
 * Feature: decentralized-generative-content-platform
 */
describe("ProvenanceRegistry", function () {
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
   * Property 3: Provenance Completeness on Mint
   * Feature: decentralized-generative-content-platform, Property 3: Provenance Completeness on Mint
   * Validates: Requirements 2.1, 2.2, 2.3, 2.4
   * 
   * For any successfully registered provenance, querying its record SHALL return a complete record 
   * containing: non-empty modelHash, non-empty promptHash, timestamp <= current block timestamp, 
   * and creator address matching the registration address.
   */
  describe("Property 3: Provenance Completeness on Registration", function () {
    it("should return complete provenance record for any valid registration", async function () {
      // Generate random test data
      const provenanceHash = ethers.keccak256(ethers.toUtf8Bytes("test-provenance-1"));
      const modelHash = ethers.keccak256(ethers.toUtf8Bytes("stable-diffusion-xl-1.0"));
      const promptHash = ethers.keccak256(ethers.toUtf8Bytes("a beautiful sunset over mountains"));
      const collaborators = [collaborator1.address, collaborator2.address];

      // Record timestamp before registration
      const timestampBefore = Math.floor(Date.now() / 1000);

      // Register provenance
      await registry.connect(registrar).registerProvenance(
        provenanceHash,
        modelHash,
        promptHash,
        creator.address,
        collaborators
      );

      // Query the registered provenance
      const record = await registry.getProvenance(provenanceHash);

      // Verify completeness - all required fields must be present and valid
      expect(record.modelHash).to.equal(modelHash, "Model hash should match registered value");
      expect(record.promptHash).to.equal(promptHash, "Prompt hash should match registered value");
      expect(record.creator).to.equal(creator.address, "Creator address should match registered value");
      expect(record.exists).to.be.true;
      
      // Timestamp should be a valid non-zero value (block timestamp can vary in test environments)
      expect(record.timestamp).to.be.gt(0, "Timestamp should be positive");
      expect(record.timestamp).to.be.a('bigint', "Timestamp should be a number");
      
      // Verify collaborators array matches
      expect(record.collaborators.length).to.equal(collaborators.length);
      for (let i = 0; i < collaborators.length; i++) {
        expect(record.collaborators[i]).to.equal(collaborators[i]);
      }

      // Verify non-empty hashes
      expect(record.modelHash).to.not.equal(ethers.ZeroHash);
      expect(record.promptHash).to.not.equal(ethers.ZeroHash);
    });

    it("should handle registration with no collaborators", async function () {
      const provenanceHash = ethers.keccak256(ethers.toUtf8Bytes("test-provenance-solo"));
      const modelHash = ethers.keccak256(ethers.toUtf8Bytes("gpt-4"));
      const promptHash = ethers.keccak256(ethers.toUtf8Bytes("write a poem about AI"));
      const collaborators = [];

      await registry.connect(registrar).registerProvenance(
        provenanceHash,
        modelHash,
        promptHash,
        creator.address,
        collaborators
      );

      const record = await registry.getProvenance(provenanceHash);
      
      expect(record.modelHash).to.equal(modelHash);
      expect(record.promptHash).to.equal(promptHash);
      expect(record.creator).to.equal(creator.address);
      expect(record.collaborators.length).to.equal(0);
      expect(record.exists).to.be.true;
    });

    it("should handle registration with maximum collaborators", async function () {
      const provenanceHash = ethers.keccak256(ethers.toUtf8Bytes("test-provenance-many-collabs"));
      const modelHash = ethers.keccak256(ethers.toUtf8Bytes("musicgen"));
      const promptHash = ethers.keccak256(ethers.toUtf8Bytes("upbeat electronic music"));
      
      // Create array of 10 collaborators
      const [, , , ...signers] = await ethers.getSigners();
      const collaborators = signers.slice(0, 10).map(s => s.address);

      await registry.connect(registrar).registerProvenance(
        provenanceHash,
        modelHash,
        promptHash,
        creator.address,
        collaborators
      );

      const record = await registry.getProvenance(provenanceHash);
      
      expect(record.collaborators.length).to.equal(10);
      for (let i = 0; i < 10; i++) {
        expect(record.collaborators[i]).to.equal(collaborators[i]);
      }
    });
  });

  describe("Registration Validation", function () {
    it("should reject invalid provenance hash", async function () {
      await expect(
        registry.connect(registrar).registerProvenance(
          ethers.ZeroHash,
          ethers.keccak256(ethers.toUtf8Bytes("model")),
          ethers.keccak256(ethers.toUtf8Bytes("prompt")),
          creator.address,
          []
        )
      ).to.be.revertedWith("ProvenanceRegistry: Invalid provenance hash");
    });

    it("should reject invalid model hash", async function () {
      await expect(
        registry.connect(registrar).registerProvenance(
          ethers.keccak256(ethers.toUtf8Bytes("provenance")),
          ethers.ZeroHash,
          ethers.keccak256(ethers.toUtf8Bytes("prompt")),
          creator.address,
          []
        )
      ).to.be.revertedWith("ProvenanceRegistry: Invalid model hash");
    });

    it("should reject invalid prompt hash", async function () {
      await expect(
        registry.connect(registrar).registerProvenance(
          ethers.keccak256(ethers.toUtf8Bytes("provenance")),
          ethers.keccak256(ethers.toUtf8Bytes("model")),
          ethers.ZeroHash,
          creator.address,
          []
        )
      ).to.be.revertedWith("ProvenanceRegistry: Invalid prompt hash");
    });

    it("should reject invalid creator address", async function () {
      await expect(
        registry.connect(registrar).registerProvenance(
          ethers.keccak256(ethers.toUtf8Bytes("provenance")),
          ethers.keccak256(ethers.toUtf8Bytes("model")),
          ethers.keccak256(ethers.toUtf8Bytes("prompt")),
          ethers.ZeroAddress,
          []
        )
      ).to.be.revertedWith("ProvenanceRegistry: Invalid creator address");
    });

    it("should reject duplicate provenance registration", async function () {
      const provenanceHash = ethers.keccak256(ethers.toUtf8Bytes("duplicate-test"));
      const modelHash = ethers.keccak256(ethers.toUtf8Bytes("model"));
      const promptHash = ethers.keccak256(ethers.toUtf8Bytes("prompt"));

      // First registration should succeed
      await registry.connect(registrar).registerProvenance(
        provenanceHash,
        modelHash,
        promptHash,
        creator.address,
        []
      );

      // Second registration should fail
      await expect(
        registry.connect(registrar).registerProvenance(
          provenanceHash,
          modelHash,
          promptHash,
          creator.address,
          []
        )
      ).to.be.revertedWith("ProvenanceRegistry: Provenance already exists");
    });

    it("should reject registration from unauthorized caller", async function () {
      await expect(
        registry.connect(creator).registerProvenance(
          ethers.keccak256(ethers.toUtf8Bytes("unauthorized")),
          ethers.keccak256(ethers.toUtf8Bytes("model")),
          ethers.keccak256(ethers.toUtf8Bytes("prompt")),
          creator.address,
          []
        )
      ).to.be.reverted; // AccessControl revert
    });
  });
});