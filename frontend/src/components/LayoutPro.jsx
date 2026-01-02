/**
 * Premium Layout Component - Ultra Professional Design
 * Author: Sourav Rajak (morningstarxcdcode)
 * Version: 3.0.0 - Professional Edition
 */

import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet.jsx'

export default function Layout({ children }) {
  const location = useLocation()
  const { address, isConnected, balance, connect, disconnect } = useWallet()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [walletDropdown, setWalletDropdown] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location])

  const navLinks = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/generate', label: 'Create', icon: '✨' },
    { path: '/marketplace', label: 'Explore', icon: '🌐' },
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ]

  const formatAddress = (addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <div className="app-layout">
      {/* Navigation */}
      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          {/* Logo */}
          <Link to="/" className="logo">
            <div className="logo-icon">
              <span className="logo-gradient">DGC</span>
            </div>
            <span className="logo-text">Platform</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="nav-links">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              >
                <span className="nav-icon">{link.icon}</span>
                <span className="nav-label">{link.label}</span>
                {location.pathname === link.path && <span className="active-indicator"></span>}
              </Link>
            ))}
          </nav>

          {/* Wallet Section */}
          <div className="nav-actions">
            {isConnected ? (
              <div className="wallet-connected">
                <button 
                  className="wallet-btn"
                  onClick={() => setWalletDropdown(!walletDropdown)}
                >
                  <div className="wallet-status">
                    <span className="status-dot"></span>
                    <span className="wallet-label">Connected</span>
                  </div>
                  <div className="wallet-info">
                    <span className="wallet-address">{formatAddress(address)}</span>
                    <span className="wallet-balance">{parseFloat(balance || 0).toFixed(3)} ETH</span>
                  </div>
                  <span className="dropdown-arrow">▼</span>
                </button>

                {walletDropdown && (
                  <div className="wallet-dropdown">
                    <div className="dropdown-header">
                      <span className="dropdown-label">Wallet</span>
                      <span className="dropdown-address">{formatAddress(address)}</span>
                    </div>
                    <div className="dropdown-balance">
                      <span className="balance-label">Balance</span>
                      <span className="balance-value">{parseFloat(balance || 0).toFixed(4)} ETH</span>
                    </div>
                    <div className="dropdown-actions">
                      <Link to="/profile" className="dropdown-link">
                        <span>👤</span> My Profile
                      </Link>
                      <Link to="/dashboard" className="dropdown-link">
                        <span>📊</span> Dashboard
                      </Link>
                      <button onClick={disconnect} className="dropdown-link danger">
                        <span>🔌</span> Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={connect} className="connect-btn">
                <span className="btn-icon">🔗</span>
                <span>Connect Wallet</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              className={`mobile-toggle ${mobileMenuOpen ? 'open' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <nav className="mobile-nav">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`mobile-link ${location.pathname === link.path ? 'active' : ''}`}
              >
                <span className="mobile-icon">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
          {!isConnected && (
            <button onClick={connect} className="mobile-connect-btn">
              <span>🔗</span> Connect Wallet
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-grid">
            {/* Brand */}
            <div className="footer-brand">
              <Link to="/" className="footer-logo">
                <span className="logo-gradient">DGC</span>
                <span>Platform</span>
              </Link>
              <p className="footer-desc">
                The next generation AI-powered NFT creation platform with genetic evolution and on-chain provenance.
              </p>
              <div className="social-links">
                {[
                  { icon: '𝕏', label: 'Twitter' },
                  { icon: '📱', label: 'Discord' },
                  { icon: '📷', label: 'Instagram' },
                  { icon: '💻', label: 'GitHub' },
                ].map((social, i) => (
                  <a key={i} href="#" className="social-link" title={social.label}>
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-links">
              <h4>Platform</h4>
              <ul>
                <li><Link to="/marketplace">Explore</Link></li>
                <li><Link to="/generate">Create</Link></li>
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><Link to="/profile">Profile</Link></li>
              </ul>
            </div>

            <div className="footer-links">
              <h4>Resources</h4>
              <ul>
                <li><a href="#">Documentation</a></li>
                <li><a href="#">API</a></li>
                <li><a href="#">Support</a></li>
                <li><a href="#">FAQ</a></li>
              </ul>
            </div>

            <div className="footer-links">
              <h4>Legal</h4>
              <ul>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2025 DGC Platform. Built with ❤️ by Sourav Rajak</p>
            <div className="footer-badges">
              <span className="badge">🔒 Secure</span>
              <span className="badge">⚡ Fast</span>
              <span className="badge">🌐 Decentralized</span>
            </div>
          </div>
        </div>
      </footer>

      <style>{styles}</style>
    </div>
  )
}

const styles = `
  .app-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: linear-gradient(180deg, #0a0a14 0%, #12121f 50%, #0a0a14 100%);
    color: #ffffff;
  }

  /* ===== NAVBAR ===== */
  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    padding: 16px 0;
    transition: all 0.3s ease;
  }

  .navbar.scrolled {
    padding: 12px 0;
    background: rgba(10, 10, 20, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .nav-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  /* Logo */
  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: inherit;
  }

  .logo-icon {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.05) 100%);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 12px;
  }

  .logo-gradient {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 18px;
    font-weight: 800;
    background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .logo-text {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  /* Nav Links */
  .nav-links {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 16px;
  }

  .nav-link {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    color: rgba(255, 255, 255, 0.7);
    transition: all 0.3s ease;
  }

  .nav-link:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.05);
  }

  .nav-link.active {
    color: #ffffff;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0.1) 100%);
  }

  .nav-icon {
    font-size: 16px;
  }

  .active-indicator {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 3px;
    background: linear-gradient(90deg, #8B5CF6, #EC4899);
    border-radius: 2px;
  }

  /* Nav Actions */
  .nav-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  /* Connect Button */
  .connect-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 24px;
    background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
    border: none;
    border-radius: 14px;
    font-size: 14px;
    font-weight: 600;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 0 0 1px rgba(139, 92, 246, 0.5), 0 10px 30px -10px rgba(139, 92, 246, 0.5);
  }

  .connect-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 0 1px rgba(139, 92, 246, 0.8), 0 15px 40px -10px rgba(139, 92, 246, 0.6);
  }

  /* Wallet Connected */
  .wallet-connected {
    position: relative;
  }

  .wallet-btn {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 10px 16px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    color: white;
    cursor: pointer;
    transition: all 0.3s;
  }

  .wallet-btn:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(139, 92, 246, 0.3);
  }

  .wallet-status {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-right: 16px;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
  }

  .status-dot {
    width: 8px;
    height: 8px;
    background: #10B981;
    border-radius: 50%;
    box-shadow: 0 0 10px #10B981;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .wallet-label {
    font-size: 12px;
    color: #10B981;
    font-weight: 500;
  }

  .wallet-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .wallet-address {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    font-weight: 500;
  }

  .wallet-balance {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  .dropdown-arrow {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.5);
    transition: transform 0.3s;
  }

  .wallet-btn:hover .dropdown-arrow {
    transform: rotate(180deg);
  }

  /* Wallet Dropdown */
  .wallet-dropdown {
    position: absolute;
    top: calc(100% + 12px);
    right: 0;
    width: 280px;
    background: rgba(20, 20, 35, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    overflow: hidden;
    animation: dropdownIn 0.2s ease-out;
  }

  @keyframes dropdownIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .dropdown-header {
    padding: 20px;
    background: rgba(139, 92, 246, 0.1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .dropdown-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    display: block;
    margin-bottom: 4px;
  }

  .dropdown-address {
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    font-weight: 500;
  }

  .dropdown-balance {
    padding: 16px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .balance-label {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
  }

  .balance-value {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 16px;
    font-weight: 700;
  }

  .dropdown-actions {
    padding: 12px;
  }

  .dropdown-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    background: none;
    border: none;
    width: 100%;
    cursor: pointer;
    transition: all 0.2s;
  }

  .dropdown-link:hover {
    background: rgba(255, 255, 255, 0.05);
    color: white;
  }

  .dropdown-link.danger {
    color: #EF4444;
  }

  .dropdown-link.danger:hover {
    background: rgba(239, 68, 68, 0.1);
  }

  /* Mobile Toggle */
  .mobile-toggle {
    display: none;
    flex-direction: column;
    gap: 5px;
    padding: 10px;
    background: none;
    border: none;
    cursor: pointer;
  }

  .mobile-toggle span {
    display: block;
    width: 24px;
    height: 2px;
    background: white;
    border-radius: 2px;
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
    display: none;
    position: fixed;
    top: 76px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(10, 10, 20, 0.98);
    backdrop-filter: blur(20px);
    padding: 24px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  }

  .mobile-menu.open {
    transform: translateX(0);
  }

  .mobile-nav {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .mobile-link {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 18px 20px;
    border-radius: 16px;
    font-size: 16px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    transition: all 0.2s;
  }

  .mobile-link:hover,
  .mobile-link.active {
    background: rgba(139, 92, 246, 0.1);
    color: white;
  }

  .mobile-icon {
    font-size: 20px;
  }

  .mobile-connect-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    margin-top: 24px;
    padding: 18px;
    background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
    border: none;
    border-radius: 16px;
    font-size: 16px;
    font-weight: 600;
    color: white;
    cursor: pointer;
  }

  /* ===== MAIN CONTENT ===== */
  .main-content {
    flex: 1;
    min-height: calc(100vh - 100px);
  }

  /* ===== FOOTER ===== */
  .footer {
    background: rgba(0, 0, 0, 0.3);
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    padding: 80px 0 40px;
    margin-top: auto;
  }

  .footer-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
  }

  .footer-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 48px;
    margin-bottom: 48px;
  }

  .footer-brand {
    max-width: 320px;
  }

  .footer-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    color: inherit;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 16px;
  }

  .footer-desc {
    font-size: 14px;
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 24px;
  }

  .social-links {
    display: flex;
    gap: 12px;
  }

  .social-link {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    font-size: 18px;
    text-decoration: none;
    transition: all 0.3s;
  }

  .social-link:hover {
    background: rgba(139, 92, 246, 0.2);
    border-color: rgba(139, 92, 246, 0.4);
    transform: translateY(-2px);
  }

  .footer-links h4 {
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(255, 255, 255, 0.9);
    margin: 0 0 20px;
  }

  .footer-links ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .footer-links li {
    margin-bottom: 12px;
  }

  .footer-links a {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    text-decoration: none;
    transition: color 0.2s;
  }

  .footer-links a:hover {
    color: #A78BFA;
  }

  .footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 32px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }

  .footer-bottom p {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
    margin: 0;
  }

  .footer-badges {
    display: flex;
    gap: 12px;
  }

  .footer-badges .badge {
    padding: 8px 14px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 8px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
  }

  /* ===== RESPONSIVE ===== */
  @media (max-width: 1024px) {
    .nav-links {
      display: none;
    }

    .mobile-toggle {
      display: flex;
    }

    .mobile-menu {
      display: block;
    }

    .footer-grid {
      grid-template-columns: 1fr 1fr;
      gap: 40px;
    }

    .footer-brand {
      grid-column: span 2;
      max-width: none;
    }
  }

  @media (max-width: 768px) {
    .wallet-status {
      display: none;
    }

    .footer-grid {
      grid-template-columns: 1fr;
    }

    .footer-brand {
      grid-column: span 1;
    }

    .footer-bottom {
      flex-direction: column;
      gap: 20px;
      text-align: center;
    }
  }
`
