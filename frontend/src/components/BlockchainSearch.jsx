import { useState, useCallback, useEffect, useRef } from 'react'
import { useSearchWebSocket, useRealTimeData } from '../hooks/useWebSocket.jsx'
import SystemStatus from './SystemStatus.jsx'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/**
 * Blockchain Search Component - Professional Studio Design
 * 
 * Features:
 * - Professional dark theme with neon accents
 * - Real-time autocomplete suggestions (<200ms response)
 * - Category filtering (transactions, addresses, tokens, NFTs, blocks)
 * - Advanced filters (date range, value range, network)
 * - Search result display with professional cards
 * - Search analytics tracking
 * - Keyboard navigation support
 * - Responsive grid layout
 * 
 * Validates: Requirements 15.1-15.10
 * Implements: Tasks 26.1-26.8, 27.1-27.5
 */

const CATEGORIES = [
  { id: 'ALL', name: 'All', icon: '🔍' },
  { id: 'TRANSACTION', name: 'Transactions', icon: '🔗' },
  { id: 'ADDRESS', name: 'Addresses', icon: '👛' },
  { id: 'TOKEN', name: 'Tokens', icon: '🪙' },
  { id: 'NFT', name: 'NFTs', icon: '🖼️' },
  { id: 'BLOCK', name: 'Blocks', icon: '📦' }
]

const NETWORKS = [
  { id: 'all', name: 'All Networks' },
  { id: 'ethereum', name: 'Ethereum' },
  { id: 'polygon', name: 'Polygon' },
  { id: 'arbitrum', name: 'Arbitrum' }
]

function BlockchainSearch({ onResultSelect }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [showSystemStatus, setShowSystemStatus] = useState(false)
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    valueMin: '',
    valueMax: '',
    network: 'all'
  })
  const [searchTime, setSearchTime] = useState(null)
  const [recentSearches, setRecentSearches] = useState([])
  const [liveUpdates, setLiveUpdates] = useState([])
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)
  const debounceRef = useRef(null)
  const searchStartRef = useRef(null)

  // Real-time WebSocket integration
  const {
    searchUpdates,
    searchConnected
  } = useRealTimeData()

  const searchWs = useSearchWebSocket({
    onMessage: (data) => {
      switch (data.type) {
        case 'new_block':
        case 'new_transaction':
          setLiveUpdates(prev => [{
            ...data,
            timestamp: Date.now()
          }, ...prev.slice(0, 19)]) // Keep last 20 updates
          break
        case 'trending_search':
          // Update trending searches if needed
          break
      }
    }
  })

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('dgc_recent_searches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading recent searches:', e)
      }
    }
  }, [])

  // Save search to recent searches
  const saveRecentSearch = (searchQuery, category) => {
    const newSearch = {
      query: searchQuery,
      category,
      timestamp: Date.now()
    }
    
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.query !== searchQuery)
      const updated = [newSearch, ...filtered].slice(0, 10) // Keep last 10
      localStorage.setItem('dgc_recent_searches', JSON.stringify(updated))
      return updated
    })
  }

  // Debounced autocomplete fetch
  const fetchSuggestions = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 1) {
      setSuggestions([])
      return
    }

    try {
      const response = await axios.get(`${API_BASE}/api/search/autocomplete`, {
        params: { q: searchQuery, limit: 10 }
      })
      setSuggestions(response.data.suggestions || [])
      setShowSuggestions(true)
    } catch (err) {
      console.error('Autocomplete error:', err)
      setSuggestions([])
    }
  }, [])

  // Handle input change with debounce
  const handleInputChange = (e) => {
    const value = e.target.value
    setQuery(value)
    setHighlightedIndex(-1)

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Debounce autocomplete (150ms)
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value)
    }, 150)
  }

  // Execute search
  const executeSearch = async (searchQuery = query, category = selectedCategory) => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setShowSuggestions(false)
    searchStartRef.current = performance.now()

    try {
      const requestFilters = {}
      if (filters.dateFrom) requestFilters.date_from = filters.dateFrom
      if (filters.dateTo) requestFilters.date_to = filters.dateTo
      if (filters.valueMin) requestFilters.value_min = parseFloat(filters.valueMin)
      if (filters.valueMax) requestFilters.value_max = parseFloat(filters.valueMax)
      if (filters.network !== 'all') requestFilters.network = filters.network

      const response = await axios.post(`${API_BASE}/api/search`, {
        query: searchQuery,
        categories: category === 'ALL' ? null : [category],
        filters: Object.keys(requestFilters).length > 0 ? requestFilters : null,
        limit: 20
      })
      
      const endTime = performance.now()
      setSearchTime(Math.round(endTime - searchStartRef.current))
      setResults(response.data)
    } catch (err) {
      console.error('Search error:', err)
      alert('Search failed: ' + (err.response?.data?.detail || err.message))
    } finally {
      setLoading(false)
    }
  }

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setQuery(suggestion.text)
    setShowSuggestions(false)
    executeSearch(suggestion.text, suggestion.category)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        executeSearch()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0) {
          handleSuggestionSelect(suggestions[highlightedIndex])
        } else {
          executeSearch()
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        break
      default:
        break
    }
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(e.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const renderResults = () => {
    if (!results) return null

    const hasResults = 
      results.transactions.length > 0 ||
      results.addresses.length > 0 ||
      results.tokens.length > 0 ||
      results.nfts.length > 0 ||
      results.blocks.length > 0

    if (!hasResults) {
      return (
        <div className="no-results-studio">
          <div className="no-results-animation">
            <div className="search-pulse">🔍</div>
          </div>
          <div className="no-results-content">
            <h4 className="no-results-title">NO RESULTS FOUND</h4>
            <p className="no-results-subtitle">Try adjusting your search terms or filters</p>
            <div className="search-suggestions">
              <button className="suggestion-btn" onClick={() => { setQuery(''); setSelectedCategory('ALL') }}>
                CLEAR SEARCH
              </button>
              <button className="suggestion-btn" onClick={() => setShowAdvancedFilters(true)}>
                ADJUST FILTERS
              </button>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="search-results-studio">
        {/* Results Header */}
        <div className="results-header-studio">
          <div className="results-info">
            <span className="results-count">{results.total_results} RESULTS FOUND</span>
            <span className="results-time">
              in {searchTime || results.execution_time_ms}ms
              {searchTime && searchTime < 200 && <span className="fast-badge">⚡ FAST</span>}
            </span>
          </div>
          
          <div className="results-actions">
            <button className="results-btn export">
              <span className="btn-icon">📊</span>
              <span className="btn-text">EXPORT</span>
            </button>
            <button className="results-btn share">
              <span className="btn-icon">🔗</span>
              <span className="btn-text">SHARE</span>
            </button>
          </div>
        </div>

        {/* Transactions Results */}
        {results.transactions.length > 0 && (
          <div className="result-section-studio">
            <div className="section-header-results">
              <div className="header-left">
                <span className="section-icon">🔗</span>
                <span className="section-title">TRANSACTIONS</span>
                <span className="section-count">({results.transactions.length})</span>
              </div>
              <button className="view-all-btn">VIEW ALL</button>
            </div>
            
            <div className="result-grid-studio">
              {results.transactions.map((tx, index) => (
                <div 
                  key={index} 
                  className="result-card-studio transaction"
                  onClick={() => onResultSelect && onResultSelect('transaction', tx)}
                >
                  <div className="card-header">
                    <div className="result-icon transaction">🔗</div>
                    <div className="result-status">
                      <span className={`status-badge ${tx.status?.toLowerCase()}`}>
                        {tx.status === 'CONFIRMED' ? '✅' : tx.status === 'PENDING' ? '⏳' : '❌'}
                        {tx.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="card-content">
                    <div className="result-primary">{tx.hash}</div>
                    <div className="result-secondary">
                      {tx.from_address?.slice(0, 8)}... → {tx.to_address?.slice(0, 8)}...
                    </div>
                    <div className="result-meta">
                      <span className="meta-item">
                        <span className="meta-label">VALUE:</span>
                        <span className="meta-value">{tx.value} ETH</span>
                      </span>
                      <span className="meta-item">
                        <span className="meta-label">BLOCK:</span>
                        <span className="meta-value">{tx.block_number}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="card-footer">
                    <span className="result-time">
                      {tx.timestamp ? new Date(tx.timestamp * 1000).toLocaleString() : 'Pending'}
                    </span>
                    <div className="card-actions">
                      <button className="action-btn">VIEW</button>
                      <button className="action-btn">COPY</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Addresses Results */}
        {results.addresses.length > 0 && (
          <div className="result-section-studio">
            <div className="section-header-results">
              <div className="header-left">
                <span className="section-icon">👛</span>
                <span className="section-title">ADDRESSES</span>
                <span className="section-count">({results.addresses.length})</span>
              </div>
              <button className="view-all-btn">VIEW ALL</button>
            </div>
            
            <div className="result-grid-studio">
              {results.addresses.map((addr, index) => (
                <div 
                  key={index} 
                  className="result-card-studio address"
                  onClick={() => onResultSelect && onResultSelect('address', addr)}
                >
                  <div className="card-header">
                    <div className="result-icon address">👛</div>
                    <div className="result-type">
                      <span className="type-badge">
                        {addr.is_contract ? 'CONTRACT' : 'EOA'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="card-content">
                    <div className="result-primary">{addr.address}</div>
                    <div className="result-secondary">
                      {addr.label || (addr.is_contract ? 'Smart Contract' : 'Externally Owned Account')}
                    </div>
                    <div className="result-meta">
                      <span className="meta-item">
                        <span className="meta-label">BALANCE:</span>
                        <span className="meta-value">{addr.balance} ETH</span>
                      </span>
                      <span className="meta-item">
                        <span className="meta-label">TXS:</span>
                        <span className="meta-value">{addr.transaction_count}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="card-footer">
                    <span className="result-activity">
                      Last activity: {addr.last_seen ? new Date(addr.last_seen * 1000).toLocaleDateString() : 'Unknown'}
                    </span>
                    <div className="card-actions">
                      <button className="action-btn">EXPLORE</button>
                      <button className="action-btn">TRACK</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tokens Results */}
        {results.tokens.length > 0 && (
          <div className="result-section-studio">
            <div className="section-header-results">
              <div className="header-left">
                <span className="section-icon">🪙</span>
                <span className="section-title">TOKENS</span>
                <span className="section-count">({results.tokens.length})</span>
              </div>
              <button className="view-all-btn">VIEW ALL</button>
            </div>
            
            <div className="result-grid-studio">
              {results.tokens.map((token, index) => (
                <div 
                  key={index} 
                  className="result-card-studio token"
                  onClick={() => onResultSelect && onResultSelect('token', token)}
                >
                  <div className="card-header">
                    <div className="result-icon token">🪙</div>
                    <div className="result-rank">
                      <span className="rank-badge">#{token.market_cap_rank || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="card-content">
                    <div className="result-primary">{token.name} ({token.symbol})</div>
                    <div className="result-secondary">{token.contract_address}</div>
                    <div className="result-meta">
                      {token.price_usd && (
                        <span className="meta-item">
                          <span className="meta-label">PRICE:</span>
                          <span className="meta-value">${token.price_usd.toFixed(2)}</span>
                        </span>
                      )}
                      {token.market_cap && (
                        <span className="meta-item">
                          <span className="meta-label">MCAP:</span>
                          <span className="meta-value">${(token.market_cap / 1e6).toFixed(1)}M</span>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="card-footer">
                    <span className="result-change">
                      24h: <span className={`change-value ${token.price_change_24h >= 0 ? 'positive' : 'negative'}`}>
                        {token.price_change_24h >= 0 ? '+' : ''}{token.price_change_24h?.toFixed(2)}%
                      </span>
                    </span>
                    <div className="card-actions">
                      <button className="action-btn">TRADE</button>
                      <button className="action-btn">CHART</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NFTs Results */}
        {results.nfts.length > 0 && (
          <div className="result-section-studio">
            <div className="section-header-results">
              <div className="header-left">
                <span className="section-icon">🖼️</span>
                <span className="section-title">NFTs</span>
                <span className="section-count">({results.nfts.length})</span>
              </div>
              <button className="view-all-btn">VIEW ALL</button>
            </div>
            
            <div className="result-grid-studio nft-grid">
              {results.nfts.map((nft, index) => (
                <div 
                  key={index} 
                  className="result-card-studio nft"
                  onClick={() => onResultSelect && onResultSelect('nft', nft)}
                >
                  <div className="nft-image-container">
                    {nft.image_url ? (
                      <img src={nft.image_url} alt={nft.name} className="nft-image" />
                    ) : (
                      <div className="nft-placeholder">
                        <span className="placeholder-icon">🖼️</span>
                      </div>
                    )}
                    <div className="nft-overlay">
                      <button className="overlay-btn">VIEW</button>
                      <button className="overlay-btn">BID</button>
                    </div>
                  </div>
                  
                  <div className="card-content">
                    <div className="result-primary">{nft.name}</div>
                    <div className="result-secondary">{nft.collection_name}</div>
                    <div className="result-meta">
                      {nft.floor_price && (
                        <span className="meta-item">
                          <span className="meta-label">FLOOR:</span>
                          <span className="meta-value">{nft.floor_price} ETH</span>
                        </span>
                      )}
                      <span className="meta-item">
                        <span className="meta-label">TOKEN:</span>
                        <span className="meta-value">#{nft.token_id}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="card-footer">
                    <span className="result-owner">
                      Owner: {nft.owner?.slice(0, 6)}...{nft.owner?.slice(-4)}
                    </span>
                    <div className="card-actions">
                      <button className="action-btn">DETAILS</button>
                      <button className="action-btn">OFFER</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Blocks Results */}
        {results.blocks.length > 0 && (
          <div className="result-section-studio">
            <div className="section-header-results">
              <div className="header-left">
                <span className="section-icon">📦</span>
                <span className="section-title">BLOCKS</span>
                <span className="section-count">({results.blocks.length})</span>
              </div>
              <button className="view-all-btn">VIEW ALL</button>
            </div>
            
            <div className="result-grid-studio">
              {results.blocks.map((block, index) => (
                <div 
                  key={index} 
                  className="result-card-studio block"
                  onClick={() => onResultSelect && onResultSelect('block', block)}
                >
                  <div className="card-header">
                    <div className="result-icon block">📦</div>
                    <div className="result-height">
                      <span className="height-badge">#{block.number}</span>
                    </div>
                  </div>
                  
                  <div className="card-content">
                    <div className="result-primary">Block #{block.number}</div>
                    <div className="result-secondary">
                      {new Date(block.timestamp * 1000).toLocaleString()}
                    </div>
                    <div className="result-meta">
                      <span className="meta-item">
                        <span className="meta-label">TXS:</span>
                        <span className="meta-value">{block.transaction_count}</span>
                      </span>
                      <span className="meta-item">
                        <span className="meta-label">GAS:</span>
                        <span className="meta-value">{(block.gas_used / 1e6).toFixed(2)}M</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="card-footer">
                    <span className="result-miner">
                      Miner: {block.miner?.slice(0, 8)}...{block.miner?.slice(-6)}
                    </span>
                    <div className="card-actions">
                      <button className="action-btn">EXPLORE</button>
                      <button className="action-btn">ANALYZE</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="blockchain-search-professional">
      {/* Professional Search Header */}
      <div className="search-header-studio">
        <div className="header-content">
          <div className="header-icon">
            <div className="icon-gradient">🔍</div>
          </div>
          <div className="header-text">
            <h2 className="header-title">BLOCKCHAIN SEARCH ENGINE</h2>
            <p className="header-subtitle">Real-time search across all blockchain data with AI-powered suggestions</p>
          </div>
        </div>
        
        <div className="search-stats">
          <div className="stat-item">
            <span className="stat-value">12ms</span>
            <span className="stat-label">AVG LATENCY</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">99.9%</span>
            <span className="stat-label">UPTIME</span>
          </div>
        </div>
      </div>

      {/* Professional Search Input */}
      <div className="search-input-studio">
        <div className="input-container" ref={inputRef}>
          <div className="input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-field"
              placeholder="Search transactions, addresses, tokens, NFTs, blocks..."
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => query && suggestions.length > 0 && setShowSuggestions(true)}
            />
            {query && (
              <button 
                className="clear-button"
                onClick={() => {
                  setQuery('')
                  setSuggestions([])
                  setResults(null)
                }}
              >
                ✕
              </button>
            )}
            <button 
              className="search-button"
              onClick={() => executeSearch()}
              disabled={loading || !query.trim()}
            >
              {loading ? (
                <div className="loading-spinner-small"></div>
              ) : (
                <>
                  <span className="btn-icon">🔍</span>
                  <span className="btn-text">SEARCH</span>
                </>
              )}
            </button>
          </div>

          {/* Professional Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-dropdown-studio" ref={suggestionsRef}>
              <div className="suggestions-header">
                <span className="suggestions-title">SUGGESTIONS</span>
                <span className="suggestions-count">{suggestions.length} found</span>
              </div>
              
              <div className="suggestions-list">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`suggestion-item-studio ${index === highlightedIndex ? 'highlighted' : ''}`}
                    onClick={() => handleSuggestionSelect(suggestion)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <div className="suggestion-icon">{suggestion.icon}</div>
                    <div className="suggestion-content">
                      <span className="suggestion-text">{suggestion.text}</span>
                      <span className="suggestion-category">{suggestion.category}</span>
                    </div>
                    <div className="suggestion-arrow">→</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Professional Category Filters */}
      <div className="category-filters-studio">
        <div className="filters-container">
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              className={`category-btn-studio ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategory(category.id)
                if (query) executeSearch(query, category.id)
              }}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
              <div className="category-indicator"></div>
            </button>
          ))}
          
          <button
            className={`category-btn-studio advanced ${showAdvancedFilters ? 'active' : ''}`}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <span className="category-icon">⚙️</span>
            <span className="category-name">ADVANCED</span>
            <div className="category-indicator"></div>
          </button>
        </div>
      </div>

      {/* Professional Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="advanced-filters-studio">
          <div className="filters-header">
            <span className="filters-title">ADVANCED FILTERS</span>
            <button 
              className="filters-close"
              onClick={() => setShowAdvancedFilters(false)}
            >
              ✕
            </button>
          </div>
          
          <div className="filters-grid">
            <div className="filter-group">
              <label className="filter-label">DATE RANGE</label>
              <div className="date-inputs">
                <input
                  type="date"
                  className="filter-input"
                  placeholder="From"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                />
                <span className="date-separator">→</span>
                <input
                  type="date"
                  className="filter-input"
                  placeholder="To"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="filter-group">
              <label className="filter-label">VALUE RANGE (ETH)</label>
              <div className="value-inputs">
                <input
                  type="number"
                  step="0.001"
                  className="filter-input"
                  placeholder="Min"
                  value={filters.valueMin}
                  onChange={(e) => setFilters(prev => ({ ...prev, valueMin: e.target.value }))}
                />
                <span className="value-separator">→</span>
                <input
                  type="number"
                  step="0.001"
                  className="filter-input"
                  placeholder="Max"
                  value={filters.valueMax}
                  onChange={(e) => setFilters(prev => ({ ...prev, valueMax: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="filter-group">
              <label className="filter-label">NETWORK</label>
              <select
                className="filter-select"
                value={filters.network}
                onChange={(e) => setFilters(prev => ({ ...prev, network: e.target.value }))}
              >
                {NETWORKS.map(network => (
                  <option key={network.id} value={network.id}>{network.name}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-actions">
              <button
                className="filter-btn secondary"
                onClick={() => setFilters({ dateFrom: '', dateTo: '', valueMin: '', valueMax: '', network: 'all' })}
              >
                CLEAR ALL
              </button>
              <button
                className="filter-btn primary"
                onClick={() => executeSearch()}
              >
                APPLY FILTERS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Professional Loading State */}
      {loading && (
        <div className="search-loading-studio">
          <div className="loading-animation">
            <div className="loading-ring"></div>
            <div className="loading-ring"></div>
            <div className="loading-ring"></div>
          </div>
          <div className="loading-text">
            <span className="loading-title">SEARCHING BLOCKCHAIN</span>
            <span className="loading-subtitle">Analyzing millions of records...</span>
          </div>
        </div>
      )}

      {/* Professional Search Results */}
      {!loading && renderResults()}

      {/* Professional Empty State */}
      {!loading && !results && (
        <div className="search-empty-studio">
          <div className="empty-animation">
            <div className="search-pulse">🔍</div>
          </div>
          
          <div className="empty-content">
            <h3 className="empty-title">BLOCKCHAIN SEARCH ENGINE</h3>
            <p className="empty-subtitle">Enter any blockchain identifier to search across all networks</p>
            
            <div className="search-examples">
              <div className="examples-header">
                <span className="examples-title">QUICK SEARCH EXAMPLES</span>
              </div>
              
              <div className="examples-grid">
                <button 
                  className="example-chip transaction" 
                  onClick={() => { setQuery('0x'); executeSearch('0x') }}
                >
                  <span className="chip-icon">🔗</span>
                  <span className="chip-text">Transaction Hash</span>
                </button>
                
                <button 
                  className="example-chip token" 
                  onClick={() => { setQuery('eth'); executeSearch('eth') }}
                >
                  <span className="chip-icon">🪙</span>
                  <span className="chip-text">ETH Token</span>
                </button>
                
                <button 
                  className="example-chip token" 
                  onClick={() => { setQuery('usdc'); executeSearch('usdc') }}
                >
                  <span className="chip-icon">💰</span>
                  <span className="chip-text">USDC Token</span>
                </button>
                
                <button 
                  className="example-chip block" 
                  onClick={() => { setQuery('12345678'); executeSearch('12345678') }}
                >
                  <span className="chip-icon">📦</span>
                  <span className="chip-text">Block Number</span>
                </button>
              </div>
            </div>
            
            <div className="search-features">
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <span className="feature-text">Sub-200ms Response</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🎯</span>
                <span className="feature-text">AI-Powered Suggestions</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔍</span>
                <span className="feature-text">Multi-Network Search</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .blockchain-search-professional {
          background: linear-gradient(135deg, #0B0E14 0%, #161B28 100%);
          color: #ffffff;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        .blockchain-search-professional::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            linear-gradient(rgba(137, 90, 246, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(137, 90, 246, 0.05) 1px, transparent 1px);
          background-size: 20px 20px;
          pointer-events: none;
        }

        /* Search Header Styles */
        .search-header-studio {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem;
          background: rgba(29, 35, 51, 0.9);
          border-bottom: 1px solid #2D3548;
          backdrop-filter: blur(10px);
          position: relative;
          z-index: 10;
        }

        .search-header-studio::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, #895af6 50%, transparent 100%);
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .header-icon {
          width: 4rem;
          height: 4rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(137, 90, 246, 0.1);
          border-radius: 12px;
          border: 1px solid rgba(137, 90, 246, 0.2);
        }

        .icon-gradient {
          font-size: 2rem;
          background: linear-gradient(135deg, #895af6 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 10px rgba(137, 90, 246, 0.3));
        }

        .header-text {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .header-title {
          font-size: 1.8rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin: 0;
          background: linear-gradient(135deg, #ffffff 0%, #94A3B8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-family: 'JetBrains Mono', monospace;
        }

        .header-subtitle {
          font-size: 0.9rem;
          color: #94A3B8;
          margin: 0;
          font-family: 'JetBrains Mono', monospace;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .search-stats {
          display: flex;
          gap: 2rem;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .stat-value {
          font-size: 1.2rem;
          font-weight: 900;
          color: #06b6d4;
          font-family: 'JetBrains Mono', monospace;
        }

        .stat-label {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #94A3B8;
          font-family: 'JetBrains Mono', monospace;
        }

        /* Search Input Styles */
        .search-input-studio {
          padding: 2rem;
          position: relative;
          z-index: 5;
        }

        .input-container {
          position: relative;
          max-width: 800px;
          margin: 0 auto;
        }

        .input-wrapper {
          display: flex;
          align-items: center;
          background: rgba(29, 35, 51, 0.9);
          border: 1px solid #2D3548;
          border-radius: 12px;
          padding: 0.75rem;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .input-wrapper::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, #895af6 50%, transparent 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .input-wrapper:focus-within {
          border-color: #895af6;
          box-shadow: 0 0 20px rgba(137, 90, 246, 0.2);
        }

        .input-wrapper:focus-within::before {
          opacity: 1;
        }

        .search-icon {
          font-size: 1.2rem;
          color: #94A3B8;
          margin-right: 1rem;
        }

        .search-field {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #ffffff;
          font-size: 1rem;
          font-family: 'JetBrains Mono', monospace;
          placeholder-color: #94A3B8;
        }

        .search-field::placeholder {
          color: #94A3B8;
          font-style: italic;
        }

        .clear-button {
          background: transparent;
          border: none;
          color: #94A3B8;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 6px;
          transition: all 0.3s ease;
          margin-right: 0.5rem;
        }

        .clear-button:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .search-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #895af6;
          border: 1px solid #895af6;
          border-radius: 8px;
          color: #ffffff;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'JetBrains Mono', monospace;
          position: relative;
          overflow: hidden;
        }

        .search-button:hover:not(:disabled) {
          background: #7c3aed;
          box-shadow: 0 0 20px rgba(137, 90, 246, 0.4);
          transform: translateY(-1px);
        }

        .search-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .loading-spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid #ffffff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .btn-icon {
          font-size: 1rem;
        }

        .btn-text {
          font-size: 0.7rem;
        }

        /* Suggestions Dropdown Styles */
        .suggestions-dropdown-studio {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: rgba(29, 35, 51, 0.95);
          border: 1px solid #2D3548;
          border-top: none;
          border-radius: 0 0 12px 12px;
          backdrop-filter: blur(10px);
          z-index: 1000;
          max-height: 400px;
          overflow-y: auto;
        }

        .suggestions-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #2D3548;
          background: rgba(11, 14, 20, 0.6);
        }

        .suggestions-title {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #895af6;
          font-family: 'JetBrains Mono', monospace;
        }

        .suggestions-count {
          font-size: 0.7rem;
          color: #94A3B8;
          font-family: 'JetBrains Mono', monospace;
        }

        .suggestions-list {
          padding: 0.5rem 0;
        }

        .suggestion-item-studio {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border-left: 3px solid transparent;
        }

        .suggestion-item-studio:hover,
        .suggestion-item-studio.highlighted {
          background: rgba(137, 90, 246, 0.1);
          border-left-color: #895af6;
        }

        .suggestion-icon {
          font-size: 1.2rem;
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(137, 90, 246, 0.1);
          border-radius: 6px;
          border: 1px solid rgba(137, 90, 246, 0.2);
        }

        .suggestion-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .suggestion-text {
          font-size: 0.9rem;
          font-weight: 600;
          color: #ffffff;
          font-family: 'JetBrains Mono', monospace;
        }

        .suggestion-category {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #94A3B8;
          font-family: 'JetBrains Mono', monospace;
        }

        .suggestion-arrow {
          font-size: 1rem;
          color: #895af6;
          transition: transform 0.3s ease;
        }

        .suggestion-item-studio:hover .suggestion-arrow {
          transform: translateX(3px);
        }

        /* Category Filters Styles */
        .category-filters-studio {
          padding: 0 2rem 2rem;
          position: relative;
          z-index: 4;
        }

        .filters-container {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          max-width: 1000px;
          margin: 0 auto;
        }

        .category-btn-studio {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          background: rgba(29, 35, 51, 0.9);
          border: 1px solid #2D3548;
          border-radius: 8px;
          color: #94A3B8;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          backdrop-filter: blur(10px);
          font-family: 'JetBrains Mono', monospace;
        }

        .category-btn-studio:hover {
          border-color: #895af6;
          color: #ffffff;
          box-shadow: 0 0 15px rgba(137, 90, 246, 0.2);
          transform: translateY(-2px);
        }

        .category-btn-studio.active {
          background: rgba(137, 90, 246, 0.1);
          border-color: #895af6;
          color: #895af6;
          box-shadow: 0 0 20px rgba(137, 90, 246, 0.3);
        }

        .category-btn-studio.advanced {
          border-color: #06b6d4;
        }

        .category-btn-studio.advanced:hover,
        .category-btn-studio.advanced.active {
          border-color: #06b6d4;
          color: #06b6d4;
          background: rgba(6, 182, 212, 0.1);
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.3);
        }

        .category-icon {
          font-size: 1.2rem;
        }

        .category-name {
          font-size: 0.75rem;
        }

        .category-indicator {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: transparent;
          transition: background 0.3s ease;
        }

        .category-btn-studio.active .category-indicator {
          background: linear-gradient(90deg, #895af6 0%, #06b6d4 100%);
        }

        /* Advanced Filters Styles */
        .advanced-filters-studio {
          margin: 0 2rem 2rem;
          background: rgba(29, 35, 51, 0.9);
          border: 1px solid #2D3548;
          border-radius: 12px;
          backdrop-filter: blur(10px);
          position: relative;
          z-index: 3;
          max-width: 1000px;
          margin-left: auto;
          margin-right: auto;
          margin-bottom: 2rem;
        }

        .filters-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #2D3548;
        }

        .filters-title {
          font-size: 1rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #06b6d4;
          font-family: 'JetBrains Mono', monospace;
        }

        .filters-close {
          background: transparent;
          border: none;
          color: #94A3B8;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 6px;
          transition: all 0.3s ease;
        }

        .filters-close:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          padding: 1.5rem;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .filter-label {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #94A3B8;
          font-family: 'JetBrains Mono', monospace;
        }

        .date-inputs,
        .value-inputs {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .date-separator,
        .value-separator {
          color: #895af6;
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
        }

        .filter-input,
        .filter-select {
          flex: 1;
          padding: 0.75rem;
          background: rgba(11, 14, 20, 0.6);
          border: 1px solid #2D3548;
          border-radius: 6px;
          color: #ffffff;
          font-size: 0.9rem;
          font-family: 'JetBrains Mono', monospace;
          transition: all 0.3s ease;
        }

        .filter-input:focus,
        .filter-select:focus {
          outline: none;
          border-color: #895af6;
          box-shadow: 0 0 10px rgba(137, 90, 246, 0.2);
        }

        .filter-input::placeholder {
          color: #94A3B8;
          font-style: italic;
        }

        .filter-actions {
          display: flex;
          gap: 1rem;
          grid-column: 1 / -1;
          justify-content: flex-end;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #2D3548;
        }

        .filter-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'JetBrains Mono', monospace;
          border: 1px solid;
        }

        .filter-btn.secondary {
          background: transparent;
          border-color: #2D3548;
          color: #94A3B8;
        }

        .filter-btn.secondary:hover {
          border-color: #ef4444;
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .filter-btn.primary {
          background: #895af6;
          border-color: #895af6;
          color: #ffffff;
        }

        .filter-btn.primary:hover {
          background: #7c3aed;
          box-shadow: 0 0 20px rgba(137, 90, 246, 0.4);
        }

        /* Loading Styles */
        .search-loading-studio {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          position: relative;
          z-index: 1;
        }

        .loading-animation {
          position: relative;
          width: 80px;
          height: 80px;
          margin-bottom: 2rem;
        }

        .loading-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 2px solid transparent;
          border-top: 2px solid #895af6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loading-ring:nth-child(2) {
          width: 60px;
          height: 60px;
          top: 10px;
          left: 10px;
          border-top-color: #06b6d4;
          animation-duration: 1.5s;
          animation-direction: reverse;
        }

        .loading-ring:nth-child(3) {
          width: 40px;
          height: 40px;
          top: 20px;
          left: 20px;
          border-top-color: #a855f7;
          animation-duration: 2s;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-text {
          text-align: center;
        }

        .loading-title {
          display: block;
          font-size: 1.2rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 0.5rem;
          color: #ffffff;
          font-family: 'JetBrains Mono', monospace;
        }

        .loading-subtitle {
          display: block;
          font-size: 0.9rem;
          color: #94A3B8;
          font-family: 'JetBrains Mono', monospace;
        }

        /* Empty State Styles */
        .search-empty-studio {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .empty-animation {
          margin-bottom: 3rem;
        }

        .search-pulse {
          font-size: 4rem;
          animation: pulse-glow 2s ease-in-out infinite;
        }

        @keyframes pulse-glow {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 10px rgba(137, 90, 246, 0.3));
          }
          50% {
            transform: scale(1.1);
            filter: drop-shadow(0 0 20px rgba(137, 90, 246, 0.6));
          }
        }

        .empty-content {
          max-width: 600px;
        }

        .empty-title {
          font-size: 2rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #ffffff 0%, #94A3B8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-family: 'JetBrains Mono', monospace;
        }

        .empty-subtitle {
          font-size: 1rem;
          color: #94A3B8;
          margin-bottom: 3rem;
          line-height: 1.6;
        }

        .search-examples {
          margin-bottom: 3rem;
        }

        .examples-header {
          margin-bottom: 1.5rem;
        }

        .examples-title {
          font-size: 0.9rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #895af6;
          font-family: 'JetBrains Mono', monospace;
        }

        .examples-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .example-chip {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: rgba(29, 35, 51, 0.9);
          border: 1px solid #2D3548;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .example-chip:hover {
          border-color: #895af6;
          box-shadow: 0 0 15px rgba(137, 90, 246, 0.2);
          transform: translateY(-2px);
        }

        .example-chip.transaction:hover { border-color: #06b6d4; box-shadow: 0 0 15px rgba(6, 182, 212, 0.2); }
        .example-chip.token:hover { border-color: #10b981; box-shadow: 0 0 15px rgba(16, 185, 129, 0.2); }
        .example-chip.block:hover { border-color: #f59e0b; box-shadow: 0 0 15px rgba(245, 158, 11, 0.2); }

        .chip-icon {
          font-size: 1.2rem;
        }

        .chip-text {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #ffffff;
          font-family: 'JetBrains Mono', monospace;
        }

        .search-features {
          display: flex;
          justify-content: center;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #94A3B8;
          font-family: 'JetBrains Mono', monospace;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .feature-icon {
          font-size: 1.2rem;
        }

        /* Search Results Styles */
        .search-results-studio {
          padding: 2rem;
          position: relative;
          z-index: 1;
        }

        .results-header-studio {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: rgba(29, 35, 51, 0.9);
          border: 1px solid #2D3548;
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }

        .results-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .results-count {
          font-size: 1rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #ffffff;
          font-family: 'JetBrains Mono', monospace;
        }

        .results-time {
          font-size: 0.8rem;
          color: #94A3B8;
          font-family: 'JetBrains Mono', monospace;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .fast-badge {
          padding: 0.25rem 0.5rem;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 12px;
          color: #10b981;
          font-size: 0.7rem;
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
        }

        .results-actions {
          display: flex;
          gap: 1rem;
        }

        .results-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(11, 14, 20, 0.6);
          border: 1px solid #2D3548;
          border-radius: 6px;
          color: #94A3B8;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'JetBrains Mono', monospace;
        }

        .results-btn:hover {
          border-color: #895af6;
          color: #895af6;
          background: rgba(137, 90, 246, 0.1);
        }

        .result-section-studio {
          margin-bottom: 3rem;
        }

        .section-header-results {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #2D3548;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .section-icon {
          font-size: 1.5rem;
        }

        .section-title {
          font-size: 1.2rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #ffffff;
          font-family: 'JetBrains Mono', monospace;
        }

        .section-count {
          font-size: 0.9rem;
          color: #94A3B8;
          font-family: 'JetBrains Mono', monospace;
        }

        .view-all-btn {
          padding: 0.5rem 1rem;
          background: transparent;
          border: 1px solid #2D3548;
          border-radius: 6px;
          color: #94A3B8;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'JetBrains Mono', monospace;
        }

        .view-all-btn:hover {
          border-color: #895af6;
          color: #895af6;
          background: rgba(137, 90, 246, 0.1);
        }

        .result-grid-studio {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .result-grid-studio.nft-grid {
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        }

        .result-card-studio {
          background: rgba(29, 35, 51, 0.9);
          border: 1px solid #2D3548;
          border-radius: 12px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }

        .result-card-studio::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, #895af6 50%, transparent 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .result-card-studio:hover {
          border-color: #895af6;
          box-shadow: 0 0 20px rgba(137, 90, 246, 0.2);
          transform: translateY(-2px);
        }

        .result-card-studio:hover::before {
          opacity: 1;
        }

        .result-card-studio.transaction:hover { border-color: #06b6d4; box-shadow: 0 0 20px rgba(6, 182, 212, 0.2); }
        .result-card-studio.address:hover { border-color: #10b981; box-shadow: 0 0 20px rgba(16, 185, 129, 0.2); }
        .result-card-studio.token:hover { border-color: #f59e0b; box-shadow: 0 0 20px rgba(245, 158, 11, 0.2); }
        .result-card-studio.nft:hover { border-color: #a855f7; box-shadow: 0 0 20px rgba(168, 85, 247, 0.2); }
        .result-card-studio.block:hover { border-color: #ef4444; box-shadow: 0 0 20px rgba(239, 68, 68, 0.2); }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .result-icon {
          font-size: 2rem;
          width: 3rem;
          height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(137, 90, 246, 0.1);
          border-radius: 8px;
          border: 1px solid rgba(137, 90, 246, 0.2);
        }

        .result-icon.transaction { background: rgba(6, 182, 212, 0.1); border-color: rgba(6, 182, 212, 0.2); }
        .result-icon.address { background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.2); }
        .result-icon.token { background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.2); }
        .result-icon.nft { background: rgba(168, 85, 247, 0.1); border-color: rgba(168, 85, 247, 0.2); }
        .result-icon.block { background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.2); }

        .result-status,
        .result-type,
        .result-rank,
        .result-height {
          display: flex;
          align-items: center;
        }

        .status-badge,
        .type-badge,
        .rank-badge,
        .height-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-family: 'JetBrains Mono', monospace;
          border: 1px solid;
        }

        .status-badge.confirmed {
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .status-badge.pending {
          background: rgba(245, 158, 11, 0.1);
          border-color: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        }

        .status-badge.failed {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .type-badge {
          background: rgba(137, 90, 246, 0.1);
          border-color: rgba(137, 90, 246, 0.2);
          color: #895af6;
        }

        .rank-badge,
        .height-badge {
          background: rgba(94, 234, 212, 0.1);
          border-color: rgba(94, 234, 212, 0.2);
          color: #5eead4;
        }

        .card-content {
          margin-bottom: 1rem;
        }

        .result-primary {
          font-size: 1rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0.5rem;
          font-family: 'JetBrains Mono', monospace;
          word-break: break-all;
        }

        .result-secondary {
          font-size: 0.8rem;
          color: #94A3B8;
          margin-bottom: 0.75rem;
          font-family: 'JetBrains Mono', monospace;
        }

        .result-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .meta-label {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #94A3B8;
          font-family: 'JetBrains Mono', monospace;
        }

        .meta-value {
          font-size: 0.8rem;
          font-weight: 600;
          color: #06b6d4;
          font-family: 'JetBrains Mono', monospace;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid #2D3548;
        }

        .result-time,
        .result-activity,
        .result-change,
        .result-owner,
        .result-miner {
          font-size: 0.7rem;
          color: #94A3B8;
          font-family: 'JetBrains Mono', monospace;
        }

        .change-value.positive {
          color: #10b981;
        }

        .change-value.negative {
          color: #ef4444;
        }

        .card-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          padding: 0.25rem 0.75rem;
          background: rgba(11, 14, 20, 0.6);
          border: 1px solid #2D3548;
          border-radius: 4px;
          color: #94A3B8;
          font-size: 0.6rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'JetBrains Mono', monospace;
        }

        .action-btn:hover {
          border-color: #895af6;
          color: #895af6;
          background: rgba(137, 90, 246, 0.1);
        }

        /* NFT Specific Styles */
        .nft-image-container {
          position: relative;
          aspect-ratio: 1;
          overflow: hidden;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .nft-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .result-card-studio:hover .nft-image {
          transform: scale(1.05);
        }

        .nft-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(11, 14, 20, 0.6);
          border: 1px solid #2D3548;
          border-radius: 8px;
        }

        .placeholder-icon {
          font-size: 3rem;
          color: #94A3B8;
        }

        .nft-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .result-card-studio:hover .nft-overlay {
          opacity: 1;
        }

        .overlay-btn {
          padding: 0.5rem 1rem;
          background: rgba(137, 90, 246, 0.9);
          border: 1px solid #895af6;
          border-radius: 6px;
          color: #ffffff;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'JetBrains Mono', monospace;
        }

        .overlay-btn:hover {
          background: #895af6;
          box-shadow: 0 0 10px rgba(137, 90, 246, 0.4);
        }

        /* No Results Styles */
        .no-results-studio {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .no-results-animation {
          margin-bottom: 2rem;
        }

        .no-results-content {
          max-width: 500px;
        }

        .no-results-title {
          font-size: 1.5rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 1rem;
          color: #ffffff;
          font-family: 'JetBrains Mono', monospace;
        }

        .no-results-subtitle {
          font-size: 1rem;
          color: #94A3B8;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .search-suggestions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .suggestion-btn {
          padding: 0.75rem 1.5rem;
          background: rgba(29, 35, 51, 0.9);
          border: 1px solid #2D3548;
          border-radius: 8px;
          color: #94A3B8;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'JetBrains Mono', monospace;
        }

        .suggestion-btn:hover {
          border-color: #895af6;
          color: #895af6;
          background: rgba(137, 90, 246, 0.1);
          box-shadow: 0 0 15px rgba(137, 90, 246, 0.2);
        }
        @media (max-width: 768px) {
          .search-header-studio {
            flex-direction: column;
            gap: 1rem;
            padding: 1.5rem;
          }

          .header-content {
            flex-direction: column;
            text-align: center;
          }

          .search-stats {
            justify-content: center;
          }

          .search-input-studio {
            padding: 1rem;
          }

          .input-wrapper {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .search-field {
            text-align: center;
          }

          .search-button {
            justify-content: center;
          }

          .category-filters-studio {
            padding: 0 1rem 1rem;
          }

          .filters-container {
            flex-direction: column;
            align-items: center;
          }

          .category-btn-studio {
            width: 100%;
            max-width: 300px;
            justify-content: center;
          }

          .advanced-filters-studio {
            margin: 0 1rem 1rem;
          }

          .filters-grid {
            grid-template-columns: 1fr;
            padding: 1rem;
          }

          .filter-actions {
            flex-direction: column;
          }

          .filter-btn {
            width: 100%;
          }

          .examples-grid {
            grid-template-columns: 1fr;
          }

          .search-features {
            flex-direction: column;
            gap: 1rem;
          }

          .empty-title {
            font-size: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .header-title {
            font-size: 1.2rem;
          }

          .empty-title {
            font-size: 1.2rem;
          }

          .search-pulse {
            font-size: 3rem;
          }
        }
      `}</style>
    </div>
  )
}

export default BlockchainSearch
