/**
 * Landing Page - Professional Homepage
 * Modern, engaging, conversion-optimized design
 */

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet.jsx'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function LandingPage() {
  const { isConnected, connectWallet } = useWallet()
  const [stats, setStats] = useState({ totalNFTs: 0, totalCreators: 0, totalVolume: '0' })
  const [featuredNFTs, setFeaturedNFTs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [statsRes, nftsRes] = await Promise.all([
        axios.get(`${API_BASE}/api/stats`),
        axios.get(`${API_BASE}/api/marketplace/featured`)
      ])
      setStats(statsRes.data)
      setFeaturedNFTs(nftsRes.data)
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content animate-fadeIn">
            <div className="hero-badge">
              <span className="badge badge-primary">🚀 Now Live on Mainnet</span>
            </div>
            
            <h1 className="hero-title">
              Create Living, Breathing <span className="text-gradient">NFTs</span>
            </h1>
            
            <p className="hero-description">
              The world's first platform for AI-powered NFTs that evolve based on emotion, 
              time, and interaction. Experience the future of digital creativity.
            </p>
            
            <div className="hero-cta">
              <Link to="/create" className="btn btn-primary btn-lg">
                Start Creating →
              </Link>
              <Link to="/marketplace" className="btn btn-secondary btn-lg">
                Explore Marketplace
              </Link>
            </div>
            
            <div className="hero-features">
              <div className="feature-pill">
                <span className="feature-icon">🧬</span>
                Content DNA™
              </div>
              <div className="feature-pill">
                <span className="feature-icon">💖</span>
                Emotional AI
              </div>
              <div className="feature-pill">
                <span className="feature-icon">🔗</span>
                Web3 Native
              </div>
              <div className="feature-pill">
                <span className="feature-icon">⚡</span>
                Zero Fees
              </div>
            </div>
          </div>
        </div>
        
        {/* Animated Background */}
        <div className="hero-bg">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-value">{stats.totalNFTs.toLocaleString()}+</div>
              <div className="stat-label">NFTs Created</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-value">{stats.totalCreators.toLocaleString()}+</div>
              <div className="stat-label">Active Creators</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-value">{stats.totalVolume} ETH</div>
              <div className="stat-label">Trading Volume</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-value">99.9%</div>
              <div className="stat-label">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured NFTs */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">🔥 Trending NFTs</h2>
            <Link to="/marketplace" className="btn btn-ghost">
              View All →
            </Link>
          </div>
          
          {loading ? (
            <div className="loading-grid">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton-card"></div>
              ))}
            </div>
          ) : (
            <div className="nft-grid">
              {featuredNFTs.map((nft, index) => (
                <Link 
                  key={index} 
                  to={`/nft/${nft.tokenId}`} 
                  className="nft-card-modern"
                >
                  <div className="nft-image-wrapper">
                    <img 
                      src={nft.imageUrl || '/placeholder.png'} 
                      alt={nft.name}
                      className="nft-image"
                    />
                    <div className="nft-overlay">
                      <span className="view-btn">View Details</span>
                    </div>
                  </div>
                  <div className="nft-info">
                    <h3 className="nft-title">{nft.name}</h3>
                    <div className="nft-footer">
                      <div className="nft-creator">
                        <span className="creator-avatar">👤</span>
                        {nft.creator?.slice(0, 6)}...
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
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">Why Choose DGC Platform?</h2>
            <p className="section-description">
              Revolutionary features that set us apart from traditional NFT platforms
            </p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-lg">🧬</div>
              <h3 className="feature-title">Content DNA System™</h3>
              <p className="feature-description">
                Every NFT has unique genetic code that determines its traits, 
                evolution path, and rarity. Watch your creations grow and mutate over time.
              </p>
              <Link to="/docs/dna-system" className="feature-link">
                Learn More →
              </Link>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-lg">💖</div>
              <h3 className="feature-title">Emotional Intelligence</h3>
              <p className="feature-description">
                NFTs that respond to viewer emotions and market sentiment. 
                Your art adapts colors, animations, and behaviors in real-time.
              </p>
              <Link to="/docs/emotion-ai" className="feature-link">
                Learn More →
              </Link>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-lg">🤖</div>
              <h3 className="feature-title">Multi-Agent AI</h3>
              <p className="feature-description">
                Orchestrate multiple AI models simultaneously. Combine image, text, 
                and music generation for truly unique multimedia NFTs.
              </p>
              <Link to="/agents" className="feature-link">
                Learn More →
              </Link>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-lg">🔗</div>
              <h3 className="feature-title">Web3 Native</h3>
              <p className="feature-description">
                Built on Ethereum with IPFS storage. Fully decentralized, 
                censorship-resistant, and owned by you forever.
              </p>
              <Link to="/docs/blockchain" className="feature-link">
                Learn More →
              </Link>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-lg">⚡</div>
              <h3 className="feature-title">Zero Barriers</h3>
              <p className="feature-description">
                Auto-wallet creation, gas sponsorship, and no technical knowledge required. 
                Start creating in seconds, not hours.
              </p>
              <Link to="/docs/getting-started" className="feature-link">
                Learn More →
              </Link>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-lg">💰</div>
              <h3 className="feature-title">Creator Royalties</h3>
              <p className="feature-description">
                Automatic royalty payments on every resale. Set your own rates 
                and earn passive income from your creations forever.
              </p>
              <Link to="/docs/royalties" className="feature-link">
                Learn More →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">How It Works</h2>
            <p className="section-description">
              From idea to NFT in 4 simple steps
            </p>
          </div>
          
          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">🎨</div>
              <h3 className="step-title">Create</h3>
              <p className="step-description">
                Use AI to generate unique artwork from text prompts. 
                Choose from multiple styles and models.
              </p>
            </div>
            
            <div className="step-arrow">→</div>
            
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">🧬</div>
              <h3 className="step-title">Customize DNA</h3>
              <p className="step-description">
                Define genetic traits, evolution rules, and emotional responses. 
                Make it truly unique.
              </p>
            </div>
            
            <div className="step-arrow">→</div>
            
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">🚀</div>
              <h3 className="step-title">Mint & List</h3>
              <p className="step-description">
                Mint your NFT to the blockchain and list it on our marketplace. 
                Set your price and royalties.
              </p>
            </div>
            
            <div className="step-arrow">→</div>
            
            <div className="step-card">
              <div className="step-number">4</div>
              <div className="step-icon">💰</div>
              <h3 className="step-title">Earn</h3>
              <p className="step-description">
                Sell your NFT and earn from every future resale through 
                automatic royalty payments.
              </p>
            </div>
          </div>
          
          <div className="cta-center">
            <Link to="/create" className="btn btn-primary btn-lg">
              Get Started Now →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-content">
              <h2 className="cta-title">Ready to Create the Future?</h2>
              <p className="cta-description">
                Join thousands of creators building the next generation of digital art
              </p>
              <div className="cta-buttons">
                {isConnected ? (
                  <Link to="/create" className="btn btn-primary btn-lg">
                    Create Your First NFT →
                  </Link>
                ) : (
                  <button onClick={connectWallet} className="btn btn-primary btn-lg">
                    Connect Wallet to Start
                  </button>
                )}
                <Link to="/docs" className="btn btn-secondary btn-lg">
                  Read Documentation
                </Link>
              </div>
            </div>
            <div className="cta-visual">
              <div className="floating-nft">
                <div className="nft-placeholder"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .landing-page {
          min-height: 100vh;
        }

        /* Hero Section */
        .hero-section {
          position: relative;
          padding: 120px 0 80px;
          overflow: hidden;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .hero-content {
          position: relative;
          z-index: 2;
          text-align: center;
          max-width: 900px;
          margin: 0 auto;
        }

        .hero-badge {
          margin-bottom: var(--space-6);
        }

        .hero-title {
          font-size: var(--text-6xl);
          font-weight: var(--font-extrabold);
          color: var(--white);
          margin-bottom: var(--space-6);
          line-height: 1.1;
        }

        .text-gradient {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-description {
          font-size: var(--text-xl);
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: var(--space-8);
          line-height: 1.6;
        }

        .hero-cta {
          display: flex;
          gap: var(--space-4);
          justify-content: center;
          margin-bottom: var(--space-8);
          flex-wrap: wrap;
        }

        .hero-features {
          display: flex;
          gap: var(--space-3);
          justify-content: center;
          flex-wrap: wrap;
        }

        .feature-pill {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-4);
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border-radius: var(--radius-full);
          color: var(--white);
          font-size: var(--text-sm);
          font-weight: var(--font-semibold);
        }

        .feature-icon {
          font-size: var(--text-xl);
        }

        /* Animated Background */
        .hero-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 1;
        }

        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.3;
          animation: float 20s infinite ease-in-out;
        }

        .orb-1 {
          width: 400px;
          height: 400px;
          background: #fbbf24;
          top: -200px;
          right: -100px;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 500px;
          height: 500px;
          background: #ec4899;
          bottom: -250px;
          left: -150px;
          animation-delay: 7s;
        }

        .orb-3 {
          width: 300px;
          height: 300px;
          background: #8b5cf6;
          top: 50%;
          left: 50%;
          animation-delay: 14s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        /* Stats Section */
        .stats-section {
          padding: var(--space-16) 0;
          background: var(--white);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-6);
        }

        .stat-card {
          text-align: center;
          padding: var(--space-6);
          background: var(--gray-50);
          border-radius: var(--radius-xl);
          transition: all var(--transition);
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }

        .stat-icon {
          font-size: 48px;
          margin-bottom: var(--space-3);
        }

        .stat-value {
          font-size: var(--text-4xl);
          font-weight: var(--font-extrabold);
          color: var(--primary-purple);
          margin-bottom: var(--space-2);
        }

        .stat-label {
          color: var(--gray-600);
          font-size: var(--text-base);
        }

        /* Featured Section */
        .featured-section {
          padding: var(--space-16) 0;
          background: var(--gray-50);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-8);
        }

        .section-header.text-center {
          flex-direction: column;
          text-align: center;
        }

        .section-title {
          font-size: var(--text-4xl);
          font-weight: var(--font-extrabold);
          color: var(--gray-900);
          margin: 0;
        }

        .section-description {
          font-size: var(--text-lg);
          color: var(--gray-600);
          max-width: 600px;
          margin: var(--space-4) auto 0;
        }

        .nft-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: var(--space-6);
        }

        .nft-card-modern {
          background: var(--white);
          border-radius: var(--radius-xl);
          overflow: hidden;
          box-shadow: var(--shadow);
          transition: all var(--transition);
          text-decoration: none;
          color: inherit;
        }

        .nft-card-modern:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-xl);
        }

        .nft-image-wrapper {
          position: relative;
          width: 100%;
          padding-top: 100%;
          overflow: hidden;
          background: var(--gray-200);
        }

        .nft-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition);
        }

        .nft-card-modern:hover .nft-image {
          transform: scale(1.05);
        }

        .nft-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity var(--transition);
        }

        .nft-card-modern:hover .nft-overlay {
          opacity: 1;
        }

        .view-btn {
          color: var(--white);
          font-weight: var(--font-semibold);
          padding: var(--space-2) var(--space-4);
          border: 2px solid var(--white);
          border-radius: var(--radius-lg);
        }

        .nft-info {
          padding: var(--space-4);
        }

        .nft-title {
          font-size: var(--text-lg);
          font-weight: var(--font-bold);
          margin-bottom: var(--space-3);
        }

        .nft-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nft-creator {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-sm);
          color: var(--gray-600);
        }

        .creator-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--gray-200);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nft-price {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .price-label {
          font-size: var(--text-xs);
          color: var(--gray-500);
        }

        .price-value {
          font-size: var(--text-base);
          font-weight: var(--font-bold);
          color: var(--primary-purple);
        }

        /* Features Grid */
        .features-section {
          padding: var(--space-16) 0;
          background: var(--white);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: var(--space-6);
          margin-top: var(--space-8);
        }

        .feature-card {
          padding: var(--space-8);
          background: var(--gray-50);
          border-radius: var(--radius-xl);
          transition: all var(--transition);
        }

        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
          background: var(--white);
        }

        .feature-icon-lg {
          font-size: 64px;
          margin-bottom: var(--space-4);
        }

        .feature-title {
          font-size: var(--text-2xl);
          font-weight: var(--font-bold);
          margin-bottom: var(--space-3);
        }

        .feature-description {
          color: var(--gray-600);
          margin-bottom: var(--space-4);
          line-height: 1.6;
        }

        .feature-link {
          color: var(--primary-purple);
          font-weight: var(--font-semibold);
          text-decoration: none;
          transition: color var(--transition);
        }

        .feature-link:hover {
          color: var(--primary-dark);
        }

        /* How It Works */
        .how-it-works-section {
          padding: var(--space-16) 0;
          background: var(--gray-50);
        }

        .steps-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-6);
          margin: var(--space-12) 0;
          flex-wrap: wrap;
        }

        .step-card {
          flex: 1;
          min-width: 200px;
          max-width: 240px;
          padding: var(--space-6);
          background: var(--white);
          border-radius: var(--radius-xl);
          text-align: center;
          position: relative;
          box-shadow: var(--shadow);
        }

        .step-number {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          width: 32px;
          height: 32px;
          background: var(--gradient-primary);
          color: var(--white);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: var(--font-bold);
          box-shadow: var(--shadow-md);
        }

        .step-icon {
          font-size: 48px;
          margin: var(--space-4) 0;
        }

        .step-title {
          font-size: var(--text-xl);
          font-weight: var(--font-bold);
          margin-bottom: var(--space-2);
        }

        .step-description {
          font-size: var(--text-sm);
          color: var(--gray-600);
          line-height: 1.5;
        }

        .step-arrow {
          font-size: var(--text-4xl);
          color: var(--primary-purple);
          font-weight: var(--font-bold);
        }

        .cta-center {
          text-align: center;
          margin-top: var(--space-8);
        }

        /* CTA Section */
        .cta-section {
          padding: var(--space-16) 0;
          background: var(--white);
        }

        .cta-card {
          background: var(--gradient-primary);
          border-radius: var(--radius-2xl);
          padding: var(--space-16);
          display: flex;
          align-items: center;
          gap: var(--space-12);
          position: relative;
          overflow: hidden;
        }

        .cta-content {
          flex: 1;
          color: var(--white);
        }

        .cta-title {
          font-size: var(--text-5xl);
          font-weight: var(--font-extrabold);
          margin-bottom: var(--space-4);
        }

        .cta-description {
          font-size: var(--text-xl);
          margin-bottom: var(--space-8);
          opacity: 0.95;
        }

        .cta-buttons {
          display: flex;
          gap: var(--space-4);
          flex-wrap: wrap;
        }

        .cta-visual {
          flex: 0 0 300px;
          position: relative;
        }

        .floating-nft {
          animation: float 6s infinite ease-in-out;
        }

        .nft-placeholder {
          width: 280px;
          height: 280px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(20px);
          border-radius: var(--radius-2xl);
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        /* Loading States */
        .loading-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: var(--space-6);
        }

        .skeleton-card {
          height: 400px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: var(--radius-xl);
        }

        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hero-title {
            font-size: var(--text-4xl);
          }

          .hero-description {
            font-size: var(--text-base);
          }

          .hero-cta {
            flex-direction: column;
          }

          .step-arrow {
            display: none;
          }

          .cta-card {
            flex-direction: column;
            text-align: center;
          }

          .cta-visual {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}
