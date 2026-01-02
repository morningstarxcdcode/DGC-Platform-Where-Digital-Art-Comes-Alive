/**
 * Marketplace Page - Premium Professional Design
 * Author: Sourav Rajak (morningstarxcdcode)
 * Version: 2.0.0
 */

import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet.jsx'
import { useContracts } from '../hooks/useContracts.jsx'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const CONTENT_TYPES = [
  { value: 'ALL', label: 'All Types', icon: '🎨' },
  { value: 'IMAGE', label: 'Images', icon: '🖼️' },
  { value: 'TEXT', label: 'Text', icon: '📝' },
  { value: 'MUSIC', label: 'Music', icon: '🎵' },
  { value: '3D', label: '3D Models', icon: '🎮' }
]

const SORT_OPTIONS = [
  { value: 'recent', label: 'Recently Listed', icon: '🕐' },
  { value: 'oldest', label: 'Oldest First', icon: '📅' },
  { value: 'price_low', label: 'Price: Low → High', icon: '📈' },
  { value: 'price_high', label: 'Price: High → Low', icon: '📉' },
  { value: 'popular', label: 'Most Popular', icon: '🔥' }
]

export default function MarketplacePage() {
  const { address, isConnected } = useWallet()
  const { buyNFT, isReady: contractsReady, loading: contractsLoading } = useContracts()
  const [nfts, setNfts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [purchasing, setPurchasing] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // grid | list
  const [showFilters, setShowFilters] = useState(true)
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
      if (filters.minPrice) params.append('min_price', filters.minPrice)
      if (filters.maxPrice) params.append('max_price', filters.maxPrice)
      if (filters.creator) params.append('creator', filters.creator)
      if (filters.search) params.append('search', filters.search)

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
      // Demo NFTs
      setNfts([
        { tokenId: '1', name: 'Cosmic Voyage', creator: '0x1234...5678', price: '2.5', contentType: 'IMAGE' },
        { tokenId: '2', name: 'Neural Dreams', creator: '0x8765...4321', price: '1.8', contentType: 'IMAGE' },
        { tokenId: '3', name: 'Digital Essence', creator: '0xabcd...efgh', price: '3.2', contentType: 'IMAGE' },
        { tokenId: '4', name: 'Quantum Art', creator: '0x9999...1111', price: '4.0', contentType: 'IMAGE' },
        { tokenId: '5', name: 'Ethereal Flow', creator: '0x2222...3333', price: '1.5', contentType: 'IMAGE' },
        { tokenId: '6', name: 'Abstract Mind', creator: '0x4444...5555', price: '2.8', contentType: 'IMAGE' },
        { tokenId: '7', name: 'Neon Genesis', creator: '0x6666...7777', price: '3.5', contentType: 'IMAGE' },
        { tokenId: '8', name: 'Cyber Dreams', creator: '0x8888...9999', price: '2.2', contentType: 'IMAGE' },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleFilterChange(field, value) {
    setFilters(prev => ({ ...prev, [field]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  function clearFilters() {
    setFilters({
      contentType: 'ALL',
      minPrice: '',
      maxPrice: '',
      creator: '',
      sort: 'recent',
      search: ''
    })
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
        fetchNFTs()
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

  const activeFilterCount = Object.values(filters).filter(v => v && v !== 'ALL' && v !== 'recent').length

  return (
    <div className="marketplace-page">
      {/* Page Header */}
      <section className="marketplace-header">
        <div className="header-background">
          <div className="header-gradient"></div>
        </div>
        <div className="container">
          <div className="header-content">
            <span className="page-eyebrow">🏪 NFT Marketplace</span>
            <h1 className="page-title">Discover Unique NFTs</h1>
            <p className="page-subtitle">
              Browse, collect, and trade living digital art powered by AI
            </p>

            {/* Stats Bar */}
            <div className="market-stats">
              <div className="stat-chip">
                <span className="stat-value">{pagination.total || '2,847'}</span>
                <span className="stat-label">NFTs Listed</span>
              </div>
              <div className="stat-chip">
                <span className="stat-value">847.5</span>
                <span className="stat-label">ETH Volume</span>
              </div>
              <div className="stat-chip">
                <span className="stat-value">1,256</span>
                <span className="stat-label">Creators</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="marketplace-content">
        <div className="container">
          <div className="marketplace-layout">
            {/* Sidebar Filters */}
            <aside className={`filters-sidebar ${showFilters ? 'open' : ''}`}>
              <div className="filters-header">
                <h3>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>
                  </svg>
                  Filters
                </h3>
                {activeFilterCount > 0 && (
                  <button className="clear-filters" onClick={clearFilters}>
                    Clear ({activeFilterCount})
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="filter-group">
                <label className="filter-label">Search</label>
                <div className="search-input">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search NFTs..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </div>
              </div>

              {/* Content Type */}
              <div className="filter-group">
                <label className="filter-label">Type</label>
                <div className="type-chips">
                  {CONTENT_TYPES.map(type => (
                    <button
                      key={type.value}
                      className={`type-chip ${filters.contentType === type.value ? 'active' : ''}`}
                      onClick={() => handleFilterChange('contentType', type.value)}
                    >
                      <span>{type.icon}</span>
                      <span>{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="filter-group">
                <label className="filter-label">Price Range (ETH)</label>
                <div className="price-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    min="0"
                    step="0.01"
                  />
                  <span className="price-divider">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Creator */}
              <div className="filter-group">
                <label className="filter-label">Creator Address</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={filters.creator}
                  onChange={(e) => handleFilterChange('creator', e.target.value)}
                  className="creator-input"
                />
              </div>
            </aside>

            {/* Main Grid */}
            <main className="nfts-main">
              {/* Toolbar */}
              <div className="toolbar">
                <div className="toolbar-left">
                  <button 
                    className="filter-toggle"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>
                    </svg>
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </button>
                  <span className="results-count">
                    {loading ? 'Loading...' : `${nfts.length} results`}
                  </span>
                </div>

                <div className="toolbar-right">
                  {/* Sort */}
                  <div className="sort-dropdown">
                    <select 
                      value={filters.sort}
                      onChange={(e) => handleFilterChange('sort', e.target.value)}
                    >
                      {SORT_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.icon} {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* View Toggle */}
                  <div className="view-toggle">
                    <button 
                      className={viewMode === 'grid' ? 'active' : ''}
                      onClick={() => setViewMode('grid')}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="3" y="3" width="7" height="7" rx="1"/>
                        <rect x="14" y="3" width="7" height="7" rx="1"/>
                        <rect x="3" y="14" width="7" height="7" rx="1"/>
                        <rect x="14" y="14" width="7" height="7" rx="1"/>
                      </svg>
                    </button>
                    <button 
                      className={viewMode === 'list' ? 'active' : ''}
                      onClick={() => setViewMode('list')}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="3" y="4" width="18" height="4" rx="1"/>
                        <rect x="3" y="10" width="18" height="4" rx="1"/>
                        <rect x="3" y="16" width="18" height="4" rx="1"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* NFT Grid */}
              {loading ? (
                <div className={`nft-grid ${viewMode}`}>
                  {[1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} className="nft-card skeleton">
                      <div className="skeleton-image"></div>
                      <div className="skeleton-content">
                        <div className="skeleton-line skeleton-title"></div>
                        <div className="skeleton-line skeleton-text"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error && nfts.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🔍</div>
                  <h3>No NFTs Found</h3>
                  <p>Try adjusting your filters or search query</p>
                  <button className="btn btn-primary" onClick={clearFilters}>
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className={`nft-grid ${viewMode}`}>
                  {nfts.map((nft, index) => (
                    <div 
                      key={nft.tokenId || index} 
                      className="nft-card"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <Link to={`/nft/${nft.tokenId}`} className="nft-card-link">
                        <div className="nft-image-wrapper">
                          {nft.image ? (
                            <img src={nft.image} alt={nft.name} className="nft-image" />
                          ) : (
                            <div className="nft-placeholder" style={{
                              background: `linear-gradient(135deg, 
                                hsl(${(260 + index * 25) % 360}, 70%, 50%) 0%, 
                                hsl(${(280 + index * 25) % 360}, 70%, 40%) 100%)`
                            }}>
                              <span className="placeholder-emoji">✨</span>
                            </div>
                          )}
                          <div className="nft-badge">
                            {CONTENT_TYPES.find(t => t.value === nft.contentType)?.icon || '🎨'}
                          </div>
                          <div className="nft-hover-overlay">
                            <span className="view-details">View Details</span>
                          </div>
                        </div>
                        <div className="nft-info">
                          <h3 className="nft-title">{nft.name}</h3>
                          <div className="nft-creator">
                            <div className="creator-avatar"></div>
                            <span>{nft.creator?.slice(0, 12) || '0x1234...'}...</span>
                          </div>
                        </div>
                      </Link>
                      <div className="nft-footer">
                        <div className="nft-price">
                          <span className="price-label">Price</span>
                          <span className="price-value">{nft.price} ETH</span>
                        </div>
                        <button 
                          className="btn btn-buy"
                          onClick={() => handlePurchase(nft.tokenId, nft.price)}
                          disabled={purchasing === nft.tokenId}
                        >
                          {purchasing === nft.tokenId ? (
                            <span className="loading-spinner"></span>
                          ) : (
                            'Buy Now'
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!loading && nfts.length > 0 && pagination.totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="pagination-btn"
                    disabled={pagination.page === 1}
                    onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 19l-7-7 7-7"/>
                    </svg>
                    Previous
                  </button>
                  <div className="pagination-pages">
                    {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                      const page = i + 1
                      return (
                        <button
                          key={page}
                          className={`page-btn ${pagination.page === page ? 'active' : ''}`}
                          onClick={() => setPagination(p => ({ ...p, page }))}
                        >
                          {page}
                        </button>
                      )
                    })}
                  </div>
                  <button 
                    className="pagination-btn"
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                  >
                    Next
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      <style>{`
        /* ========== MARKETPLACE PAGE STYLES ========== */
        .marketplace-page {
          min-height: 100vh;
        }

        /* ========== HEADER ========== */
        .marketplace-header {
          position: relative;
          padding: 120px 0 60px;
          text-align: center;
        }

        .header-background {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .header-gradient {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(ellipse 60% 40% at 50% 40%, rgba(137, 90, 246, 0.2) 0%, transparent 50%),
            radial-gradient(ellipse 40% 30% at 70% 60%, rgba(244, 114, 182, 0.1) 0%, transparent 50%);
        }

        .header-content {
          position: relative;
          z-index: 1;
        }

        .page-eyebrow {
          display: inline-block;
          padding: 8px 16px;
          background: rgba(137, 90, 246, 0.15);
          border: 1px solid rgba(137, 90, 246, 0.3);
          border-radius: 100px;
          font-size: 14px;
          font-weight: 600;
          color: var(--primary-color);
          margin-bottom: 20px;
        }

        .page-title {
          font-family: var(--font-family-display);
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 800;
          margin-bottom: 16px;
          letter-spacing: -0.02em;
        }

        .page-subtitle {
          font-size: 1.125rem;
          color: var(--text-secondary);
          max-width: 500px;
          margin: 0 auto 32px;
        }

        .market-stats {
          display: flex;
          justify-content: center;
          gap: 24px;
          flex-wrap: wrap;
        }

        .stat-chip {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 16px 32px;
          background: rgba(22, 22, 42, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
        }

        .stat-chip .stat-value {
          font-family: var(--font-family-display);
          font-size: 1.5rem;
          font-weight: 700;
        }

        .stat-chip .stat-label {
          font-size: 13px;
          color: var(--text-tertiary);
        }

        /* ========== CONTENT LAYOUT ========== */
        .marketplace-content {
          padding: 40px 0 100px;
        }

        .marketplace-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 32px;
        }

        /* ========== SIDEBAR FILTERS ========== */
        .filters-sidebar {
          background: rgba(22, 22, 42, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          padding: 24px;
          height: fit-content;
          position: sticky;
          top: 100px;
          transition: all 0.3s ease;
        }

        .filters-sidebar:not(.open) {
          display: none;
        }

        .filters-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .filters-header h3 {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 16px;
          font-weight: 700;
          margin: 0;
        }

        .clear-filters {
          padding: 6px 12px;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          color: #ef4444;
          cursor: pointer;
          transition: all 0.2s;
        }

        .clear-filters:hover {
          background: rgba(239, 68, 68, 0.25);
        }

        .filter-group {
          margin-bottom: 24px;
        }

        .filter-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 10px;
        }

        .search-input {
          position: relative;
        }

        .search-input svg {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-tertiary);
        }

        .search-input input {
          width: 100%;
          padding: 12px 14px 12px 44px;
          background: rgba(22, 22, 42, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          font-size: 14px;
          color: var(--text-primary);
          transition: all 0.2s;
        }

        .search-input input:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(137, 90, 246, 0.2);
          outline: none;
        }

        .type-chips {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .type-chip {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          font-size: 14px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .type-chip:hover {
          border-color: rgba(137, 90, 246, 0.3);
          background: rgba(137, 90, 246, 0.05);
        }

        .type-chip.active {
          background: rgba(137, 90, 246, 0.15);
          border-color: var(--primary-color);
          color: var(--text-primary);
        }

        .price-inputs {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .price-inputs input {
          flex: 1;
          padding: 12px;
          background: rgba(22, 22, 42, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          font-size: 14px;
          color: var(--text-primary);
          transition: all 0.2s;
        }

        .price-inputs input:focus {
          border-color: var(--primary-color);
          outline: none;
        }

        .price-divider {
          font-size: 13px;
          color: var(--text-tertiary);
        }

        .creator-input {
          width: 100%;
          padding: 12px;
          background: rgba(22, 22, 42, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          font-size: 14px;
          font-family: var(--font-family-mono);
          color: var(--text-primary);
          transition: all 0.2s;
        }

        .creator-input:focus {
          border-color: var(--primary-color);
          outline: none;
        }

        /* ========== MAIN AREA ========== */
        .nfts-main {
          min-width: 0;
        }

        .toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding: 16px 20px;
          background: rgba(22, 22, 42, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
        }

        .toolbar-left,
        .toolbar-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .filter-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-toggle:hover {
          border-color: rgba(137, 90, 246, 0.3);
          color: var(--text-primary);
        }

        .results-count {
          font-size: 14px;
          color: var(--text-tertiary);
        }

        .sort-dropdown select {
          padding: 10px 40px 10px 14px;
          background: rgba(22, 22, 42, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          font-size: 14px;
          color: var(--text-primary);
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
        }

        .view-toggle {
          display: flex;
          background: rgba(22, 22, 42, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          overflow: hidden;
        }

        .view-toggle button {
          padding: 10px 14px;
          background: transparent;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .view-toggle button:hover {
          color: var(--text-secondary);
        }

        .view-toggle button.active {
          background: var(--primary-color);
          color: white;
        }

        /* ========== NFT GRID ========== */
        .nft-grid {
          display: grid;
          gap: 24px;
        }

        .nft-grid.grid {
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        }

        .nft-grid.list {
          grid-template-columns: 1fr;
        }

        .nft-grid.list .nft-card {
          display: flex;
          flex-direction: row;
        }

        .nft-grid.list .nft-image-wrapper {
          width: 200px;
          flex-shrink: 0;
        }

        .nft-grid.list .nft-card-link {
          display: flex;
          flex: 1;
        }

        .nft-grid.list .nft-info {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 20px;
        }

        .nft-grid.list .nft-footer {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 20px;
          margin-left: auto;
        }

        .nft-card {
          background: rgba(22, 22, 42, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          overflow: hidden;
          animation: fadeInUp 0.5s ease forwards;
          opacity: 0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .nft-card:hover {
          transform: translateY(-8px);
          border-color: rgba(137, 90, 246, 0.4);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .nft-card-link {
          text-decoration: none;
          color: inherit;
          display: block;
        }

        .nft-image-wrapper {
          position: relative;
          aspect-ratio: 1;
          overflow: hidden;
        }

        .nft-image,
        .nft-placeholder {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }

        .nft-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .placeholder-emoji {
          font-size: 48px;
          opacity: 0.5;
        }

        .nft-card:hover .nft-image,
        .nft-card:hover .nft-placeholder {
          transform: scale(1.08);
        }

        .nft-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(22, 22, 42, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 10px;
          font-size: 18px;
        }

        .nft-hover-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 50%, rgba(0, 0, 0, 0.8) 100%);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 20px;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .nft-card:hover .nft-hover-overlay {
          opacity: 1;
        }

        .view-details {
          padding: 10px 20px;
          background: var(--gradient-primary);
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
          color: white;
          transform: translateY(10px);
          transition: transform 0.3s;
        }

        .nft-card:hover .view-details {
          transform: translateY(0);
        }

        .nft-info {
          padding: 16px;
        }

        .nft-title {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 8px;
          color: var(--text-primary);
        }

        .nft-creator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-tertiary);
        }

        .creator-avatar {
          width: 22px;
          height: 22px;
          background: var(--gradient-primary);
          border-radius: 50%;
        }

        .nft-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .nft-price {
          display: flex;
          flex-direction: column;
        }

        .price-label {
          font-size: 11px;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .price-value {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .btn-buy {
          padding: 10px 20px;
          background: var(--gradient-primary);
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          color: white;
          cursor: pointer;
          transition: all 0.3s;
          min-width: 100px;
        }

        .btn-buy:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(137, 90, 246, 0.3);
        }

        .btn-buy:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .loading-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ========== SKELETON ========== */
        .nft-card.skeleton {
          animation: none;
          opacity: 1;
        }

        .skeleton-image {
          aspect-ratio: 1;
          background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .skeleton-content {
          padding: 16px;
        }

        .skeleton-line {
          height: 16px;
          background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .skeleton-title {
          width: 70%;
        }

        .skeleton-text {
          width: 50%;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ========== EMPTY STATE ========== */
        .empty-state {
          text-align: center;
          padding: 80px 20px;
          background: rgba(22, 22, 42, 0.4);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          margin-bottom: 10px;
        }

        .empty-state p {
          color: var(--text-secondary);
          margin-bottom: 24px;
        }

        /* ========== PAGINATION ========== */
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          margin-top: 48px;
        }

        .pagination-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: rgba(22, 22, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .pagination-btn:hover:not(:disabled) {
          border-color: var(--primary-color);
          background: rgba(137, 90, 246, 0.1);
        }

        .pagination-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .pagination-pages {
          display: flex;
          gap: 6px;
        }

        .page-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .page-btn:hover {
          border-color: var(--primary-color);
          color: var(--text-primary);
        }

        .page-btn.active {
          background: var(--gradient-primary);
          border-color: transparent;
          color: white;
        }

        /* ========== RESPONSIVE ========== */
        @media (max-width: 1024px) {
          .marketplace-layout {
            grid-template-columns: 1fr;
          }

          .filters-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 100;
            border-radius: 0;
            overflow-y: auto;
          }

          .filters-sidebar:not(.open) {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .marketplace-header {
            padding: 100px 0 40px;
          }

          .market-stats {
            gap: 12px;
          }

          .stat-chip {
            padding: 12px 20px;
          }

          .toolbar {
            flex-direction: column;
            gap: 12px;
          }

          .nft-grid.grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          }

          .nft-grid.list .nft-card {
            flex-direction: column;
          }

          .nft-grid.list .nft-image-wrapper {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
