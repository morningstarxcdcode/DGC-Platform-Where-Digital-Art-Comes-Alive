import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { useWallet } from './useWallet.jsx'
import DGCContracts, { createHash, formatEth, parseEth } from '../services/contracts.js'

export function useContracts() {
  const { address, isConnected, contractAddresses, isCorrectNetwork } = useWallet()
  const [contracts, setContracts] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Initialize contracts when wallet connects
  useEffect(() => {
    async function initContracts() {
      if (!isConnected || !isCorrectNetwork || !window.ethereum) {
        setContracts(null)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()

        const dgcContracts = new DGCContracts(provider, signer, contractAddresses)
        setContracts(dgcContracts)
      } catch (err) {
        console.error('Error initializing contracts:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    initContracts()
  }, [isConnected, isCorrectNetwork, contractAddresses])

  // Mint NFT
  const mintNFT = useCallback(async (tokenURI, provenance) => {
    if (!contracts) throw new Error('Contracts not initialized')
    
    setLoading(true)
    setError(null)

    try {
      // Create provenance hash
      const provenanceHash = createHash(JSON.stringify(provenance))
      
      // Mint the NFT
      const tokenId = await contracts.mintNFT(tokenURI, provenanceHash)
      
      return { tokenId, provenanceHash }
    } catch (err) {
      console.error('Minting error:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [contracts])

  // List NFT for sale
  const listForSale = useCallback(async (tokenId, priceInEth) => {
    if (!contracts) throw new Error('Contracts not initialized')
    
    setLoading(true)
    setError(null)

    try {
      const receipt = await contracts.listItem(tokenId, priceInEth)
      return receipt
    } catch (err) {
      console.error('Listing error:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [contracts])

  // Cancel listing
  const cancelListing = useCallback(async (tokenId) => {
    if (!contracts) throw new Error('Contracts not initialized')
    
    setLoading(true)
    setError(null)

    try {
      const receipt = await contracts.cancelListing(tokenId)
      return receipt
    } catch (err) {
      console.error('Cancel listing error:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [contracts])

  // Buy NFT
  const buyNFT = useCallback(async (tokenId, priceInEth) => {
    if (!contracts) throw new Error('Contracts not initialized')
    
    setLoading(true)
    setError(null)

    try {
      const receipt = await contracts.buyItem(tokenId, priceInEth)
      return receipt
    } catch (err) {
      console.error('Purchase error:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [contracts])

  // Get NFT owner
  const getOwner = useCallback(async (tokenId) => {
    if (!contracts) throw new Error('Contracts not initialized')
    return await contracts.ownerOf(tokenId)
  }, [contracts])

  // Get listing info
  const getListing = useCallback(async (tokenId) => {
    if (!contracts) throw new Error('Contracts not initialized')
    return await contracts.getListing(tokenId)
  }, [contracts])

  // Get user's NFT balance
  const getBalance = useCallback(async (address) => {
    if (!contracts) throw new Error('Contracts not initialized')
    return await contracts.balanceOf(address)
  }, [contracts])

  // Register provenance
  const registerProvenance = useCallback(async (contentHash, modelHash, promptHash, parentTokens = []) => {
    if (!contracts) throw new Error('Contracts not initialized')
    
    setLoading(true)
    setError(null)

    try {
      const provenanceHash = await contracts.registerProvenance(
        contentHash,
        modelHash,
        promptHash,
        parentTokens
      )
      return provenanceHash
    } catch (err) {
      console.error('Provenance registration error:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [contracts])

  // Set royalties
  const setRoyalty = useCallback(async (tokenId, recipients, shares) => {
    if (!contracts) throw new Error('Contracts not initialized')
    
    setLoading(true)
    setError(null)

    try {
      const receipt = await contracts.setRoyalty(tokenId, recipients, shares)
      return receipt
    } catch (err) {
      console.error('Royalty setting error:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [contracts])

  return {
    contracts,
    loading,
    error,
    isReady: !!contracts && isConnected && isCorrectNetwork,
    // NFT Operations
    mintNFT,
    getOwner,
    getBalance,
    // Marketplace Operations
    listForSale,
    cancelListing,
    buyNFT,
    getListing,
    // Provenance Operations
    registerProvenance,
    // Royalty Operations
    setRoyalty,
    // Utilities
    createHash,
    formatEth,
    parseEth
  }
}

export default useContracts
