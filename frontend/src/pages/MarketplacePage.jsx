import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet.jsx'
import { useContracts } from '../hooks/useContracts.jsx'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const CONTENT_TYPES = ['ALL', 'IMAGE', 'TEXT', 'MUSIC']
const SORT_OPTIONS = [
  { value: 'recent', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' }
]

function MarketplacePage() {
  const { address, isConnected } = useWallet()
  const { buyNFT, isReady: contractsReady, loading: contractsLoading } = useContracts()
  const [nfts, setNfts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [purchasing, setPurchasing] = useState(null)
  const [filters, setFilters] = useState({
    contentType: 'ALL',
    minPrice: '',
    maxPrice: '',
    creator: '',
    sort: 'recent',
    search: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    total: 0,
    totalPages: 1
  })

  useEffect(() => {
    fetchNFTs()
  }, [filters, pagination.page])

  async function fetchNFTs() {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.pageSize.toString(),
        sort: filters.sort
      })

      if (filters.contentType !== 'ALL') {
        params.append('content_type', filters.contentType)
      }
      if (filters.minPrice) {
        params.append('min_price', filters.minPrice)
      }
      if (filters.maxPrice) {
        params.append('max_price', filters.maxPrice)
      }
      if (filters.creator) {
        params.append('creator', filters.creator)
      }
      if (filters.search) {
        params.append('search', filters.search)
      }

      const response = await axios.get(`${API_BASE}/api/marketplace/listings?${params}`)
      setNfts(response.data.items || [])
      setPagination(prev => ({
        ...prev,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 1
      }))
    } catch (err) {
      console.error('Error fetching NFTs:', err)
      setError('Failed to load NFTs')
    } finally {
      setLoading(false)
    }
  }

  function handleFilterChange(field, value) {
    setFilters(prev => ({ ...prev, [field]: value }))
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
  }

  function handlePageChange(newPage) {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  async function handlePurchase(tokenId, price) {
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }

    setPurchasing(tokenId)

    try {
      if (contractsReady) {
        await buyNFT(tokenId, price)
        alert(`Successfully purchased NFT #${tokenId}!`)
        fetchNFTs() // Refresh the list
      } else {
        alert('Please connect to a network with deployed contracts to purchase NFTs')
      }
    } catch (err) {
      console.error('Purchase error:', err)
      alert('Failed to purchase NFT: ' + (err.message || 'Unknown error'))
    } finally {
      setPurchasing(null)
    }
  }

  const totalPages = pagination.totalPages

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>NFT Marketplace</h1>
        <div style={{ color: '#888' }}>
          {pagination.total} NFTs available
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Filters</h3>
        
        {/* Search Bar */}
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Search NFTs by name, creator, or description..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary" onClick={fetchNFTs}>
              🔍 Search
            </button>
          </div>
        </div>
        
        <div className="grid grid-2" style={{ gap: '1rem' }}>
          <div className="form-group">
            <label>Content Type</label>
            <select
              value={filters.contentType}
              onChange={(e) => handleFilterChange('contentType', e.target.value)}
            >
              {CONTENT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Sort By</label>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Min Price (ETH)</label>
            <input
              type="number"
              step="0.001"
              placeholder="0.0"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Max Price (ETH)</label>
            <input
              type="number"
              step="0.001"
              placeholder="10.0"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Creator Address</label>
            <input
              type="text"
              placeholder="0x..."
              value={filters.creator}
              onChange={(e) => handleFilterChange('creator', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && <div className="error">{error}</div>}

      {/* Loading State */}
      {loading && (
        <div className="loading">
          <div>Loading NFTs...</div>
        </div>
      )}

      {/* NFT Grid */}
      {!loading && !error && (
        <>
          {nfts.length > 0 ? (
            <div className="grid grid-3">
              {nfts.map((nft) => (
                <div key={nft.token_id} className="nft-card">
                  <Link to={`/nft/${nft.token_id}`}>
                    <img 
                      src={nft.image || '/placeholder-image.svg'} 
                      alt={nft.name}
                      className="nft-image"
                      onError={(e) => {
                        e.target.src = '/placeholder-image.svg'
                      }}
                    />
                  </Link>
                  
                  <div className="nft-info">
                    <Link to={`/nft/${nft.token_id}`} style={{ textDecoration: 'none' }}>
                      <div className="nft-title">{nft.name}</div>
                    </Link>
                    
                    <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      by {nft.creator_address?.slice(0, 6)}...{nft.creator_address?.slice(-4)}
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ color: '#888', fontSize: '0.8rem' }}>
                        {nft.content_type}
                      </span>
                      {nft.price && (
                        <span className="nft-price">
                          {nft.price} ETH
                        </span>
                      )}
                    </div>

                    <div style={{ color: '#888', fontSize: '0.8rem', marginBottom: '1rem' }}>
                      Model: {nft.model_version}
                    </div>

                    {nft.is_listed && (
                      <button 
                        className="btn btn-primary" 
                        onClick={(e) => {
                          e.preventDefault()
                          handlePurchase(nft.token_id, nft.price)
                        }}
                        disabled={purchasing === nft.token_id}
                        style={{ width: '100%' }}
                      >
                        {purchasing === nft.token_id ? '⏳ Processing...' : `Buy for ${nft.price} ETH`}
                      </button>
                    )}
                    
                    {!nft.is_listed && (
                      <div style={{ 
                        textAlign: 'center', 
                        color: '#888', 
                        fontSize: '0.9rem',
                        padding: '0.5rem'
                      }}>
                        Not for sale
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>
              <h3>No NFTs found</h3>
              <p>Try adjusting your filters or <Link to="/generate">create the first NFT</Link>!</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              gap: '1rem',
              marginTop: '2rem'
            }}>
              <button 
                className="btn" 
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </button>
              
              <span style={{ color: '#888' }}>
                Page {pagination.page} of {totalPages}
              </span>
              
              <button 
                className="btn" 
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default MarketplacePage