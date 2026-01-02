/**
 * Landing Page - Premium Edition
 * DGC Platform - Digital Art Evolution
 * @author Sourav Rajak (morningstarxcdcode)
 * @version 2.0.0
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import {
  DNAIcon,
  HeartIcon,
  BrainIcon,
  BoltIcon,
  PaletteIcon,
  DiamondIcon,
  ArtistIcon,
  RocketIcon
} from '../components/ui/Icons.jsx'

export default function LandingPage() {
  const { isConnected } = useWallet()
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleMouse = (e) => setMousePos({ x: e.clientX, y: e.clientY })
    const handleScroll = () => setScrollY(window.scrollY)
    
    window.addEventListener('mousemove', handleMouse)
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('mousemove', handleMouse)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Platform statistics
  const stats = [
    { value: '50K+', label: 'Living NFTs', Icon: PaletteIcon },
    { value: '$2.5M', label: 'Volume', Icon: DiamondIcon },
    { value: '12K+', label: 'Creators', Icon: ArtistIcon },
    { value: '99.9%', label: 'Uptime', Icon: BoltIcon },
  ]

  // Core platform features
  const features = [
    {
      Icon: DNAIcon,
      title: 'Genetic DNA System',
      description: 'NFTs with unique genetic code that evolves over time',
      color: '#8B5CF6'
    },
    {
      Icon: HeartIcon,
      title: 'Emotional Intelligence',
      description: 'Art that responds to your feelings and emotions',
      color: '#EC4899'
    },
    {
      Icon: BrainIcon,
      title: 'Living Consciousness',
      description: 'NFTs that become self-aware through interaction',
      color: '#06B6D4'
    },
    {
      Icon: BoltIcon,
      title: 'Zero Complexity',
      description: 'Auto-wallet creation, no MetaMask required',
      color: '#F59E0B'
    },
  ]

  // NFT showcase with real images
  const showcase = [
    { id: 1, name: 'Cosmic Dreamer', price: '2.5', image: '/images/hero-nft.png', color: '#8B5CF6' },
    { id: 2, name: 'Neural Genesis', price: '1.8', image: '/images/nft-1.png', color: '#EC4899' },
    { id: 3, name: 'Digital Soul', price: '3.2', image: '/images/nft-2.png', color: '#06B6D4' },
  ]

  return (
    <div className="landing-ultra">
      {/* Animated Background */}
      <div className="bg-layer">
        <div className="orb orb-1" style={{
          transform: `translate(${mousePos.x * 0.02}px, ${mousePos.y * 0.02}px)`
        }} />
        <div className="orb orb-2" style={{
          transform: `translate(${-mousePos.x * 0.015}px, ${mousePos.y * 0.015}px)`
        }} />
        <div className="orb orb-3" style={{
          transform: `translate(${mousePos.x * 0.01}px, ${-mousePos.y * 0.01}px)`
        }} />
        <div className="grid-bg" />
        <div className="noise-texture" />
      </div>

      {/* Hero Section */}
      <section className="hero-ultra">
        <div className="container-ultra">
          <div className="hero-grid">
            {/* Left: Content */}
            <div className="hero-content">
              <div className="badge-pill animate-fade-in">
                <span className="pulse-dot" />
                <span>🚀 The Future of Digital Art</span>
              </div>

              <h1 className="hero-headline">
                <span className="line animate-fade-in-up stagger-1">Create.</span>
                <span className="line gradient-aurora animate-fade-in-up stagger-2">Evolve.</span>
                <span className="line animate-fade-in-up stagger-3">Own Forever.</span>
              </h1>

              <p className="hero-desc animate-fade-in-up stagger-4">
                Transform your imagination into <span className="text-highlight">blockchain-verified masterpieces</span>. 
                Experience living NFTs with genetic evolution, emotional intelligence, and true digital ownership.
              </p>

              <div className="hero-actions animate-fade-in-up stagger-5">
                <Link to="/generate">
                  <Button variant="primary" size="lg" icon="✨">
                    Start Creating Free
                  </Button>
                </Link>
                <Link to="/marketplace">
                  <Button variant="glass" size="lg">
                    Explore Gallery
                  </Button>
                </Link>
              </div>

              {/* Stats Pills */}
              <div className="stats-row animate-fade-in-up stagger-6">
                {stats.map((stat, i) => (
                  <div key={i} className="stat-bubble">
                    <span className="stat-icon">
                      <stat.Icon size={28} />
                    </span>
                    <div className="stat-data">
                      <div className="stat-value">{stat.value}</div>
                      <div className="stat-label">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: 3D Showcase */}
            <div className="hero-visual">
              <div className="showcase-stack">
                {showcase.map((nft, i) => (
                  <div
                    key={nft.id}
                    className={`nft-float nft-${i}`}
                    style={{
                      transform: `
                        perspective(1000px)
                        rotateY(${-10 + mousePos.x * 0.01}deg)
                        rotateX(${10 - mousePos.y * 0.01}deg)
                        translateZ(${i * -40}px)
                        translateY(${i * 30}px)
                      `,
                      animationDelay: `${i * 0.2}s`
                    }}
                  >
                    <div className="nft-card-3d">
                      <div className="nft-glow" style={{ background: nft.color }} />
                      <div className="nft-image">
                        <img
                          src={nft.image}
                          alt={nft.name}
                          className="nft-artwork"
                          loading="lazy"
                        />
                      </div>
                      <div className="nft-meta">
                        <span className="nft-title">{nft.name}</span>
                        <span className="nft-price">{nft.price} ETH</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="orbit-ring animate-rotate" />
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Ticker */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="marquee-items">
              <span>🎨 AI Art</span>
              <span className="dot">◆</span>
              <span>🧬 Genetic DNA</span>
              <span className="dot">◆</span>
              <span>💖 Emotional AI</span>
              <span className="dot">◆</span>
              <span>🧠 Living NFTs</span>
              <span className="dot">◆</span>
              <span>⚡ Instant Mint</span>
              <span className="dot">◆</span>
            </div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <section className="features-ultra">
        <div className="container-ultra">
          <div className="section-heading">
            <span className="section-tag">Revolutionary Technology</span>
            <h2 className="section-title">
              Powered by <span className="gradient-text">Innovation</span>
            </h2>
            <p className="section-subtitle">
              Built for creators who demand the best. Every feature designed to empower your vision.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, i) => (
              <Card key={i} variant="default" hover glow={false}>
                <div className="feature-card-inner">
                  <div className="feature-icon-wrap" style={{ '--feature-color': feature.color }}>
                    <div className="feature-icon">
                      <feature.Icon size={40} />
                    </div>
                    <div className="icon-ring" />
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-text">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="process-ultra">
        <div className="container-ultra">
          <div className="section-heading">
            <span className="section-tag">Simple Process</span>
            <h2 className="section-title">
              How It <span className="gradient-text">Works</span>
            </h2>
          </div>

          <div className="process-flow">
            {[
              { step: '01', title: 'Connect', desc: 'Auto-wallet or MetaMask', icon: '🔐' },
              { step: '02', title: 'Create', desc: 'AI-powered generation', icon: '🎨' },
              { step: '03', title: 'Mint', desc: 'On-chain verification', icon: '⚡' },
              { step: '04', title: 'Earn', desc: 'Royalties forever', icon: '💰' },
            ].map((item, i) => (
              <div key={i} className="process-card">
                <div className="process-number">{item.step}</div>
                <div className="process-icon">{item.icon}</div>
                <h4 className="process-title">{item.title}</h4>
                <p className="process-desc">{item.desc}</p>
                {i < 3 && <div className="process-connector" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-ultra">
        <div className="container-ultra">
          <Card variant="gradient" hover={false} className="cta-card">
            <div className="cta-content">
              <h2 className="cta-title">Ready to Create Your Masterpiece?</h2>
              <p className="cta-subtitle">Join thousands of artists revolutionizing digital ownership</p>
              <Link to="/generate">
                <Button variant="primary" size="lg" icon="🚀">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      <style>{styles}</style>
    </div>
  )
}

const styles = `
  .landing-ultra {
    min-height: 100vh;
    position: relative;
    overflow-x: hidden;
  }

  /* Background */
  .bg-layer {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: -1;
  }

  .orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    opacity: 0.4;
    transition: transform 0.3s ease-out;
  }

  .orb-1 {
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(139, 92, 246, 0.5) 0%, transparent 70%);
    top: -200px;
    right: -100px;
    animation: float 20s ease-in-out infinite;
  }

  .orb-2 {
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, transparent 70%);
    bottom: -100px;
    left: -150px;
    animation: float 25s ease-in-out infinite reverse;
  }

  .orb-3 {
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, transparent 70%);
    top: 40%;
    left: 60%;
    animation: float 15s ease-in-out infinite;
  }

  .grid-bg {
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
    background-size: 50px 50px;
    mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 100%);
    -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 100%);
  }

  .noise-texture {
    position: absolute;
    inset: 0;
    opacity: 0.03;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  /* Hero */
  .hero-ultra {
    min-height: 100vh;
    display: flex;
    align-items: center;
    padding: 120px 0 60px;
  }

  .container-ultra {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 clamp(1rem, 5vw, 2rem);
  }

  .hero-grid {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 60px;
    align-items: center;
  }

  .hero-content {
    max-width: 650px;
  }

  .badge-pill {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 20px;
    background: rgba(139, 92, 246, 0.1);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 100px;
    font-size: 14px;
    font-weight: 600;
    color: #A78BFA;
    margin-bottom: 32px;
  }

  .pulse-dot {
    width: 8px;
    height: 8px;
    background: #10B981;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  .hero-headline {
    font-family: var(--font-family-display);
    font-size: clamp(3.5rem, 9vw, 6rem);
    font-weight: 900;
    line-height: 1.05;
    margin: 0 0 32px;
    letter-spacing: -0.04em;
  }

  .hero-headline .line {
    display: block;
  }

  .gradient-aurora {
    background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #06B6D4 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-desc {
    font-size: 1.25rem;
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 40px;
  }

  .text-highlight {
    color: #A78BFA;
    font-weight: 600;
  }

  .hero-actions {
    display: flex;
    gap: 16px;
    margin-bottom: 48px;
    flex-wrap: wrap;
  }

  .stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }

  .stat-bubble {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
  }

  .stat-icon {
    font-size: 28px;
  }

  .stat-value {
    font-family: var(--font-family-display);
    font-size: 1.3rem;
    font-weight: 800;
    line-height: 1;
  }

  .stat-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  /* 3D Showcase */
  .hero-visual {
    position: relative;
    height: 500px;
    perspective: 1200px;
  }

  .showcase-stack {
    position: absolute;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
  }

  .nft-float {
    position: absolute;
    inset: 0;
    transition: transform 0.15s ease-out;
    animation: float 6s ease-in-out infinite;
  }

  .nft-card-3d {
    width: 300px;
    height: 380px;
    margin: 0 auto;
    background: linear-gradient(145deg, rgba(30, 30, 50, 0.95) 0%, rgba(20, 20, 35, 1) 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    overflow: hidden;
    position: relative;
  }

  .nft-glow {
    position: absolute;
    inset: -100%;
    opacity: 0.2;
    filter: blur(50px);
    animation: pulse 3s ease-in-out infinite;
  }

  .nft-image {
    height: 75%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(20, 20, 35, 1) 100%);
  }

  .nft-artwork {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
  }

  .nft-card-3d:hover .nft-artwork {
    transform: scale(1.05);
  }

  .nft-meta {
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .nft-title {
    font-weight: 700;
    font-size: 16px;
  }

  .nft-price {
    font-family: var(--font-family-display);
    font-weight: 800;
    color: #A78BFA;
  }

  .orbit-ring {
    position: absolute;
    inset: -100px;
    border: 1px solid rgba(139, 92, 246, 0.2);
    border-radius: 50%;
    pointer-events: none;
  }

  .orbit-ring::before {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    background: #8B5CF6;
    border-radius: 50%;
    top: 50%;
    left: 0;
    filter: blur(4px);
    box-shadow: 0 0 30px rgba(139, 92, 246, 0.6);
  }

  /* Marquee */
  .marquee-wrap {
    padding: 20px 0;
    background: rgba(139, 92, 246, 0.05);
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    overflow: hidden;
  }

  .marquee-track {
    display: flex;
    animation: marquee 30s linear infinite;
  }

  .marquee-items {
    display: flex;
    align-items: center;
    gap: 40px;
    padding: 0 20px;
    font-size: 17px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.6);
    white-space: nowrap;
  }

  .marquee-items .dot {
    color: rgba(139, 92, 246, 0.4);
    font-size: 10px;
  }

  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  /* Features */
  .features-ultra {
    padding: 100px 0;
  }

  .section-heading {
    text-align: center;
    max-width: 700px;
    margin: 0 auto 80px;
  }

  .section-tag {
    display: inline-block;
    padding: 8px 20px;
    background: rgba(139, 92, 246, 0.1);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 100px;
    font-size: 13px;
    font-weight: 700;
    color: #A78BFA;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 24px;
  }

  .section-title {
    font-family: var(--font-family-display);
    font-size: clamp(2.5rem, 6vw, 4rem);
    font-weight: 900;
    margin: 0 0 20px;
    letter-spacing: -0.03em;
  }

  .gradient-text {
    background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .section-subtitle {
    font-size: 1.15rem;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.6;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
  }

  .feature-card-inner {
    text-align: center;
  }

  .feature-icon-wrap {
    position: relative;
    width: 80px;
    height: 80px;
    margin: 0 auto 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .feature-icon {
    font-size: 40px;
    position: relative;
    z-index: 1;
  }

  .icon-ring {
    position: absolute;
    inset: 0;
    border: 2px solid var(--feature-color, var(--primary-color));
    border-radius: 50%;
    opacity: 0.3;
    animation: pulse 3s ease-in-out infinite;
  }

  .feature-title {
    font-size: 1.4rem;
    font-weight: 700;
    margin: 0 0 12px;
  }

  .feature-text {
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.6;
  }

  /* Process */
  .process-ultra {
    padding: 100px 0;
  }

  .process-flow {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 32px;
    position: relative;
  }

  .process-card {
    position: relative;
    text-align: center;
    padding: 32px 24px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
  }

  .process-number {
    font-family: var(--font-family-display);
    font-size: 3rem;
    font-weight: 900;
    background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    opacity: 0.5;
    margin-bottom: 16px;
  }

  .process-icon {
    font-size: 48px;
    margin-bottom: 20px;
  }

  .process-title {
    font-size: 1.3rem;
    font-weight: 700;
    margin: 0 0 8px;
  }

  .process-desc {
    color: rgba(255, 255, 255, 0.5);
    font-size: 14px;
  }

  .process-connector {
    position: absolute;
    top: 80px;
    right: -16px;
    width: 32px;
    height: 2px;
    background: linear-gradient(90deg, rgba(139, 92, 246, 0.3) 0%, transparent 100%);
  }

  /* CTA */
  .cta-ultra {
    padding: 100px 0;
  }

  .cta-card .card-content {
    padding: 80px;
  }

  .cta-content {
    text-align: center;
  }

  .cta-title {
    font-family: var(--font-family-display);
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 900;
    margin: 0 0 16px;
  }

  .cta-subtitle {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.7);
    margin: 0 0 32px;
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .hero-grid {
      grid-template-columns: 1fr;
      gap: 80px;
    }

    .hero-visual {
      height: 400px;
    }

    .stats-row {
      grid-template-columns: repeat(2, 1fr);
    }

    .process-flow {
      grid-template-columns: repeat(2, 1fr);
    }

    .process-connector {
      display: none;
    }
  }

  @media (max-width: 640px) {
    .hero-actions {
      flex-direction: column;
    }

    .features-grid {
      grid-template-columns: 1fr;
    }

    .process-flow {
      grid-template-columns: 1fr;
    }

    .cta-card .card-content {
      padding: 40px;
    }
  }
`
