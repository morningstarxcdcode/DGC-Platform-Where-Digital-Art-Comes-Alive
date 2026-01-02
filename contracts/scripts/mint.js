// scripts/mint.js
// Simple mint script to mint a DGC token to a recipient

const { ethers, network } = require('hardhat')

async function main() {
  console.log('Network:', network.name)
  const [deployer, recipient] = await ethers.getSigners()

  const deployments = require('../deployments/localhost.json')
  const dgcAddress = deployments.contracts.DGCToken

  const DGC = await ethers.getContractFactory('DGCToken')
  const dgc = await DGC.attach(dgcAddress)

  const tokenURI = 'ipfs://Qmb94d27b9934d3e08a52e52d7da7dabfac484efe37a53'
  console.log(`Minting token to ${recipient.address} with tokenURI ${tokenURI}`)

  const tx = await dgc.connect(deployer).mint(recipient.address, tokenURI, ethers.ZeroHash)
  const receipt = await tx.wait()
  console.log('Mint tx hash:', receipt.transactionHash)

  // Parse Transfer event
  const transferEvent = receipt.logs.find(l => l.topics[0] === ethers.id('Transfer(address,address,uint256)'))
  if (transferEvent) {
    const tokenId = BigInt(transferEvent.topics[3]).toString()
    console.log('Minted tokenId:', tokenId)
  } else {
    console.log('Transfer event not found in receipt')
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})