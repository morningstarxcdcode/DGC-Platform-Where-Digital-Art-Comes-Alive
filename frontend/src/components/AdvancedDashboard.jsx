import React, { useState, useEffect } from 'react'
import { useWallet } from '../hooks/useWallet.jsx'

/**
 * Advanced Dashboard Component
 * 
 * Features:
 * - MetaMask Real-Time Dashboard
 * - 7-Block Multi-Agent AI System
 * - Blockchain Search with Autocomplete
 * - Content DNA Visualization
 * - Emotional AI Status
 */

const AGENTS = [
  { id: 1, name: 'Image Agent', icon: '🎨', description: 'Creates pictures from your words', status: 'ready' },
  { id: 2, name: 'Text Agent', icon: '📝', description: 'Writes stories and descriptions', status: 'ready' },
  { id: 3, name: 'Music Agent', icon: '🎵', description: 'Composes music for your NFTs', status: 'ready' },
  { id: 4, name: 'DNA Agent', icon: '🧬', description: 'Evolves your content over time', status: 'ready' },
  { id: 5, name: 'Emotion Agent', icon: '💖', description: 'Responds to your feelings', status: 'ready' },
  { id: 6, name: 'Search Agent', icon: '🔍', description: 'Finds blockchain data instantly', status: 'ready' },
  { id: 7, name: 'Analytics Agent', icon: '📊', description: 'Tracks your portfolio performance', status: 'ready' }
]

function AdvancedDashboard() {
  const { address, balance, isConnected, isAutoWallet } = useWallet()
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedAgents, setSelectedAgents] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [agentResults, setAgentResults] = useState({})
  const [isRunning, setIsRunning] = useState(false)
  const [dnaData, setDnaData] = useState(null)
  const [emotionState, setEmotionState] = useState(null)

  // Mock data for demonstration
  const [walletData, setWalletData] = useState({
    ethBalance: '0.00',
    tokens: [],
    nfts: [],
    transactions: [],
    gasPrice: '0'
  })

  useEffect(() => {
    if (isConnected && address) {
      // Update wallet data
      setWalletData(prev => ({
        ...prev,
        ethBalance: balance || '0.00'
      }))
    }
  }, [isConnected, address, balance])

  const handleAgentToggle = (agentId) => {
    setSelectedAgents(prev => {
      if (prev.includes(agentId)) {
        return prev.filter(id => id !== agentId)
      }
      return [...prev, agentId]
    })
  }

  const handleSelectAllAgents = () => {
    if (selectedAgents.length === AGENTS.length) {
      setSelectedAgents([])
    } else {
      setSelectedAgents(AGENTS.map(a => a.id))
    }
  }

  const handleRunAgents = async () => {
    if (selectedAgents.length === 0) {
      alert('Please select at least one agent')
      return
    }

    setIsRunning(true)
    setAgentResults({})

    // Simulate running agents
    for (const agentId of selectedAgents) {
      await new Promise(resolve => setTimeout(resolve, 500))
      setAgentResults(prev => ({
        ...prev,
        [agentId]: { status: 'completed', result: `Agent ${agentId} completed successfully` }
      }))
    }

    setIsRunning(false)
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    
    if (query.length < 2) {
      setSearchSuggestions([])
      return
    }

    // Generate suggestions based on query
    const suggestions = [
      { type: 'transaction', value: `${query}...transaction`, icon: '🔗' },
      { type: 'address', value: `${query}...address`, icon: '👛' },
      { type: 'token', value: `${query} token`, icon: '🪙' },
      { type: 'nft', value: `${query} NFT`, icon: '🖼️' },
      { type: 'block', value: `Block ${query}`, icon: '📦' }
    ]
    setSearchSuggestions(suggestions)
  }

  const renderOverviewTab = () => (
    <div className="dashboard-overview">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-label">ETH Balance</div>
            <div className="stat-value">{parseFloat(walletData.ethBalance).toFixed(4)} ETH</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🖼️</div>
          <div className="stat-content">
            <div className="stat-label">NFTs Owned</div>
            <div className="stat-value">{walletData.nfts.length}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🪙</div>
          <div className="stat-content">
            <div className="stat-label">Tokens</div>
            <div className="stat-value">{walletData.tokens.length}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⛽</div>
          <div className="stat-content">
            <div className="stat-label">Gas Price</div>
            <div className="stat-value">{walletData.gasPrice} Gwei</div>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Recent Activity</h3>
        {walletData.transactions.length === 0 ? (
          <div className="empty-state">No recent transactions</div>
        ) : (
          <div className="transaction-list">
            {walletData.transactions.map((tx, index) => (
              <div key={index} className="transaction-item">
                <span className="tx-hash">{tx.hash}</span>
                <span className="tx-status">{tx.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderAgentsTab = () => (
    <div className="agents-dashboard">
      <div className="agents-header">
        <h3>🤖 7-Block Multi-Agent AI System</h3>
        <div className="agents-controls">
          <button 
            className="btn btn-secondary"
            onClick={handleSelectAllAgents}
          >
            {selectedAgents.length === AGENTS.length ? 'Deselect All' : 'Select All'}
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleRunAgents}
            disabled={isRunning || selectedAgents.length === 0}
          >
            {isRunning ? '🔄 Running...' : '🚀 Run Selected'}
          </button>
        </div>
      </div>

      <div className="agents-grid">
        {AGENTS.map(agent => (
          <div 
            key={agent.id}
            className={`agent-card ${selectedAgents.includes(agent.id) ? 'selected' : ''}`}
            onClick={() => handleAgentToggle(agent.id)}
          >
            <div className="agent-icon">{agent.icon}</div>
            <div className="agent-info">
              <div className="agent-name">{agent.name}</div>
              <div className="agent-description">{agent.description}</div>
            </div>
            <div className="agent-status">
              {agentResults[agent.id] ? (
                <span className="status-completed">✅ Done</span>
              ) : isRunning && selectedAgents.includes(agent.id) ? (
                <span className="status-running">🔄 Running</span>
              ) : (
                <span className="status-ready">⚡ Ready</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {Object.keys(agentResults).length > 0 && (
        <div className="agent-results">
          <h4>Results</h4>
          {Object.entries(agentResults).map(([agentId, result]) => {
            const agent = AGENTS.find(a => a.id === parseInt(agentId))
            return (
              <div key={agentId} className="result-item">
                <span className="result-agent">{agent?.icon} {agent?.name}</span>
                <span className="result-text">{result.result}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )

  const renderSearchTab = () => (
    <div className="search-dashboard">
      <div className="search-header">
        <h3>🔍 Smart Blockchain Search</h3>
      </div>

      <div className="search-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Search transactions, addresses, tokens, NFTs, blocks..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <button className="search-btn">🔍</button>
        </div>

        {searchSuggestions.length > 0 && (
          <div className="search-suggestions">
            {searchSuggestions.map((suggestion, index) => (
              <div 
                key={index}
                className="suggestion-item"
                onClick={() => {
                  setSearchQuery(suggestion.value)
                  setSearchSuggestions([])
                }}
              >
                <span className="suggestion-icon">{suggestion.icon}</span>
                <span className="suggestion-text">{suggestion.value}</span>
                <span className="suggestion-type">{suggestion.type}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="search-categories">
        <button className="category-btn">🔗 Transactions</button>
        <button className="category-btn">👛 Addresses</button>
        <button className="category-btn">🪙 Tokens</button>
        <button className="category-btn">🖼️ NFTs</button>
        <button className="category-btn">📦 Blocks</button>
      </div>
    </div>
  )

  const renderDnaTab = () => (
    <div className="dna-dashboard">
      <div className="dna-header">
        <h3>🧬 Content DNA System™</h3>
        <p>Every NFT has unique genetic code that determines its characteristics</p>
      </div>

      {dnaData ? (
        <div className="dna-visualization">
          <div className="dna-helix">
            {/* DNA Helix visualization would go here */}
            <div className="dna-strand">
              <div className="gene" style={{ backgroundColor: '#ff6b6b' }}>COLOR</div>
              <div className="gene" style={{ backgroundColor: '#4ecdc4' }}>STYLE</div>
              <div className="gene" style={{ backgroundColor: '#45b7d1' }}>MOOD</div>
              <div className="gene" style={{ backgroundColor: '#96e6a1' }}>COMPLEXITY</div>
              <div className="gene" style={{ backgroundColor: '#ffeaa7' }}>ENERGY</div>
            </div>
          </div>
          <div className="dna-info">
            <div className="dna-hash">Hash: {dnaData.dna_hash}</div>
            <div className="dna-generation">Generation: {dnaData.generation}</div>
            <div className="dna-rarity">Rarity: {dnaData.rarity_score}%</div>
          </div>
        </div>
      ) : (
        <div className="dna-empty">
          <div className="empty-icon">🧬</div>
          <p>No DNA data available. Generate content to see its unique DNA.</p>
        </div>
      )}

      <div className="dna-features">
        <div className="feature-card">
          <div className="feature-icon">🔬</div>
          <h4>Breeding</h4>
          <p>Combine two NFTs to create offspring with inherited traits</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🌱</div>
          <h4>Evolution</h4>
          <p>Watch your NFT evolve based on environmental factors</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">⭐</div>
          <h4>Rarity</h4>
          <p>Rare genetic combinations become extremely valuable</p>
        </div>
      </div>
    </div>
  )

  const renderEmotionTab = () => (
    <div className="emotion-dashboard">
      <div className="emotion-header">
        <h3>💖 Emotional Intelligence™</h3>
        <p>NFTs that respond to and adapt based on your emotional state</p>
      </div>

      <div className="emotion-detector">
        <div className="detector-icon">
          {emotionState ? (
            <span className="emotion-display">
              {emotionState.primary_emotion === 'HAPPY' && '😊'}
              {emotionState.primary_emotion === 'SAD' && '😢'}
              {emotionState.primary_emotion === 'ANGRY' && '😠'}
              {emotionState.primary_emotion === 'NEUTRAL' && '😐'}
              {emotionState.primary_emotion === 'EXCITED' && '🤩'}
              {emotionState.primary_emotion === 'CALM' && '😌'}
            </span>
          ) : (
            <span>😊</span>
          )}
        </div>
        <div className="detector-status">
          {emotionState ? (
            <div>
              <div className="emotion-primary">{emotionState.primary_emotion}</div>
              <div className="emotion-confidence">Confidence: {Math.round(emotionState.confidence * 100)}%</div>
            </div>
          ) : (
            <div className="detector-prompt">
              <p>Enable emotion detection to make your NFTs respond to your feelings</p>
              <button className="btn btn-primary">📷 Enable Camera</button>
            </div>
          )}
        </div>
      </div>

      <div className="emotion-features">
        <div className="feature-card">
          <div className="feature-icon">🎨</div>
          <h4>Color Adaptation</h4>
          <p>Art changes colors based on your mood</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🎬</div>
          <h4>Animation Response</h4>
          <p>Animations speed up or slow down with your energy</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔊</div>
          <h4>Sound Therapy</h4>
          <p>Music adapts to provide emotional support</p>
        </div>
      </div>
    </div>
  )

  if (!isConnected) {
    return (
      <div className="dashboard-connecting">
        <div className="connecting-animation">🪄</div>
        <h2>Setting up your dashboard...</h2>
        <p>Please wait while we connect your wallet</p>
      </div>
    )
  }

  return (
    <div className="advanced-dashboard">
      <div className="dashboard-header">
        <h2>🌟 Advanced Dashboard</h2>
        <div className="wallet-badge">
          {isAutoWallet ? '🪄 Magic Wallet' : '🦊 MetaMask'}
          <span className="address">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab ${activeTab === 'agents' ? 'active' : ''}`}
          onClick={() => setActiveTab('agents')}
        >
          🤖 Agents
        </button>
        <button 
          className={`tab ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          🔍 Search
        </button>
        <button 
          className={`tab ${activeTab === 'dna' ? 'active' : ''}`}
          onClick={() => setActiveTab('dna')}
        >
          🧬 DNA
        </button>
        <button 
          className={`tab ${activeTab === 'emotion' ? 'active' : ''}`}
          onClick={() => setActiveTab('emotion')}
        >
          💖 Emotion
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'agents' && renderAgentsTab()}
        {activeTab === 'search' && renderSearchTab()}
        {activeTab === 'dna' && renderDnaTab()}
        {activeTab === 'emotion' && renderEmotionTab()}
      </div>

      <style jsx>{`
        .advanced-dashboard {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-radius: 16px;
          padding: 2rem;
          margin: 2rem 0;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .dashboard-header h2 {
          margin: 0;
          color: #fff;
        }

        .wallet-badge {
          background: rgba(100, 108, 255, 0.2);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          color: #fff;
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .wallet-badge .address {
          font-family: monospace;
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .dashboard-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .tab {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .tab.active {
          background: #646cff;
        }

        .dashboard-content {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 1.5rem;
          min-height: 400px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-icon {
          font-size: 2rem;
        }

        .stat-label {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: #fff;
        }

        .agents-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .agent-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          border: 2px solid transparent;
        }

        .agent-card:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .agent-card.selected {
          border-color: #646cff;
          background: rgba(100, 108, 255, 0.2);
        }

        .agent-icon {
          font-size: 2rem;
        }

        .agent-info {
          flex: 1;
        }

        .agent-name {
          font-weight: bold;
          color: #fff;
        }

        .agent-description {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .search-input-wrapper {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .search-input {
          flex: 1;
          padding: 1rem;
          border-radius: 12px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          font-size: 1rem;
        }

        .search-input:focus {
          outline: none;
          border-color: #646cff;
        }

        .search-btn {
          padding: 1rem 1.5rem;
          border-radius: 12px;
          border: none;
          background: #646cff;
          color: #fff;
          cursor: pointer;
        }

        .search-suggestions {
          background: rgba(0, 0, 0, 0.8);
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .suggestion-item {
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .suggestion-item:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .suggestion-type {
          margin-left: auto;
          font-size: 0.8rem;
          opacity: 0.7;
        }

        .search-categories {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .category-btn {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: transparent;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s;
        }

        .category-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .dna-visualization,
        .emotion-detector {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          margin-bottom: 2rem;
        }

        .dna-strand {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin: 2rem 0;
        }

        .gene {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: bold;
          color: #000;
        }

        .dna-features,
        .emotion-features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
        }

        .feature-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .feature-card h4 {
          margin: 0.5rem 0;
          color: #fff;
        }

        .feature-card p {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }

        .detector-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .emotion-primary {
          font-size: 1.5rem;
          font-weight: bold;
          color: #fff;
        }

        .emotion-confidence {
          color: rgba(255, 255, 255, 0.7);
        }

        .empty-state,
        .dna-empty {
          text-align: center;
          padding: 2rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .agents-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .agents-controls {
          display: flex;
          gap: 0.5rem;
        }

        .agent-results {
          margin-top: 2rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1rem;
        }

        .result-item {
          padding: 0.75rem;
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .result-item:last-child {
          border-bottom: none;
        }

        .dashboard-connecting {
          text-align: center;
          padding: 4rem;
        }

        .connecting-animation {
          font-size: 4rem;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #646cff;
          color: #fff;
        }

        .btn-primary:hover {
          background: #535bf2;
        }

        .btn-primary:disabled {
          background: #666;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.2);
          color: #fff;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  )
}

export default AdvancedDashboard
