import { createContext, useContext, useState, useEffect } from 'react'
import { ethers } from 'ethers'

// Contract addresses - these would come from environment variables in production
const CONTRACT_ADDRESSES = {
  DGCToken: import.meta.env.VITE_DGC_TOKEN_ADDRESS || '',
  ProvenanceRegistry: import.meta.env.VITE_PROVENANCE_REGISTRY_ADDRESS || '',
  RoyaltySplitter: import.meta.env.VITE_ROYALTY_SPLITTER_ADDRESS || '',
  Marketplace: import.meta.env.VITE_MARKETPLACE_ADDRESS || '',
}

// Network configurations
const NETWORKS = {
  localhost: {
    chainId: 31337,
    name: 'Localhost',
    rpcUrl: 'http://localhost:8545',
    currency: 'ETH',
    blockExplorer: 'http://localhost:8545'
  },
  sepolia: {
    chainId: 11155111,
    name: 'Sepolia',
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    currency: 'ETH',
    blockExplorer: 'https://sepolia.etherscan.io'
  },
  mainnet: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
    currency: 'ETH',
    blockExplorer: 'https://etherscan.io'
  }
}

// Common ERC-20 tokens for real data fetching
const COMMON_TOKENS = {
  1: [ // Mainnet
    { address: '0xA0b86a33E6441b8435b662303c0f098C8c8c0b8b', symbol: 'USDC', decimals: 6, name: 'USD Coin' },
    { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', decimals: 6, name: 'Tether USD' },
    { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', symbol: 'WBTC', decimals: 8, name: 'Wrapped BTC' },
  ],
  11155111: [ // Sepolia
    { address: '0x779877A7B0D9E8603169DdbD7836e478b4624789', symbol: 'LINK', decimals: 18, name: 'Chainlink Token' },
  ],
  31337: [] // Localhost - no predefined tokens
}

const WalletContext = createContext()

export function WalletProvider({ children }) {
  const [state, setState] = useState({
    address: null,
    isConnected: false,
    chainId: null,
    balance: null,
    balanceUSD: null,
    isConnecting: false,
    isAvailable: false,
    isCorrectNetwork: false,
    targetNetwork: getTargetNetwork(),
    error: null,
    isAutoWallet: false,
    autoWalletCreated: false,
    provider: null,
    signer: null,
    networkName: '',
    gasPrice: '0',
    blockNumber: 0,
    tokens: [],
    nfts: [],
    transactions: [],
    isLoadingData: false
  })

  function getTargetNetwork() {
    const env = import.meta.env.VITE_NETWORK || 'localhost'
    return NETWORKS[env]?.chainId || 31337
  }

  // Fetch real ETH price from API
  async function fetchETHPrice() {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
      const data = await response.json()
      return data.ethereum?.usd || 0
    } catch (error) {
      console.error('Error fetching ETH price:', error)
      return 0
    }
  }

  // Fetch real token balances
  async function fetchTokenBalances(address, provider, chainId) {
    const tokens = COMMON_TOKENS[chainId] || []
    const tokenBalances = []

    for (const token of tokens) {
      try {
        const contract = new ethers.Contract(
          token.address,
          ['function balanceOf(address) view returns (uint256)', 'function symbol() view returns (string)', 'function decimals() view returns (uint8)'],
          provider
        )
        
        const balance = await contract.balanceOf(address)
        const formattedBalance = ethers.formatUnits(balance, token.decimals)
        
        if (parseFloat(formattedBalance) > 0) {
          tokenBalances.push({
            ...token,
            balance: formattedBalance,
            balanceWei: balance.toString()
          })
        }
      } catch (error) {
        console.error(`Error fetching balance for ${token.symbol}:`, error)
      }
    }

    return tokenBalances
  }

  // Fetch real NFTs (ERC-721 tokens)
  async function fetchNFTs(address, provider, chainId) {
    try {
      // For mainnet, we could use services like Alchemy or Moralis
      // For now, we'll check our own DGC tokens if deployed
      const nfts = []
      
      if (CONTRACT_ADDRESSES.DGCToken) {
        try {
          const contract = new ethers.Contract(
            CONTRACT_ADDRESSES.DGCToken,
            [
              'function balanceOf(address) view returns (uint256)',
              'function tokenOfOwnerByIndex(address, uint256) view returns (uint256)',
              'function tokenURI(uint256) view returns (string)'
            ],
            provider
          )
          
          const balance = await contract.balanceOf(address)
          const tokenCount = parseInt(balance.toString())
          
          for (let i = 0; i < Math.min(tokenCount, 10); i++) { // Limit to 10 NFTs
            try {
              const tokenId = await contract.tokenOfOwnerByIndex(address, i)
              const tokenURI = await contract.tokenURI(tokenId)
              
              nfts.push({
                tokenId: tokenId.toString(),
                contract: CONTRACT_ADDRESSES.DGCToken,
                tokenURI,
                name: `DGC Token #${tokenId}`,
                collection: 'DGC Living NFTs'
              })
            } catch (error) {
              console.error(`Error fetching NFT ${i}:`, error)
            }
          }
        } catch (error) {
          console.error('Error fetching DGC NFTs:', error)
        }
      }
      
      return nfts
    } catch (error) {
      console.error('Error fetching NFTs:', error)
      return []
    }
  }

  // Fetch real transaction history
  async function fetchTransactions(address, provider) {
    try {
      const transactions = []
      const currentBlock = await provider.getBlockNumber()
      
      // Fetch last 10 blocks for recent transactions
      for (let i = 0; i < 10; i++) {
        try {
          const blockNumber = currentBlock - i
          const block = await provider.getBlock(blockNumber, true)
          
          if (block && block.transactions) {
            for (const tx of block.transactions.slice(0, 5)) { // Limit per block
              if (tx.from?.toLowerCase() === address.toLowerCase() || 
                  tx.to?.toLowerCase() === address.toLowerCase()) {
                
                const receipt = await provider.getTransactionReceipt(tx.hash)
                
                transactions.push({
                  hash: tx.hash,
                  from: tx.from,
                  to: tx.to,
                  value: ethers.formatEther(tx.value || '0'),
                  gasUsed: receipt?.gasUsed?.toString() || '0',
                  gasPrice: ethers.formatUnits(tx.gasPrice || '0', 'gwei'),
                  blockNumber: tx.blockNumber,
                  timestamp: block.timestamp,
                  status: receipt?.status === 1 ? 'success' : 'failed',
                  type: tx.from?.toLowerCase() === address.toLowerCase() ? 'sent' : 'received'
                })
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching block ${currentBlock - i}:`, error)
        }
      }
      
      return transactions.slice(0, 20) // Return last 20 transactions
    } catch (error) {
      console.error('Error fetching transactions:', error)
      return []
    }
  }

  // Fetch real blockchain data
  async function fetchBlockchainData(provider, chainId) {
    try {
      const [gasPrice, blockNumber] = await Promise.all([
        provider.getFeeData().then(fees => ethers.formatUnits(fees.gasPrice || '0', 'gwei')),
        provider.getBlockNumber()
      ])

      const networkName = Object.values(NETWORKS).find(n => n.chainId === chainId)?.name || 'Unknown'

      setState(prev => ({
        ...prev,
        gasPrice,
        blockNumber,
        networkName
      }))
    } catch (error) {
      console.error('Error fetching blockchain data:', error)
    }
  }

  // Update all wallet data
  async function updateWalletData(address, provider, chainId) {
    if (!address || !provider) return

    setState(prev => ({ ...prev, isLoadingData: true }))

    try {
      // Fetch balance and convert to USD
      const balance = await provider.getBalance(address)
      const ethBalance = ethers.formatEther(balance)
      const ethPrice = await fetchETHPrice()
      const balanceUSD = (parseFloat(ethBalance) * ethPrice).toFixed(2)

      // Fetch all data in parallel
      const [tokens, nfts, transactions] = await Promise.all([
        fetchTokenBalances(address, provider, chainId),
        fetchNFTs(address, provider, chainId),
        fetchTransactions(address, provider)
      ])

      // Fetch blockchain data
      await fetchBlockchainData(provider, chainId)

      setState(prev => ({
        ...prev,
        balance: ethBalance,
        balanceUSD,
        tokens,
        nfts,
        transactions,
        isLoadingData: false
      }))
    } catch (error) {
      console.error('Error updating wallet data:', error)
      setState(prev => ({ ...prev, isLoadingData: false, error: error.message }))
    }
  }

  // Auto-wallet creation functions
  async function createAutoWallet() {
    try {
      // Check if auto-wallet already exists in localStorage
      const existingWallet = localStorage.getItem('dgc_auto_wallet')
      
      if (existingWallet) {
        const walletData = JSON.parse(existingWallet)
        return await loadAutoWallet(walletData)
      }

      // Create new auto-wallet
      const wallet = ethers.Wallet.createRandom()
      const walletData = {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic?.phrase,
        createdAt: Date.now()
      }

      // Store encrypted wallet data (in production, use proper encryption)
      localStorage.setItem('dgc_auto_wallet', JSON.stringify(walletData))
      
      return await loadAutoWallet(walletData)
    } catch (error) {
      console.error('Error creating auto-wallet:', error)
      setState(prev => ({ ...prev, error: 'Failed to create auto-wallet' }))
      return null
    }
  }

  async function loadAutoWallet(walletData) {
    try {
      // Create provider for the target network
      const rpcUrl = NETWORKS[import.meta.env.VITE_NETWORK || 'localhost']?.rpcUrl || 'http://localhost:8545'
      const provider = new ethers.JsonRpcProvider(rpcUrl)
      
      // Create wallet instance
      const wallet = new ethers.Wallet(walletData.privateKey, provider)
      
      setState(prev => ({
        ...prev,
        address: wallet.address,
        isConnected: true,
        isAutoWallet: true,
        autoWalletCreated: true,
        provider: provider,
        signer: wallet,
        chainId: prev.targetNetwork,
        isCorrectNetwork: true,
        error: null
      }))

      await updateWalletData(wallet.address, provider, prev.targetNetwork)
      return wallet
    } catch (error) {
      console.error('Error loading auto-wallet:', error)
      setState(prev => ({ ...prev, error: 'Failed to load auto-wallet' }))
      return null
    }
  }

  async function exportWallet() {
    const walletData = localStorage.getItem('dgc_auto_wallet')
    if (!walletData) {
      throw new Error('No auto-wallet found')
    }

    const wallet = JSON.parse(walletData)
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic
    }
  }

  async function connectToMetaMask() {
    if (!window.ethereum) {
      setState(prev => ({ ...prev, error: 'MetaMask not detected. Using auto-wallet instead.' }))
      return await createAutoWallet()
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }))

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const chainId = await provider.getNetwork().then(n => Number(n.chainId))

      setState(prev => ({
        ...prev,
        address: accounts[0],
        isConnected: true,
        chainId,
        isCorrectNetwork: chainId === prev.targetNetwork,
        isConnecting: false,
        isAutoWallet: false,
        provider: provider,
        signer: signer,
        error: null
      }))

      await updateWalletData(accounts[0], provider, chainId)
      return signer
    } catch (error) {
      console.error('Error connecting to MetaMask:', error)
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message
      }))
      
      // Fallback to auto-wallet if MetaMask fails
      return await createAutoWallet()
    }
  }

  // Check if MetaMask is available and auto-create wallet
  useEffect(() => {
    const initializeWallet = async () => {
      const isAvailable = typeof window !== 'undefined' && window.ethereum
      setState(prev => ({ ...prev, isAvailable }))
      
      // Always create/load auto-wallet for seamless experience
      await createAutoWallet()
      
      // Listen for MetaMask events if available
      if (window.ethereum) {
        window.ethereum.on('accountsChanged', handleAccountsChanged)
        window.ethereum.on('chainChanged', handleChainChanged)
        
        // Check if already connected to MetaMask
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          // User prefers MetaMask, switch to it
          await connectToMetaMask()
        }
      }
    }

    initializeWallet()

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  async function connect() {
    // Try MetaMask first, fallback to auto-wallet
    return await connectToMetaMask()
  }

  function disconnect() {
    setState(prev => ({
      ...prev,
      address: null,
      isConnected: false,
      chainId: null,
      balance: null,
      isAutoWallet: false,
      provider: null,
      signer: null,
      error: null
    }))
  }

  async function switchNetwork(chainId) {
    if (state.isAutoWallet) {
      // For auto-wallet, just switch the provider
      const networkKey = Object.keys(NETWORKS).find(key => NETWORKS[key].chainId === chainId)
      if (networkKey) {
        const rpcUrl = NETWORKS[networkKey].rpcUrl
        const provider = new ethers.JsonRpcProvider(rpcUrl)
        const walletData = JSON.parse(localStorage.getItem('dgc_auto_wallet'))
        const wallet = new ethers.Wallet(walletData.privateKey, provider)
        
        setState(prev => ({
          ...prev,
          chainId,
          isCorrectNetwork: chainId === prev.targetNetwork,
          provider: provider,
          signer: wallet
        }))
      }
      return
    }

    // For MetaMask
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      })
    } catch (error) {
      console.error('Error switching network:', error)
      setState(prev => ({ ...prev, error: error.message }))
    }
  }

  async function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      // User disconnected MetaMask, fallback to auto-wallet
      await createAutoWallet()
    } else {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const chainId = await provider.getNetwork().then(n => Number(n.chainId))
      
      setState(prev => ({
        ...prev,
        address: accounts[0],
        isConnected: true,
        isAutoWallet: false,
        provider: provider,
        signer: signer,
        chainId
      }))
      
      await updateWalletData(accounts[0], provider, chainId)
    }
  }

  function handleChainChanged(chainId) {
    const numericChainId = parseInt(chainId, 16)
    setState(prev => ({
      ...prev,
      chainId: numericChainId,
      isCorrectNetwork: numericChainId === prev.targetNetwork
    }))
    
    // Refresh data for new network
    if (state.address && state.provider) {
      updateWalletData(state.address, state.provider, numericChainId)
    }
  }

  // Remove the old updateBalance function as it's replaced by updateWalletData

  // Helper function to get signer for transactions
  async function getSigner() {
    if (state.signer) {
      return state.signer
    }
    
    if (state.isAutoWallet) {
      const walletData = JSON.parse(localStorage.getItem('dgc_auto_wallet'))
      const provider = state.provider || new ethers.JsonRpcProvider('http://localhost:8545')
      return new ethers.Wallet(walletData.privateKey, provider)
    }
    
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum)
      return await provider.getSigner()
    }
    
    throw new Error('No signer available')
  }

  // Refresh wallet data
  async function refreshData() {
    if (state.address && state.provider && state.chainId) {
      await updateWalletData(state.address, state.provider, state.chainId)
    }
  }

  // Set up real-time data updates
  useEffect(() => {
    if (!state.provider || !state.address) return

    const interval = setInterval(() => {
      refreshData()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [state.provider, state.address, state.chainId])

  const value = {
    ...state,
    connect,
    disconnect,
    switchNetwork,
    createAutoWallet,
    exportWallet,
    getSigner,
    refreshData,
    contractAddresses: CONTRACT_ADDRESSES,
    networks: NETWORKS,
    // Convenience getters
    isConnected: state.isConnected,
    account: state.address,
    balance: state.balance,
    balanceUSD: state.balanceUSD,
    chainId: state.chainId,
    networkName: state.networkName,
    gasPrice: state.gasPrice,
    blockNumber: state.blockNumber,
    tokens: state.tokens,
    nfts: state.nfts,
    transactions: state.transactions,
    isLoadingData: state.isLoadingData,
    provider: state.provider,
    signer: state.signer
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}