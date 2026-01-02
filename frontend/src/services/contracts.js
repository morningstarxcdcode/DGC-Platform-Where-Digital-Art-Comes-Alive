import { ethers } from 'ethers'

// Contract ABIs (simplified versions - in production these would be imported from compiled contracts)
export const DGCTokenABI = [
  // ERC721 standard
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
  "function approve(address to, uint256 tokenId)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function setApprovalForAll(address operator, bool approved)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  // Custom functions
  "function mint(address to, string memory tokenURI, bytes32 provenanceHash) returns (uint256)",
  "function getProvenance(uint256 tokenId) view returns (bytes32)",
  "function totalSupply() view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
]

export const ProvenanceRegistryABI = [
  "function registerProvenance(bytes32 contentHash, bytes32 modelHash, bytes32 promptHash, uint256[] parentTokens) returns (bytes32)",
  "function getProvenance(bytes32 provenanceHash) view returns (tuple(bytes32 contentHash, bytes32 modelHash, bytes32 promptHash, uint256[] parentTokens, uint256 timestamp, address creator))",
  "function verifyProvenance(bytes32 provenanceHash) view returns (bool)",
  "event ProvenanceRegistered(bytes32 indexed provenanceHash, address indexed creator)",
]

export const MarketplaceABI = [
  "function listItem(address nftContract, uint256 tokenId, uint256 price)",
  "function cancelListing(address nftContract, uint256 tokenId)",
  "function buyItem(address nftContract, uint256 tokenId) payable",
  "function getListing(address nftContract, uint256 tokenId) view returns (tuple(address seller, uint256 price, bool isActive))",
  "function getListingFee() view returns (uint256)",
  "event ItemListed(address indexed nftContract, uint256 indexed tokenId, address indexed seller, uint256 price)",
  "event ItemSold(address indexed nftContract, uint256 indexed tokenId, address indexed buyer, uint256 price)",
  "event ItemCancelled(address indexed nftContract, uint256 indexed tokenId)",
]

export const RoyaltySplitterABI = [
  "function setRoyalty(uint256 tokenId, address[] memory recipients, uint256[] memory shares)",
  "function getRoyalty(uint256 tokenId) view returns (tuple(address[] recipients, uint256[] shares, uint256 royaltyBps))",
  "function distributeRoyalty(uint256 tokenId) payable",
  "event RoyaltySet(uint256 indexed tokenId, uint256 royaltyBps)",
  "event RoyaltyDistributed(uint256 indexed tokenId, uint256 amount)",
]

// Contract class for interacting with DGC contracts
export class DGCContracts {
  constructor(provider, signer, addresses) {
    this.provider = provider
    this.signer = signer
    this.addresses = addresses
    
    // Initialize contract instances
    if (addresses.DGCToken) {
      this.dgcToken = new ethers.Contract(addresses.DGCToken, DGCTokenABI, signer || provider)
    }
    if (addresses.ProvenanceRegistry) {
      this.provenanceRegistry = new ethers.Contract(addresses.ProvenanceRegistry, ProvenanceRegistryABI, signer || provider)
    }
    if (addresses.Marketplace) {
      this.marketplace = new ethers.Contract(addresses.Marketplace, MarketplaceABI, signer || provider)
    }
    if (addresses.RoyaltySplitter) {
      this.royaltySplitter = new ethers.Contract(addresses.RoyaltySplitter, RoyaltySplitterABI, signer || provider)
    }
  }

  // NFT Operations
  async mintNFT(tokenURI, provenanceHash) {
    if (!this.dgcToken || !this.signer) {
      throw new Error('Contract or signer not available')
    }
    
    const address = await this.signer.getAddress()
    const tx = await this.dgcToken.mint(address, tokenURI, provenanceHash)
    const receipt = await tx.wait()
    
    // Get the token ID from the Transfer event
    const transferEvent = receipt.logs.find(
      log => log.topics[0] === ethers.id('Transfer(address,address,uint256)')
    )
    
    if (transferEvent) {
      return ethers.getBigInt(transferEvent.topics[3])
    }
    
    throw new Error('Failed to get token ID from mint transaction')
  }

  async getTokenURI(tokenId) {
    if (!this.dgcToken) throw new Error('DGC Token contract not available')
    return await this.dgcToken.tokenURI(tokenId)
  }

  async ownerOf(tokenId) {
    if (!this.dgcToken) throw new Error('DGC Token contract not available')
    return await this.dgcToken.ownerOf(tokenId)
  }

  async balanceOf(address) {
    if (!this.dgcToken) throw new Error('DGC Token contract not available')
    return await this.dgcToken.balanceOf(address)
  }

  // Provenance Operations
  async registerProvenance(contentHash, modelHash, promptHash, parentTokens = []) {
    if (!this.provenanceRegistry || !this.signer) {
      throw new Error('Contract or signer not available')
    }
    
    const tx = await this.provenanceRegistry.registerProvenance(
      contentHash,
      modelHash,
      promptHash,
      parentTokens
    )
    const receipt = await tx.wait()
    
    // Get provenance hash from event
    const event = receipt.logs.find(
      log => log.topics[0] === ethers.id('ProvenanceRegistered(bytes32,address)')
    )
    
    if (event) {
      return event.topics[1]
    }
    
    throw new Error('Failed to get provenance hash')
  }

  async getProvenance(provenanceHash) {
    if (!this.provenanceRegistry) throw new Error('Provenance Registry not available')
    return await this.provenanceRegistry.getProvenance(provenanceHash)
  }

  // Marketplace Operations
  async listItem(tokenId, priceInEth) {
    if (!this.marketplace || !this.dgcToken || !this.signer) {
      throw new Error('Contracts or signer not available')
    }
    
    // Approve marketplace to transfer the token
    const approveTx = await this.dgcToken.approve(this.addresses.Marketplace, tokenId)
    await approveTx.wait()
    
    // List the item
    const priceInWei = ethers.parseEther(priceInEth.toString())
    const listTx = await this.marketplace.listItem(this.addresses.DGCToken, tokenId, priceInWei)
    return await listTx.wait()
  }

  async cancelListing(tokenId) {
    if (!this.marketplace || !this.signer) {
      throw new Error('Contract or signer not available')
    }
    
    const tx = await this.marketplace.cancelListing(this.addresses.DGCToken, tokenId)
    return await tx.wait()
  }

  async buyItem(tokenId, priceInEth) {
    if (!this.marketplace || !this.signer) {
      throw new Error('Contract or signer not available')
    }
    
    const priceInWei = ethers.parseEther(priceInEth.toString())
    const tx = await this.marketplace.buyItem(this.addresses.DGCToken, tokenId, {
      value: priceInWei
    })
    return await tx.wait()
  }

  async getListing(tokenId) {
    if (!this.marketplace) throw new Error('Marketplace contract not available')
    return await this.marketplace.getListing(this.addresses.DGCToken, tokenId)
  }

  // Royalty Operations
  async setRoyalty(tokenId, recipients, shares) {
    if (!this.royaltySplitter || !this.signer) {
      throw new Error('Contract or signer not available')
    }
    
    const tx = await this.royaltySplitter.setRoyalty(tokenId, recipients, shares)
    return await tx.wait()
  }

  async getRoyalty(tokenId) {
    if (!this.royaltySplitter) throw new Error('Royalty Splitter not available')
    return await this.royaltySplitter.getRoyalty(tokenId)
  }
}

// Helper to create hash from string
export function createHash(data) {
  return ethers.keccak256(ethers.toUtf8Bytes(data))
}

// Helper to format ETH
export function formatEth(weiAmount) {
  return ethers.formatEther(weiAmount)
}

// Helper to parse ETH
export function parseEth(ethAmount) {
  return ethers.parseEther(ethAmount.toString())
}

export default DGCContracts
