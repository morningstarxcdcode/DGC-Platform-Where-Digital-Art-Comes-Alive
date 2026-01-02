/**
 * Landing Page - Premium Professional Design
 * Author: Sourav Rajak (morningstarxcdcode)
 * Version: 2.0.0
 */

import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet.jsx'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function LandingPage() {
  const { isConnected, connectWallet, address } = useWallet()
  const [stats, setStats] = useState({ totalNFTs: 2847, totalCreators: 1256, totalVolume: '847.5' })
  const [featuredNFTs, setFeaturedNFTs] = useState([])
  const [loading, setLoading] = useState(true)
  const heroRef = useRef(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [statsRes, nftsRes] = await Promise.all([
        axios.get(`${API_BASE}/api/stats`).catch(() => ({ data: stats })),
        axios.get(`${API_BASE}/api/marketplace/featured`).catch(() => ({ data: [] }))
      ])
      setStats(statsRes.data || stats)
      setFeaturedNFTs(nftsRes.data || [])
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Placeholder NFTs for demo
  const demoNFTs = [
    { id: 1, name: 'Cosmic Dreamer', creator: '0x1234...5678', price: '2.5', image: null },
    { id: 2, name: 'Neural Genesis', creator: '0x8765...4321', price: '1.8', image: null },
    { id: 3, name: 'Digital Soul', creator: '0xabcd...efgh', price: '3.2', image: null },
    { id: 4, name: 'Quantum Art', creator: '0x9999...1111', price: '4.0', image: null },
  ]

  const displayNFTs = featuredNFTs.length > 0 ? featuredNFTs : demoNFTs

  return (
    <div className="landing-page">
      {/* ========== HERO SECTION ========== */}
      <section className="hero" ref={heroRef}>
        <div className="hero-background">
          <div className="hero-gradient"></div>
          <div className="hero-particles">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="particle" style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${15 + Math.random() * 10}s`
              }}></div>
            ))}
          </div>
          <div className="hero-grid"></div>
        </div>

        <div className="container">
          <div className="hero-content">
            <div className="hero-badge animate-fade-in-down">
              <span className="badge-dot"></span>
              <span>Now Live on Mainnet</span>
              <span className="badge-version">v2.0</span>
            </div>

            <h1 className="hero-title animate-fade-in-up stagger-1">
              Create Living,<br />
              <span className="text-gradient-animated">Breathing NFTs</span>
            </h1>

            <p className="hero-subtitle animate-fade-in-up stagger-2">
              The world's first platform for AI-powered NFTs that evolve based on 
              emotion, time, and interaction. Experience the future of digital creativity.
            </p>

            <div className="hero-cta animate-fade-in-up stagger-3">
              <Link to="/create" className="btn btn-primary btn-xl">
                <span>Start Creating</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <Link to="/marketplace" className="btn btn-glass btn-xl">
                <span>Explore Market</span>
              </Link>
            </div>

            <div className="hero-features animate-fade-in-up stagger-4">
              <div className="feature-chip">
                <span className="chip-icon">🧬</span>
                <span>Content DNA™</span>
              </div>
              <div className="feature-chip">
                <span className="chip-icon">💖</span>
                <span>Emotional AI</span>
              </div>
              <div className="feature-chip">
                <span className="chip-icon">🔗</span>
                <span>Web3 Native</span>
              </div>
              <div className="feature-chip">
                <span className="chip-icon">⚡</span>
                <span>Zero Gas</span>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="hero-visual animate-fade-in stagger-5">
            <div className="hero-card-stack">
              <div className="hero-card card-1">
                <div className="card-glow"></div>
                <div className="card-inner">
                  <div className="card-image" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}></div>
                  <div className="card-content">
                    <span className="card-badge">Featured</span>
                    <h4>Digital Genesis #001</h4>
                    <p>2.5 ETH</p>
                  </div>
                </div>
              </div>
              <div className="hero-card card-2">
                <div className="card-inner">
                  <div className="card-image" style={{ background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)' }}></div>
                </div>
              </div>
              <div className="hero-card card-3">
                <div className="card-inner">
                  <div className="card-image" style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== STATS SECTION ========== */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{stats.totalNFTs?.toLocaleString() || '2,847'}+</div>
              <div className="stat-label">NFTs Created</div>
              <div className="stat-trend stat-trend-up">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 17L17 7M17 7H7M17 7V17"/>
                </svg>
                <span>+24%</span>
              </div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-value">{stats.totalCreators?.toLocaleString() || '1,256'}+</div>
              <div className="stat-label">Active Creators</div>
              <div className="stat-trend stat-trend-up">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 17L17 7M17 7H7M17 7V17"/>
                </svg>
                <span>+18%</span>
              </div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-value">{stats.totalVolume || '847.5'} ETH</div>
              <div className="stat-label">Trading Volume</div>
              <div className="stat-trend stat-trend-up">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 17L17 7M17 7H7M17 7V17"/>
                </svg>
                <span>+32%</span>
              </div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-value">99.9%</div>
              <div className="stat-label">Uptime</div>
              <div className="stat-trend">
                <span className="live-dot"></span>
                <span>Live</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FEATURED NFTs ========== */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-eyebrow">🔥 Hot Right Now</span>
              <h2 className="section-title">Trending NFTs</h2>
            </div>
            <Link to="/marketplace" className="btn btn-ghost">
              View All
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>

          <div className="nft-showcase">
            {loading ? (
              <div className="nft-grid">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="nft-card skeleton-card"></div>
                ))}
              </div>
            ) : (
              <div className="nft-grid">
                {displayNFTs.slice(0, 4).map((nft, index) => (
                  <Link 
                    key={nft.id || index} 
                    to={`/nft/${nft.tokenId || nft.id}`} 
                    className="nft-card"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="nft-card-image">
                      {nft.image ? (
                        <img src={nft.image} alt={nft.name} />
                      ) : (
                        <div className="nft-placeholder" style={{
                          background: `linear-gradient(135deg, 
                            hsl(${260 + index * 30}, 70%, 50%) 0%, 
                            hsl(${280 + index * 30}, 70%, 40%) 100%)`
                        }}>
                          <span className="placeholder-icon">✨</span>
                        </div>
                      )}
                      <div className="nft-overlay">
                        <span className="view-btn">View Details</span>
                      </div>
                    </div>
                    <div className="nft-card-info">
                      <h3 className="nft-name">{nft.name}</h3>
                      <div className="nft-meta">
                        <div className="nft-creator">
                          <div className="creator-avatar"></div>
                          <span>{nft.creator?.slice(0, 10) || '0x1234...'}...</span>
                        </div>
                        <div className="nft-price">
                          <span className="price-label">Price</span>
                          <span className="price-value">{nft.price} ETH</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========== FEATURES SECTION ========== */}
      <section className="features-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-eyebrow">✨ Why DGC Platform</span>
            <h2 className="section-title">Revolutionary Features</h2>
            <p className="section-subtitle">
              Built for the future of digital creativity
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card feature-card-highlight">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">🧬</span>
              </div>
              <h3>Content DNA System™</h3>
              <p>
                Every NFT carries unique genetic code that determines traits, 
                evolution paths, and rarity. Watch your creations grow and mutate.
              </p>
              <div className="feature-tag">Exclusive</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">💖</span>
              </div>
              <h3>Emotional Intelligence</h3>
              <p>
                NFTs that respond to viewer emotions and market sentiment. 
                Art that adapts in real-time.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">🤖</span>
              </div>
              <h3>Multi-Agent AI</h3>
              <p>
                Orchestrate multiple AI models simultaneously for unique 
                multimedia NFT creation.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">⚡</span>
              </div>
              <h3>Zero Barriers</h3>
              <p>
                Auto-wallet creation, gas sponsorship, and no technical 
                knowledge required.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">🔗</span>
              </div>
              <h3>Web3 Native</h3>
              <p>
                Built on Ethereum with IPFS storage. Fully decentralized 
                and owned by you.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">💰</span>
              </div>
              <h3>Creator Royalties</h3>
              <p>
                Automatic royalty payments on every resale. Earn passive 
                income forever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-eyebrow">🚀 Getting Started</span>
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">From idea to NFT in minutes</p>
          </div>

          <div className="steps-container">
            <div className="step">
              <div className="step-number">01</div>
              <div className="step-content">
                <div className="step-icon">🎨</div>
                <h3>Create</h3>
                <p>Use AI to generate unique artwork from text prompts</p>
              </div>
              <div className="step-connector"></div>
            </div>

            <div className="step">
              <div className="step-number">02</div>
              <div className="step-content">
                <div className="step-icon">🧬</div>
                <h3>Customize DNA</h3>
                <p>Define genetic traits and evolution rules</p>
              </div>
              <div className="step-connector"></div>
            </div>

            <div className="step">
              <div className="step-number">03</div>
              <div className="step-content">
                <div className="step-icon">🚀</div>
                <h3>Mint & List</h3>
                <p>Mint to blockchain and list on marketplace</p>
              </div>
              <div className="step-connector"></div>
            </div>

            <div className="step">
              <div className="step-number">04</div>
              <div className="step-content">
                <div className="step-icon">💰</div>
                <h3>Earn</h3>
                <p>Sell and earn royalties on every resale</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CTA SECTION ========== */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-background">
              <div className="cta-orb cta-orb-1"></div>
              <div className="cta-orb cta-orb-2"></div>
            </div>
            <div className="cta-content">
              <h2>Ready to Create the Future?</h2>
              <p>Join thousands of creators building the next generation of digital art</p>
              <div className="cta-actions">
                {isConnected ? (
                  <Link to="/create" className="btn btn-primary btn-xl">
                    Create Your First NFT
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </Link>
                ) : (
                  <button onClick={connectWallet} className="btn btn-primary btn-xl">
                    Connect Wallet to Start
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        /* ========== LANDING PAGE STYLES ========== */
        .landing-page {
          overflow-x: hidden;
        }

        /* ========== HERO ========== */
        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding: 120px 0 80px;
          overflow: hidden;
        }

        .hero-background {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .hero-gradient {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(ellipse 80% 50% at 20% 40%, rgba(137, 90, 246, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 60%, rgba(109, 40, 217, 0.2) 0%, transparent 50%),
            radial-gradient(ellipse 50% 30% at 50% 80%, rgba(244, 114, 182, 0.15) 0%, transparent 50%);
        }

        .hero-particles {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(137, 90, 246, 0.6);
          border-radius: 50%;
          animation: particle-float 20s infinite ease-in-out;
        }

        @keyframes particle-float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(50px); opacity: 0; }
        }

        .hero-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(137, 90, 246, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(137, 90, 246, 0.03) 1px, transparent 1px);
          background-size: 80px 80px;
          mask-image: radial-gradient(ellipse 80% 50% at 50% 50%, black 0%, transparent 70%);
        }

        .hero .container {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }

        .hero-content {
          max-width: 600px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 16px;
          background: rgba(137, 90, 246, 0.15);
          border: 1px solid rgba(137, 90, 246, 0.3);
          border-radius: 100px;
          margin-bottom: 32px;
          font-size: 14px;
          font-weight: 600;
          color: var(--primary-color);
        }

        .badge-dot {
          width: 8px;
          height: 8px;
          background: var(--color-success);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .badge-version {
          padding: 2px 8px;
          background: var(--gradient-primary);
          border-radius: 100px;
          font-size: 12px;
          color: white;
        }

        .hero-title {
          font-family: var(--font-family-display);
          font-size: clamp(3rem, 5vw, 4.5rem);
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 24px;
          letter-spacing: -0.03em;
        }

        .text-gradient-animated {
          background: linear-gradient(135deg, #895af6 0%, #f472b6 50%, #06b6d4 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient-shift 5s ease infinite;
        }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--text-secondary);
          line-height: 1.7;
          margin-bottom: 40px;
        }

        .hero-cta {
          display: flex;
          gap: 16px;
          margin-bottom: 48px;
          flex-wrap: wrap;
        }

        .hero-features {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .feature-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: rgba(22, 22, 42, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 100px;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .feature-chip:hover {
          border-color: rgba(137, 90, 246, 0.4);
          transform: translateY(-2px);
        }

        .chip-icon {
          font-size: 18px;
        }

        /* Hero Visual */
        .hero-visual {
          display: flex;
          justify-content: center;
          perspective: 1000px;
        }

        .hero-card-stack {
          position: relative;
          width: 320px;
          height: 400px;
        }

        .hero-card {
          position: absolute;
          width: 280px;
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hero-card .card-inner {
          background: rgba(22, 22, 42, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
        }

        .hero-card .card-image {
          height: 260px;
        }

        .hero-card .card-content {
          padding: 20px;
        }

        .hero-card .card-badge {
          display: inline-block;
          padding: 4px 12px;
          background: var(--gradient-primary);
          border-radius: 100px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .hero-card .card-content h4 {
          font-size: 16px;
          margin-bottom: 4px;
        }

        .hero-card .card-content p {
          font-size: 14px;
          color: var(--text-secondary);
          margin: 0;
        }

        .card-1 {
          z-index: 3;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
        }

        .card-1 .card-glow {
          position: absolute;
          inset: -2px;
          background: var(--gradient-primary);
          border-radius: 26px;
          z-index: -1;
          opacity: 0.5;
          filter: blur(20px);
        }

        .card-2 {
          z-index: 2;
          top: 40px;
          left: calc(50% - 40px);
          transform: translateX(-50%) rotate(-8deg) scale(0.9);
          opacity: 0.7;
        }

        .card-3 {
          z-index: 1;
          top: 80px;
          left: calc(50% + 40px);
          transform: translateX(-50%) rotate(8deg) scale(0.8);
          opacity: 0.5;
        }

        .hero-card-stack:hover .card-1 {
          transform: translateX(-50%) translateY(-10px);
        }

        .hero-card-stack:hover .card-2 {
          transform: translateX(-50%) rotate(-12deg) scale(0.9) translateX(-20px);
        }

        .hero-card-stack:hover .card-3 {
          transform: translateX(-50%) rotate(12deg) scale(0.8) translateX(20px);
        }

        /* ========== STATS ========== */
        .stats-section {
          padding: 60px 0;
          background: rgba(22, 22, 42, 0.4);
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .stats-grid {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 60px;
          flex-wrap: wrap;
        }

        .stat-item {
          text-align: center;
        }

        .stat-value {
          font-family: var(--font-family-display);
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }

        .stat-label {
          font-size: 14px;
          color: var(--text-tertiary);
          margin-top: 4px;
        }

        .stat-trend {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-top: 8px;
          font-size: 13px;
          font-weight: 600;
        }

        .stat-trend-up {
          color: var(--color-success);
        }

        .stat-trend .live-dot {
          width: 8px;
          height: 8px;
          background: var(--color-success);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .stat-divider {
          width: 1px;
          height: 60px;
          background: rgba(255, 255, 255, 0.1);
        }

        /* ========== FEATURED ========== */
        .featured-section {
          padding: 100px 0;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 48px;
        }

        .section-header.text-center {
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .section-eyebrow {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: var(--primary-color);
          margin-bottom: 12px;
          letter-spacing: 0.05em;
        }

        .section-title {
          font-family: var(--font-family-display);
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          margin: 0;
        }

        .section-subtitle {
          font-size: 1.125rem;
          color: var(--text-secondary);
          margin-top: 12px;
          max-width: 500px;
        }

        .nft-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .nft-card {
          background: rgba(22, 22, 42, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
          animation: fadeInUp 0.6s ease forwards;
          opacity: 0;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .nft-card:hover {
          transform: translateY(-10px);
          border-color: rgba(137, 90, 246, 0.4);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
        }

        .nft-card-image {
          position: relative;
          aspect-ratio: 1;
          overflow: hidden;
        }

        .nft-card-image img,
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

        .placeholder-icon {
          font-size: 48px;
          opacity: 0.5;
        }

        .nft-card:hover .nft-card-image img,
        .nft-card:hover .nft-placeholder {
          transform: scale(1.1);
        }

        .nft-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 50%, rgba(0, 0, 0, 0.8) 100%);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 20px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .nft-card:hover .nft-overlay {
          opacity: 1;
        }

        .view-btn {
          padding: 12px 24px;
          background: var(--gradient-primary);
          border-radius: 100px;
          font-size: 14px;
          font-weight: 600;
          color: white;
          transform: translateY(20px);
          transition: transform 0.3s ease;
        }

        .nft-card:hover .view-btn {
          transform: translateY(0);
        }

        .nft-card-info {
          padding: 20px;
        }

        .nft-name {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 12px;
          color: var(--text-primary);
        }

        .nft-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nft-creator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-tertiary);
        }

        .creator-avatar {
          width: 24px;
          height: 24px;
          background: var(--gradient-primary);
          border-radius: 50%;
        }

        .nft-price {
          text-align: right;
        }

        .price-label {
          display: block;
          font-size: 11px;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .price-value {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
        }

        /* ========== FEATURES ========== */
        .features-section {
          padding: 100px 0;
          background: rgba(22, 22, 42, 0.3);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .feature-card {
          background: rgba(22, 22, 42, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 24px;
          padding: 32px;
          transition: all 0.4s ease;
          position: relative;
        }

        .feature-card:hover {
          transform: translateY(-8px);
          border-color: rgba(137, 90, 246, 0.3);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
        }

        .feature-card-highlight {
          grid-column: span 2;
          background: linear-gradient(135deg, rgba(137, 90, 246, 0.15) 0%, rgba(109, 40, 217, 0.1) 100%);
          border-color: rgba(137, 90, 246, 0.3);
        }

        .feature-icon-wrapper {
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--gradient-primary);
          border-radius: 16px;
          margin-bottom: 20px;
          box-shadow: 0 10px 30px rgba(137, 90, 246, 0.3);
        }

        .feature-icon {
          font-size: 28px;
        }

        .feature-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .feature-card p {
          font-size: 15px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
        }

        .feature-tag {
          position: absolute;
          top: 24px;
          right: 24px;
          padding: 6px 12px;
          background: var(--gradient-gold);
          border-radius: 100px;
          font-size: 12px;
          font-weight: 700;
          color: #1a1a2e;
        }

        /* ========== HOW IT WORKS ========== */
        .how-it-works {
          padding: 100px 0;
        }

        .steps-container {
          display: flex;
          justify-content: center;
          gap: 0;
          margin-top: 60px;
        }

        .step {
          flex: 1;
          max-width: 280px;
          text-align: center;
          position: relative;
        }

        .step-number {
          font-family: var(--font-family-display);
          font-size: 4rem;
          font-weight: 800;
          color: rgba(137, 90, 246, 0.15);
          line-height: 1;
          margin-bottom: -20px;
        }

        .step-content {
          background: rgba(22, 22, 42, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 24px;
          padding: 40px 24px;
          position: relative;
          z-index: 1;
          transition: all 0.4s ease;
        }

        .step:hover .step-content {
          transform: translateY(-8px);
          border-color: rgba(137, 90, 246, 0.3);
        }

        .step-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .step-content h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .step-content p {
          font-size: 14px;
          color: var(--text-secondary);
          margin: 0;
        }

        .step-connector {
          position: absolute;
          top: 50%;
          right: -40px;
          width: 80px;
          height: 2px;
          background: linear-gradient(90deg, rgba(137, 90, 246, 0.5) 0%, transparent 100%);
          z-index: 0;
        }

        .step:last-child .step-connector {
          display: none;
        }

        /* ========== CTA ========== */
        .cta-section {
          padding: 100px 0;
        }

        .cta-card {
          position: relative;
          background: linear-gradient(135deg, rgba(137, 90, 246, 0.2) 0%, rgba(109, 40, 217, 0.1) 100%);
          border: 1px solid rgba(137, 90, 246, 0.3);
          border-radius: 32px;
          padding: 80px;
          text-align: center;
          overflow: hidden;
        }

        .cta-background {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .cta-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.5;
        }

        .cta-orb-1 {
          width: 400px;
          height: 400px;
          background: #895af6;
          top: -200px;
          right: -100px;
        }

        .cta-orb-2 {
          width: 300px;
          height: 300px;
          background: #f472b6;
          bottom: -150px;
          left: -100px;
        }

        .cta-content {
          position: relative;
          z-index: 1;
        }

        .cta-card h2 {
          font-family: var(--font-family-display);
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          margin-bottom: 16px;
        }

        .cta-card p {
          font-size: 1.125rem;
          color: var(--text-secondary);
          margin-bottom: 32px;
        }

        .cta-actions {
          display: flex;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        /* ========== RESPONSIVE ========== */
        @media (max-width: 1200px) {
          .hero .container {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .hero-content {
            max-width: 700px;
            margin: 0 auto;
          }

          .hero-cta,
          .hero-features {
            justify-content: center;
          }

          .hero-visual {
            display: none;
          }

          .nft-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .feature-card-highlight {
            grid-column: span 2;
          }
        }

        @media (max-width: 768px) {
          .hero {
            padding: 100px 0 60px;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .stats-grid {
            gap: 30px;
          }

          .stat-divider {
            display: none;
          }

          .nft-grid {
            grid-template-columns: 1fr;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .feature-card-highlight {
            grid-column: span 1;
          }

          .steps-container {
            flex-direction: column;
            align-items: center;
            gap: 20px;
          }

          .step-connector {
            display: none;
          }

          .cta-card {
            padding: 40px 24px;
          }
        }
      `}</style>
    </div>
  )
}
