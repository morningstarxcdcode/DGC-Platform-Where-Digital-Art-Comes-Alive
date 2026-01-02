import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet.jsx'
import AutoWalletStatus from './AutoWalletStatus.jsx'

function Layout({ children }) {
  const { 
    address, 
    isConnected, 
    balance, 
    isCorrectNetwork, 
    targetNetwork,
    isAutoWallet,
    connect, 
    disconnect, 
    switchNetwork,
    error 
  } = useWallet()
  
  const location = useLocation()

  const formatAddress = (addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const formatBalance = (bal) => {
    if (!bal) return '0'
    return parseFloat(bal).toFixed(4)
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <nav className="nav">
            <Link to="/" className="nav-brand">
              <span className="nav-brand-name">🌟 DGC Platform</span>
              <span className="nav-brand-tagline">Where Digital Art Comes Alive</span>
            </Link>
            
            <ul className="nav-links">
              <li>
                <Link to="/" className={isActive('/') ? 'active' : ''}>
                  🏠 Home
                </Link>
              </li>
              <li>
                <Link to="/generate" className={isActive('/generate') ? 'active' : ''}>
                  🎨 Create
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className={isActive('/marketplace') ? 'active' : ''}>
                  🛒 Marketplace
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>
                  📊 Dashboard
                </Link>
              </li>
              {isConnected && (
                <li>
                  <Link to="/profile" className={isActive('/profile') ? 'active' : ''}>
                    👤 Profile
                  </Link>
                </li>
              )}
            </ul>

            <div className="wallet-info">
              {!isConnected ? (
                <div className="wallet-connecting">
                  <span className="connecting-text">
                    <span className="pulse">🪄</span> Creating magic wallet...
                  </span>
                </div>
              ) : (
                <div className="wallet-connected">
                  {!isCorrectNetwork && (
                    <button 
                      className="btn btn-warning btn-sm" 
                      onClick={() => switchNetwork(targetNetwork)}
                    >
                      ⚠️ Switch Network
                    </button>
                  )}
                  
                  <div className="wallet-display">
                    <div className="wallet-type">
                      {isAutoWallet ? '🪄 Magic Wallet' : '🦊 MetaMask'}
                      <span className="live-indicator"></span>
                    </div>
                    <div className="wallet-details">
                      <span className="wallet-address">{formatAddress(address)}</span>
                      <span className="wallet-balance">{formatBalance(balance)} ETH</span>
                    </div>
                  </div>
                  
                  {!isAutoWallet && (
                    <button className="btn btn-ghost btn-sm" onClick={disconnect}>
                      Disconnect
                    </button>
                  )}
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      {error && (
        <div className="container">
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            <div className="alert-content">{error}</div>
          </div>
        </div>
      )}

      <main className="container">
        <AutoWalletStatus />
        {children}
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>🌟 DGC Platform</h4>
              <p className="text-muted">The world's first platform for living, breathing NFTs that respond to emotions and evolve over time.</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul className="footer-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/generate">Create NFT</Link></li>
                <li><Link to="/marketplace">Marketplace</Link></li>
                <li><Link to="/dashboard">Dashboard</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Features</h4>
              <ul className="footer-links">
                <li><a href="#dna">🧬 Content DNA</a></li>
                <li><a href="#emotion">💖 Emotional AI</a></li>
                <li><a href="#agents">🤖 Multi-Agent AI</a></li>
                <li><a href="#search">🔍 Blockchain Search</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Technology</h4>
              <ul className="footer-links">
                <li><span>⚡ React + Vite</span></li>
                <li><span>🔗 Ethereum / EVM</span></li>
                <li><span>📦 IPFS Storage</span></li>
                <li><span>🐍 FastAPI Backend</span></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 DGC Platform. Where Digital Art Comes Alive.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout