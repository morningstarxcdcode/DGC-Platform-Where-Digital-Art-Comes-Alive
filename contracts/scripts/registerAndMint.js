// scripts/registerAndMint.js
const { ethers, network } = require('hardhat')

async function main() {
  const [deployer, recipient, collaborator] = await ethers.getSigners()
  const deployments = require('../deployments/localhost.json')
  const provenanceAddress = deployments.contracts.ProvenanceRegistry
  const dgcAddress = deployments.contracts.DGCToken

  const Prov = await ethers.getContractFactory('ProvenanceRegistry')
  const prov = await Prov.attach(provenanceAddress)

  const DGC = await ethers.getContractFactory('DGCToken')
  const dgc = await DGC.attach(dgcAddress)

  // Create modelHash and promptHash
  const modelHash = ethers.keccak256(ethers.toUtf8Bytes('sd-xl-1.0'))
  const promptHash = ethers.keccak256(ethers.toUtf8Bytes('A serene mountain lake at dawn'))

  // Compute provenance hash (must match registry logic if any)
  const provenanceHash = ethers.keccak256(ethers.toUtf8Bytes('test-provenance-' + Date.now()))

  console.log('Registering provenance...')
  const tx = await prov.connect(deployer).registerProvenance(provenanceHash, modelHash, promptHash, deployer.address, [collaborator.address])
  await tx.wait()
  console.log('Provenance registered:', provenanceHash)

  console.log('Minting token...')
  const tokenURI = 'Qmb94d27b9934d3e08a52e52d7da7dabfac484efe37a53'
  const mintTx = await dgc.connect(deployer).mint(recipient.address, tokenURI, provenanceHash)
  const mintReceipt = await mintTx.wait()
  console.log('Mint tx receipt logs length:', mintReceipt.logs ? mintReceipt.logs.length : 0)

  // Fallback: check totalSupply to infer minted token id
  const supply = await dgc.totalSupply()
  console.log('Total supply after mint:', supply.toString())
  const mintedTokenId = supply
  console.log('Minted tokenId (inferred):', mintedTokenId.toString())
}

main().catch(err => { console.error(err); process.exit(1) })