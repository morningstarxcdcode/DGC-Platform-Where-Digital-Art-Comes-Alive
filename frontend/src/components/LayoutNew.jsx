/**
 * Layout Component - Premium Professional Design
 * Author: Sourav Rajak (morningstarxcdcode)
 * Version: 2.0.0
 */

import React, { useState, useEffect } from 'react'
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
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location])

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

  const navLinks = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/generate', label: 'Create', icon: '✨' },
    { path: '/marketplace', label: 'Marketplace', icon: '🛒' },
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  ]

  return (
    <div className="app">
      {/* Premium Header */}
      <header className={`premium-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-glow"></div>
        <div className="container">
          <nav className="premium-nav">
            {/* Logo */}
            <Link to="/" className="nav-logo">
              <div className="logo-icon">
                <span className="logo-emoji">🌟</span>
              </div>
              <div className="logo-text">
                <span className="logo-name">DGC</span>
                <span className="logo-tagline">Platform</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <ul className="nav-menu">
              {navLinks.map(link => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                  >
                    <span className="nav-icon">{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
              {isConnected && (
                <li>
                  <Link 
                    to="/profile" 
                    className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
                  >
                    <span className="nav-icon">👤</span>
                    <span>Profile</span>
                  </Link>
                </li>
              )}
            </ul>

            {/* Wallet Section */}
            <div className="wallet-section">
              {!isConnected ? (
                <div className="wallet-connecting">
                  <div className="connecting-pulse"></div>
                  <span>Initializing...</span>
                </div>
              ) : (
                <div className="wallet-connected">
                  {!isCorrectNetwork && (
                    <button 
                      className="network-warning" 
                      onClick={() => switchNetwork(targetNetwork)}
                    >
                      <span className="warning-icon">⚠️</span>
                      <span>Wrong Network</span>
                    </button>
                  )}
                  
                  <div className="wallet-chip">
                    <div className="wallet-type">
                      <span className="type-icon">{isAutoWallet ? '🪄' : '🦊'}</span>
                      <span className="type-label">{isAutoWallet ? 'Magic' : 'MetaMask'}</span>
                      <span className="live-dot"></span>
                    </div>
                    <div className="wallet-divider"></div>
                    <div className="wallet-info">
                      <span className="wallet-address">{formatAddress(address)}</span>
                      <span className="wallet-balance">{formatBalance(balance)} ETH</span>
                    </div>
                  </div>
                  
                  {!isAutoWallet && (
                    <button className="disconnect-btn" onClick={disconnect}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className={`mobile-toggle ${mobileMenuOpen ? 'open' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </nav>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-inner">
            {navLinks.map(link => (
              <Link 
                key={link.path}
                to={link.path} 
                className={`mobile-link ${isActive(link.path) ? 'active' : ''}`}
              >
                <span className="mobile-icon">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
            {isConnected && (
              <Link 
                to="/profile" 
                className={`mobile-link ${isActive('/profile') ? 'active' : ''}`}
              >
                <span className="mobile-icon">👤</span>
                <span>Profile</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="container">
          <div className="premium-alert alert-error">
            <span className="alert-icon">⚠️</span>
            <span className="alert-text">{error}</span>
            <button className="alert-close">×</button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="main-content">
        <AutoWalletStatus />
        {children}
      </main>

      {/* Premium Footer */}
      <footer className="premium-footer">
        <div className="footer-glow"></div>
        <div className="container">
          <div className="footer-main">
            <div className="footer-brand">
              <div className="brand-logo">
                <span className="logo-emoji">🌟</span>
                <span className="logo-name">DGC Platform</span>
              </div>
              <p className="brand-desc">
                The world's first platform for living, breathing NFTs that respond 
                to emotions and evolve over time.
              </p>
              <div className="social-links">
                <a href="#" className="social-link" aria-label="Twitter">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="#" className="social-link" aria-label="Discord">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/></svg>
                </a>
                <a href="#" className="social-link" aria-label="GitHub">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                </a>
              </div>
            </div>

            <div className="footer-links-grid">
              <div className="footer-section">
                <h5>Platform</h5>
                <ul>
                  <li><Link to="/">Home</Link></li>
                  <li><Link to="/marketplace">Marketplace</Link></li>
                  <li><Link to="/generate">Create</Link></li>
                  <li><Link to="/dashboard">Dashboard</Link></li>
                </ul>
              </div>
              <div className="footer-section">
                <h5>Features</h5>
                <ul>
                  <li><a href="#">Content DNA™</a></li>
                  <li><a href="#">Emotional AI</a></li>
                  <li><a href="#">Multi-Agent</a></li>
                  <li><a href="#">Evolution</a></li>
                </ul>
              </div>
              <div className="footer-section">
                <h5>Resources</h5>
                <ul>
                  <li><a href="#">Documentation</a></li>
                  <li><a href="#">API Reference</a></li>
                  <li><a href="#">Support</a></li>
                  <li><a href="#">Blog</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© 2024 DGC Platform. Built by <a href="#">Sourav Rajak</a></span>
            <div className="footer-legal">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        /* ========== PREMIUM HEADER ========== */
        .premium-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          padding: 16px 0;
          transition: all 0.3s ease;
        }

        .premium-header.scrolled {
          background: rgba(10, 10, 20, 0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          padding: 12px 0;
        }

        .header-glow {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 100px;
          background: radial-gradient(ellipse, rgba(137, 90, 246, 0.15) 0%, transparent 70%);
          pointer-events: none;
        }

        .premium-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }

        /* Logo */
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }

        .logo-icon {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--gradient-primary);
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(137, 90, 246, 0.4);
        }

        .logo-emoji {
          font-size: 22px;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
        }

        .logo-name {
          font-family: var(--font-family-display);
          font-size: 18px;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }

        .logo-tagline {
          font-size: 11px;
          color: var(--text-tertiary);
          letter-spacing: 0.02em;
        }

        /* Nav Menu */
        .nav-menu {
          display: flex;
          align-items: center;
          gap: 8px;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          transition: all 0.2s;
        }

        .nav-link:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }

        .nav-link.active {
          color: var(--text-primary);
          background: rgba(137, 90, 246, 0.15);
        }

        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -16px;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 3px;
          background: var(--gradient-primary);
          border-radius: 3px;
        }

        .nav-icon {
          font-size: 16px;
        }

        /* Wallet Section */
        .wallet-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .wallet-connecting {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 18px;
          background: rgba(137, 90, 246, 0.1);
          border: 1px solid rgba(137, 90, 246, 0.2);
          border-radius: 12px;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .connecting-pulse {
          width: 8px;
          height: 8px;
          background: var(--primary-color);
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }

        .network-warning {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: rgba(251, 191, 36, 0.15);
          border: 1px solid rgba(251, 191, 36, 0.3);
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          color: #fbbf24;
          cursor: pointer;
          transition: all 0.2s;
        }

        .network-warning:hover {
          background: rgba(251, 191, 36, 0.25);
        }

        .wallet-chip {
          display: flex;
          align-items: center;
          gap: 0;
          background: rgba(22, 22, 42, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          overflow: hidden;
        }

        .wallet-type {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: rgba(137, 90, 246, 0.1);
        }

        .type-icon {
          font-size: 16px;
        }

        .type-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--primary-color);
        }

        .live-dot {
          width: 6px;
          height: 6px;
          background: #22c55e;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .wallet-divider {
          width: 1px;
          height: 24px;
          background: rgba(255, 255, 255, 0.08);
        }

        .wallet-info {
          display: flex;
          flex-direction: column;
          padding: 8px 14px;
        }

        .wallet-address {
          font-family: var(--font-family-mono);
          font-size: 12px;
          font-weight: 600;
        }

        .wallet-balance {
          font-size: 11px;
          color: var(--text-tertiary);
        }

        .disconnect-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 10px;
          color: #ef4444;
          cursor: pointer;
          transition: all 0.2s;
        }

        .disconnect-btn:hover {
          background: rgba(239, 68, 68, 0.2);
        }

        /* Mobile Toggle */
        .mobile-toggle {
          display: none;
          flex-direction: column;
          gap: 5px;
          padding: 8px;
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .mobile-toggle span {
          display: block;
          width: 24px;
          height: 2px;
          background: var(--text-primary);
          transition: all 0.3s;
        }

        .mobile-toggle.open span:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }

        .mobile-toggle.open span:nth-child(2) {
          opacity: 0;
        }

        .mobile-toggle.open span:nth-child(3) {
          transform: rotate(-45deg) translate(5px, -5px);
        }

        /* Mobile Menu */
        .mobile-menu {
          position: fixed;
          top: 72px;
          left: 0;
          right: 0;
          background: rgba(10, 10, 20, 0.98);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          transform: translateY(-100%);
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }

        .mobile-menu.open {
          transform: translateY(0);
          opacity: 1;
          visibility: visible;
        }

        .mobile-menu-inner {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .mobile-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          transition: all 0.2s;
        }

        .mobile-link:hover,
        .mobile-link.active {
          background: rgba(137, 90, 246, 0.1);
          color: var(--text-primary);
        }

        .mobile-icon {
          font-size: 20px;
        }

        /* ========== ALERT ========== */
        .premium-alert {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          margin-top: 100px;
          margin-bottom: 20px;
          border-radius: 14px;
          font-size: 14px;
        }

        .alert-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
        }

        .alert-close {
          margin-left: auto;
          padding: 4px 8px;
          background: transparent;
          border: none;
          font-size: 18px;
          color: inherit;
          cursor: pointer;
          opacity: 0.7;
        }

        .alert-close:hover {
          opacity: 1;
        }

        /* ========== MAIN CONTENT ========== */
        .main-content {
          min-height: calc(100vh - 400px);
        }

        /* ========== PREMIUM FOOTER ========== */
        .premium-footer {
          position: relative;
          margin-top: 100px;
          padding: 80px 0 30px;
          background: rgba(10, 10, 20, 0.8);
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .footer-glow {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 200px;
          background: radial-gradient(ellipse, rgba(137, 90, 246, 0.1) 0%, transparent 70%);
          pointer-events: none;
        }

        .footer-main {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 60px;
          padding-bottom: 50px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .footer-brand {
          max-width: 320px;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }

        .brand-logo .logo-emoji {
          font-size: 28px;
        }

        .brand-logo .logo-name {
          font-family: var(--font-family-display);
          font-size: 20px;
          font-weight: 800;
        }

        .brand-desc {
          font-size: 14px;
          color: var(--text-tertiary);
          line-height: 1.7;
          margin-bottom: 24px;
        }

        .social-links {
          display: flex;
          gap: 12px;
        }

        .social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          color: var(--text-secondary);
          transition: all 0.2s;
        }

        .social-link:hover {
          background: rgba(137, 90, 246, 0.15);
          border-color: rgba(137, 90, 246, 0.3);
          color: var(--text-primary);
        }

        .social-link svg {
          width: 18px;
          height: 18px;
        }

        .footer-links-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
        }

        .footer-section h5 {
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 20px;
          color: var(--text-primary);
        }

        .footer-section ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-section li {
          margin-bottom: 12px;
        }

        .footer-section a {
          font-size: 14px;
          color: var(--text-tertiary);
          text-decoration: none;
          transition: color 0.2s;
        }

        .footer-section a:hover {
          color: var(--text-primary);
        }

        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 30px;
          font-size: 13px;
          color: var(--text-tertiary);
        }

        .footer-bottom a {
          color: var(--primary-color);
          text-decoration: none;
        }

        .footer-legal {
          display: flex;
          gap: 24px;
        }

        .footer-legal a {
          color: var(--text-tertiary);
        }

        .footer-legal a:hover {
          color: var(--text-primary);
        }

        /* ========== RESPONSIVE ========== */
        @media (max-width: 1024px) {
          .nav-menu {
            display: none;
          }

          .mobile-toggle {
            display: flex;
          }

          .footer-main {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .footer-brand {
            max-width: none;
          }
        }

        @media (max-width: 768px) {
          .wallet-chip {
            flex-direction: column;
            padding: 10px;
          }

          .wallet-type {
            width: 100%;
            justify-content: center;
            padding: 8px;
          }

          .wallet-divider {
            width: 100%;
            height: 1px;
          }

          .wallet-info {
            align-items: center;
          }

          .footer-links-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .footer-bottom {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .logo-text {
            display: none;
          }

          .footer-links-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

export default Layout
