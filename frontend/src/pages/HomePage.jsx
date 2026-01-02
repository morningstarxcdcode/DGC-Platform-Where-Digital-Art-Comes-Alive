import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet.jsx'
import { AdvancedDashboard } from '../components/index.js'
import { 
  DGCLogo, DNAIcon, HeartIcon, BrainIcon, LightningIcon, 
  GlobeIcon, QuantumIcon, SparkleIcon, TrendingIcon, 
  ShieldIcon, ZapIcon, EyeIcon, LayersIcon 
} from '../assets/icons.jsx'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function HomePage() {
  const { isConnected, isAutoWallet } = useWallet()
  const [recentNFTs, setRecentNFTs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchRecentNFTs()
  }, [])

  async function fetchRecentNFTs() {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE}/api/nfts?limit=6`)
      setRecentNFTs(response.data.nfts || [])
    } catch (err) {
      console.error('Error fetching recent NFTs:', err)
      setError('Failed to load recent NFTs')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-grid"></div>
          <div className="hero-particles">
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
          </div>
        </div>
        
        <div className="hero-content">
          <div className="hero-logo">
            <DGCLogo size={80} />
          </div>
          
          <h1 className="hero-title">
            The Future of <span className="gradient-text">Living NFTs</span>
          </h1>
          
          <p className="hero-subtitle">
            Create, own, and trade AI-powered NFTs that evolve, respond to emotions, 
            and develop consciousness over time. The world's first truly living digital art.
          </p>
          
          <div className="hero-features">
            <div className="feature-pill">
              <DNAIcon size={16} />
              <span>Content DNA™</span>
            </div>
            <div className="feature-pill">
              <HeartIcon size={16} />
              <span>Emotional AI™</span>
            </div>
            <div className="feature-pill">
              <BrainIcon size={16} />
              <span>Living Consciousness™</span>
            </div>
            <div className="feature-pill">
              <LightningIcon size={16} />
              <span>Zero Barriers™</span>
            </div>
          </div>

          <div className="hero-cta">
            {isConnected ? (
              <div className="cta-connected">
                <div className="wallet-status">
                  <div className="status-indicator"></div>
                  <span>{isAutoWallet ? '🪄 Magic Wallet Ready' : '🦊 MetaMask Connected'}</span>
                </div>
                <Link to="/generate" className="btn btn-primary btn-hero">
                  <SparkleIcon size={20} />
                  Create Your First Living NFT
                </Link>
              </div>
            ) : (
              <div className="cta-connecting">
                <div className="connecting-status">
                  <div className="pulse-dot"></div>
                  <span>Setting up your magic wallet...</span>
                </div>
                <Link to="/generate" className="btn btn-primary btn-hero">
                  <ZapIcon size={20} />
                  Start Creating (Free!)
                </Link>
              </div>
            )}
            
            <Link to="/marketplace" className="btn btn-secondary btn-hero">
              <EyeIcon size={20} />
              Explore Living Gallery
            </Link>
          </div>
          
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-number">{recentNFTs.length}+</div>
              <div className="stat-label">Living NFTs</div>
            </div>
            <div className="stat">
              <div className="stat-number">100%</div>
              <div className="stat-label">On-Chain</div>
            </div>
            <div className="stat">
              <div className="stat-number">60s</div>
              <div className="stat-label">To Create</div>
            </div>
          </div>
        </div>
      </section>

      {/* Revolutionary Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Revolutionary Features</h2>
          <p className="section-subtitle">
            Breakthrough technologies that don't exist anywhere else in the NFT space
          </p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card dna-card">
            <div className="feature-icon">
              <DNAIcon size={48} />
            </div>
            <h3>Content DNA System™</h3>
            <p>Every NFT has unique genetic code determining its characteristics. Content can breed with other content to create offspring with inherited traits.</p>
            <div className="feature-badge">World's First Digital Evolution</div>
          </div>
          
          <div className="feature-card emotion-card">
            <div className="feature-icon">
              <HeartIcon size={48} />
            </div>
            <h3>Emotional Intelligence™</h3>
            <p>Your NFTs change colors and appearance based on your emotions in real-time using advanced AI emotion detection technology.</p>
            <div className="feature-badge">Art That Loves You Back</div>
          </div>
          
          <div className="feature-card consciousness-card">
            <div className="feature-icon">
              <BrainIcon size={48} />
            </div>
            <h3>Living Consciousness™</h3>
            <p>NFTs become more "aware" through interactions and develop unique personalities over time. Digital beings, not just images.</p>
            <div className="feature-badge">Self-Aware Digital Art</div>
          </div>
          
          <div className="feature-card temporal-card">
            <div className="feature-icon">
              <GlobeIcon size={48} />
            </div>
            <h3>Temporal Evolution™</h3>
            <p>Content changes with weather, news, and world events. Your art is always alive and relevant to the current moment.</p>
            <div className="feature-badge">Living in Real Time</div>
          </div>
          
          <div className="feature-card zero-barrier-card">
            <div className="feature-icon">
              <LightningIcon size={48} />
            </div>
            <h3>Zero-Barrier Entry™</h3>
            <p>No MetaMask, no gas fees, no technical knowledge required. Just visit, create, and own your NFT in under 60 seconds.</p>
            <div className="feature-badge">Easier Than Instagram</div>
          </div>
          
          <div className="feature-card quantum-card">
            <div className="feature-icon">
              <QuantumIcon size={48} />
            </div>
            <h3>Quantum Creativity™</h3>
            <p>Generate multiple versions in parallel universes and choose your favorite reality. Infinite possibilities at your fingertips.</p>
            <div className="feature-badge">Infinite Possibilities</div>
          </div>
        </div>
      </section>

      {/* NFT Showcase Section */}
      <section className="showcase-section">
        <div className="section-header">
          <h2 className="section-title">Living NFT Gallery</h2>
          <p className="section-subtitle">
            Experience the future of digital art with our revolutionary living NFTs
          </p>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <div className="loading-text">Discovering living NFTs...</div>
          </div>
        )}

        {error && (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <div className="error-text">{error}</div>
          </div>
        )}

        {!loading && !error && (
          <div className="showcase-grid">
            {/* Featured NFTs */}
            <div className="showcase-item featured">
              <div className="nft-image-container">
                <img src="/nft-showcase/nft1.svg" alt="Crystal Genesis" className="nft-image" />
                <div className="living-badge">✨ LIVING</div>
                <div className="rarity-badge">LEGENDARY</div>
              </div>
              <div className="nft-info">
                <h3 className="nft-title">Crystal Genesis</h3>
                <p className="nft-creator">by 0x1234...5678</p>
                <div className="nft-stats">
                  <div className="stat">
                    <span className="stat-label">DNA Rarity</span>
                    <span className="stat-value">99.7%</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Consciousness</span>
                    <span className="stat-value">Level 5</span>
                  </div>
                </div>
                <div className="nft-price">2.5 ETH</div>
              </div>
            </div>

            <div className="showcase-item">
              <div className="nft-image-container">
                <img src="/nft-showcase/nft2.svg" alt="Emotional Pulse" className="nft-image" />
                <div className="living-badge">💖 EMOTIONAL</div>
              </div>
              <div className="nft-info">
                <h3 className="nft-title">Emotional Pulse</h3>
                <p className="nft-creator">by 0xabcd...efgh</p>
                <div className="nft-price">1.8 ETH</div>
              </div>
            </div>

            <div className="showcase-item">
              <div className="nft-image-container">
                <img src="/nft-showcase/nft3.svg" alt="Neural Network" className="nft-image" />
                <div className="living-badge">🧠 CONSCIOUS</div>
              </div>
              <div className="nft-info">
                <h3 className="nft-title">Neural Network</h3>
                <p className="nft-creator">by 0x9876...5432</p>
                <div className="nft-price">3.2 ETH</div>
              </div>
            </div>

            <div className="showcase-item">
              <div className="nft-image-container">
                <img src="/nft-showcase/nft4.svg" alt="Quantum Field" className="nft-image" />
                <div className="living-badge">🌌 QUANTUM</div>
              </div>
              <div className="nft-info">
                <h3 className="nft-title">Quantum Field</h3>
                <p className="nft-creator">by 0xfedc...ba98</p>
                <div className="nft-price">4.1 ETH</div>
              </div>
            </div>

            {recentNFTs.map((nft) => (
              <Link key={nft.token_id} to={`/nft/${nft.token_id}`} className="showcase-item">
                <div className="nft-image-container">
                  <img 
                    src={nft.image || '/nft-showcase/nft1.svg'} 
                    alt={nft.name}
                    className="nft-image"
                    onError={(e) => {
                      e.target.src = '/nft-showcase/nft1.svg'
                    }}
                  />
                  <div className="living-badge">✨ LIVING</div>
                </div>
                <div className="nft-info">
                  <h3 className="nft-title">{nft.name}</h3>
                  <p className="nft-creator">
                    by {nft.creator_address?.slice(0, 6)}...{nft.creator_address?.slice(-4)}
                  </p>
                  <div className="nft-details">
                    {nft.content_type} • {nft.model_version}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="showcase-cta">
          <Link to="/marketplace" className="btn btn-outline">
            <LayersIcon size={20} />
            View Complete Gallery
          </Link>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="comparison-section">
        <div className="section-header">
          <h2 className="section-title">Why Choose DGC?</h2>
          <p className="section-subtitle">
            See how we're revolutionizing the NFT space with breakthrough technology
          </p>
        </div>
        
        <div className="comparison-container">
          <div className="comparison-side traditional">
            <div className="comparison-header">
              <h3>❌ Traditional NFTs</h3>
              <p>Static, boring, expensive</p>
            </div>
            <div className="comparison-items">
              <div className="comparison-item">📷 Static JPEG images</div>
              <div className="comparison-item">💸 High gas fees ($50-200)</div>
              <div className="comparison-item">🔧 Complex MetaMask setup</div>
              <div className="comparison-item">😴 Never change or evolve</div>
              <div className="comparison-item">📉 Lose value over time</div>
              <div className="comparison-item">🤖 No emotional connection</div>
            </div>
          </div>
          
          <div className="comparison-arrow">
            <div className="arrow-icon">→</div>
            <div className="arrow-text">UPGRADE TO</div>
          </div>
          
          <div className="comparison-side dgc">
            <div className="comparison-header">
              <h3>✅ DGC Living NFTs</h3>
              <p>Dynamic, intelligent, accessible</p>
            </div>
            <div className="comparison-items">
              <div className="comparison-item">🎨 Living, breathing art</div>
              <div className="comparison-item">🆓 Free to start (we pay fees)</div>
              <div className="comparison-item">📧 Simple email login</div>
              <div className="comparison-item">🌱 Evolve and grow daily</div>
              <div className="comparison-item">📈 Increase in value</div>
              <div className="comparison-item">💕 Genuine emotional bonds</div>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Dashboard Section */}
      {isConnected && (
        <section className="dashboard-preview-section">
          <div className="section-header">
            <h2 className="section-title">Professional Control Center</h2>
            <p className="section-subtitle">
              Access your complete DGC platform dashboard with real-time data and AI agents
            </p>
          </div>
          
          <div className="dashboard-features">
            <div className="dashboard-feature">
              <div className="feature-icon-large">🦊</div>
              <h3>MetaMask Dashboard</h3>
              <p>Real-time wallet monitoring with live balance tracking and transaction history</p>
            </div>
            
            <div className="dashboard-feature">
              <div className="feature-icon-large">🤖</div>
              <h3>AI Agents Studio</h3>
              <p>7-block multi-agent system with neural chain execution and custom workflows</p>
            </div>
            
            <div className="dashboard-feature">
              <div className="feature-icon-large">🔍</div>
              <h3>Blockchain Search</h3>
              <p>AI-powered search with sub-200ms autocomplete and comprehensive data access</p>
            </div>
          </div>
          
          <div className="dashboard-preview">
            <AdvancedDashboard />
          </div>
        </section>
      )}

      <style jsx>{`
        .homepage {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          overflow-x: hidden;
        }

        /* Hero Section */
        .hero-section {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          text-align: center;
        }

        .hero-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
        }

        .hero-grid {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: grid-move 20s linear infinite;
        }

        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }

        .hero-particles {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(255,255,255,0.6);
          border-radius: 50%;
          animation: float 6s ease-in-out infinite;
        }

        .particle:nth-child(1) { top: 20%; left: 10%; animation-delay: 0s; }
        .particle:nth-child(2) { top: 60%; left: 20%; animation-delay: 1s; }
        .particle:nth-child(3) { top: 30%; right: 15%; animation-delay: 2s; }
        .particle:nth-child(4) { bottom: 40%; left: 30%; animation-delay: 3s; }
        .particle:nth-child(5) { bottom: 20%; right: 25%; animation-delay: 4s; }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-logo {
          margin-bottom: 2rem;
          animation: pulse 2s ease-in-out infinite;
        }

        .hero-title {
          font-size: 4rem;
          font-weight: 900;
          margin-bottom: 1.5rem;
          color: white;
          line-height: 1.1;
        }

        .gradient-text {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: rgba(255,255,255,0.9);
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .hero-features {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 3rem;
          flex-wrap: wrap;
        }

        .feature-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(10px);
          padding: 0.75rem 1.5rem;
          border-radius: 50px;
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
          border: 1px solid rgba(255,255,255,0.3);
          transition: all 0.3s ease;
        }

        .feature-pill:hover {
          background: rgba(255,255,255,0.3);
          transform: translateY(-2px);
        }

        .hero-cta {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .wallet-status, .connecting-status {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: rgba(255,255,255,0.9);
          font-weight: 500;
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          background: #4ade80;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #fbbf24;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
          font-size: 1rem;
        }

        .btn-hero {
          padding: 1.25rem 2.5rem;
          font-size: 1.1rem;
          border-radius: 16px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          box-shadow: 0 10px 30px rgba(240, 147, 251, 0.4);
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(240, 147, 251, 0.6);
        }

        .btn-secondary {
          background: rgba(255,255,255,0.2);
          color: white;
          border: 2px solid rgba(255,255,255,0.3);
          backdrop-filter: blur(10px);
        }

        .btn-secondary:hover {
          background: rgba(255,255,255,0.3);
          transform: translateY(-3px);
        }

        .btn-outline {
          background: transparent;
          color: white;
          border: 2px solid rgba(255,255,255,0.3);
        }

        .btn-outline:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.5);
        }

        .hero-stats {
          display: flex;
          justify-content: center;
          gap: 3rem;
          flex-wrap: wrap;
        }

        .stat {
          text-align: center;
          color: white;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 900;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-label {
          font-size: 0.9rem;
          opacity: 0.8;
          font-weight: 500;
        }

        /* Features Section */
        .features-section {
          padding: 6rem 2rem;
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          position: relative;
        }

        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-title {
          font-size: 3rem;
          font-weight: 900;
          color: white;
          margin-bottom: 1rem;
        }

        .section-subtitle {
          font-size: 1.2rem;
          color: rgba(255,255,255,0.8);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .feature-card {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 20px;
          padding: 2.5rem;
          text-align: center;
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 100%);
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .feature-card:hover::before {
          opacity: 1;
        }

        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }

        .feature-icon {
          margin-bottom: 1.5rem;
          display: flex;
          justify-content: center;
        }

        .feature-card h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin-bottom: 1rem;
        }

        .feature-card p {
          color: rgba(255,255,255,0.8);
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .feature-badge {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          display: inline-block;
        }

        /* Showcase Section */
        .showcase-section {
          padding: 6rem 2rem;
          background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
        }

        .showcase-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto 3rem;
        }

        .showcase-item {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.4s ease;
          text-decoration: none;
          color: inherit;
        }

        .showcase-item:hover {
          transform: translateY(-10px);
          box-shadow: 0 25px 70px rgba(0,0,0,0.3);
        }

        .showcase-item.featured {
          grid-column: span 2;
        }

        .nft-image-container {
          position: relative;
          height: 250px;
          overflow: hidden;
        }

        .nft-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .showcase-item:hover .nft-image {
          transform: scale(1.1);
        }

        .living-badge {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .rarity-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%);
          color: #333;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .nft-info {
          padding: 1.5rem;
          color: white;
        }

        .nft-title {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .nft-creator {
          color: rgba(255,255,255,0.7);
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .nft-stats {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .nft-stats .stat {
          text-align: center;
        }

        .nft-stats .stat-label {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.6);
          display: block;
        }

        .nft-stats .stat-value {
          font-size: 1rem;
          font-weight: 600;
          color: #f093fb;
        }

        .nft-price {
          font-size: 1.5rem;
          font-weight: 900;
          color: #4ade80;
          text-align: center;
        }

        .nft-details {
          color: rgba(255,255,255,0.6);
          font-size: 0.8rem;
        }

        .showcase-cta {
          text-align: center;
        }

        .loading-state, .error-state {
          text-align: center;
          padding: 4rem 2rem;
          color: white;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top: 3px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-text, .error-text {
          font-size: 1.2rem;
          margin-top: 1rem;
        }

        .error-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        /* Comparison Section */
        .comparison-section {
          padding: 6rem 2rem;
          background: linear-gradient(135deg, #134e5e 0%, #71b280 100%);
        }

        .comparison-container {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 3rem;
          max-width: 1000px;
          margin: 0 auto;
          align-items: center;
        }

        .comparison-side {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 20px;
          padding: 2.5rem;
        }

        .comparison-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.5rem;
        }

        .comparison-header p {
          color: rgba(255,255,255,0.7);
          margin-bottom: 2rem;
        }

        .comparison-items {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .comparison-item {
          padding: 1rem;
          border-radius: 12px;
          font-weight: 500;
        }

        .traditional .comparison-item {
          background: rgba(239, 68, 68, 0.2);
          color: #fca5a5;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .dgc .comparison-item {
          background: rgba(34, 197, 94, 0.2);
          color: #86efac;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .comparison-arrow {
          text-align: center;
          color: white;
        }

        .arrow-icon {
          font-size: 3rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }

        .arrow-text {
          font-size: 0.9rem;
          font-weight: 600;
          opacity: 0.8;
        }

        /* Dashboard Preview Section */
        .dashboard-preview-section {
          padding: 6rem 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .dashboard-features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          max-width: 1000px;
          margin: 0 auto 4rem;
        }

        .dashboard-feature {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          color: white;
        }

        .feature-icon-large {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .dashboard-feature h3 {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .dashboard-feature p {
          color: rgba(255,255,255,0.8);
          line-height: 1.6;
        }

        .dashboard-preview {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 20px;
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }

          .section-title {
            font-size: 2rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .showcase-item.featured {
            grid-column: span 1;
          }

          .comparison-container {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .arrow-icon {
            transform: rotate(90deg);
          }

          .hero-features {
            flex-direction: column;
            align-items: center;
          }

          .hero-stats {
            gap: 2rem;
          }

          .dashboard-features {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 2rem;
          }

          .btn-hero {
            padding: 1rem 1.5rem;
            font-size: 1rem;
          }

          .showcase-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

export default HomePage