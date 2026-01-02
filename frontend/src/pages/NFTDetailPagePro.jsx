/**
 * NFT Detail Page - Immersive Showcase
 * DGC Platform
 * Author: Sourav Rajak
 */

import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'

export default function NFTDetailPage() {
  const { tokenId } = useParams()
  const [activeTab, setActiveTab] = useState('traits')

  // Mock NFT data
  const nft = {
    id: tokenId,
    name: `Living NFT #${tokenId}`,
    description: 'A unique living NFT with genetic DNA that evolves over time. This piece responds to emotions and develops consciousness through interaction.',
    creator: '0x1234...5678',
    owner: '0xabcd...efgh',
    price: '2.5',
    color: '#8B5CF6',
    rarity: 'Legendary',
    created: new Date().toLocaleDateString(),
    traits: [
      { type: 'Background', value: 'Cosmic Nebula', rarity: '12%' },
      { type: 'DNA Sequence', value: 'Alpha-7', rarity: '5%' },
      { type: 'Consciousness', value: 'Awakened', rarity: '2%' },
      { type: 'Emotion', value: 'Joyful', rarity: '18%' },
    ],
    activity: [
      { type: 'Sale', from: '0x1234...', to: '0xabcd...', price: '2.5 ETH', time: '2 hours ago' },
      { type: 'List', from: '0xabcd...', price: '2.5 ETH', time: '1 day ago' },
      { type: 'Mint', from: '0x0000...', to: '0x1234...', time: '7 days ago' },
    ]
  }

  return (
    <div className="nft-detail-premium">
      <div className="detail-container">
        {/* Breadcrumbs */}
        <div className="breadcrumbs">
          <Link to="/marketplace" className="breadcrumb-link">Marketplace</Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{nft.name}</span>
        </div>

        {/* Main Grid */}
        <div className="detail-grid">
          {/* Left: Image */}
          <div className="image-section">
            <Card variant="default" hover={false}>
              <div className="nft-showcase">
                <div 
                  className="showcase-image"
                  style={{ background: `linear-gradient(135deg, ${nft.color}40 0%, ${nft.color}10 100%)` }}
                >
                  <div className="showcase-emoji">✨</div>
                  <div className="showcase-glow" style={{ background: nft.color }} />
                </div>
                <div className="showcase-controls">
                  <button className="control-btn">🔍 Zoom</button>
                  <button className="control-btn">⬇️ Download</button>
                  <button className="control-btn">🔗 Share</button>
                </div>
              </div>
            </Card>

            {/* DNA Info */}
            <Card variant="gradient" hover={false} className="dna-card">
              <h3 className="card-title">🧬 Genetic DNA</h3>
              <div className="dna-sequence">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="dna-block" style={{ background: nft.color }}>
                    {Math.random().toString(36).substr(2, 2).toUpperCase()}
                  </div>
                ))}
              </div>
              <p className="dna-desc">This NFT has unique genetic code that evolves over time</p>
            </Card>
          </div>

          {/* Right: Details */}
          <div className="info-section">
            {/* Header */}
            <div className="nft-header">
              <div>
                <div className="collection-link">DGC Living Collection</div>
                <h1 className="nft-title">{nft.name}</h1>
                <p className="nft-description">{nft.description}</p>
              </div>
              <div className="rarity-badge">{nft.rarity}</div>
            </div>

            {/* Owner/Creator */}
            <div className="ownership-grid">
              <Card variant="default" hover={false}>
                <div className="ownership-card">
                  <div className="label">Creator</div>
                  <div className="address-row">
                    <div className="address-avatar" style={{ background: '#EC4899' }} />
                    <span className="address">{nft.creator}</span>
                  </div>
                </div>
              </Card>
              <Card variant="default" hover={false}>
                <div className="ownership-card">
                  <div className="label">Owner</div>
                  <div className="address-row">
                    <div className="address-avatar" style={{ background: '#06B6D4' }} />
                    <span className="address">{nft.owner}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Price & Actions */}
            <Card variant="gradient" hover={false} className="price-card">
              <div className="price-section">
                <div className="price-label">Current Price</div>
                <div className="price-value">{nft.price} ETH</div>
                <div className="price-usd">≈ $7,542.50 USD</div>
              </div>
              <div className="action-buttons">
                <Button variant="primary" size="lg" fullWidth icon="🛒">
                  Buy Now
                </Button>
                <div className="action-grid">
                  <Button variant="outline">Make Offer</Button>
                  <Button variant="outline">Add to Cart</Button>
                </div>
              </div>
            </Card>

            {/* Tabs */}
            <div className="tabs-section">
              <div className="tabs-header">
                <button 
                  className={`tab-btn ${activeTab === 'traits' ? 'active' : ''}`}
                  onClick={() => setActiveTab('traits')}
                >
                  Traits
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
                  onClick={() => setActiveTab('activity')}
                >
                  Activity
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                  onClick={() => setActiveTab('details')}
                >
                  Details
                </button>
              </div>

              <div className="tabs-content">
                {activeTab === 'traits' && (
                  <div className="traits-grid">
                    {nft.traits.map((trait, i) => (
                      <div key={i} className="trait-card">
                        <div className="trait-type">{trait.type}</div>
                        <div className="trait-value">{trait.value}</div>
                        <div className="trait-rarity">{trait.rarity} rarity</div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="activity-list">
                    {nft.activity.map((item, i) => (
                      <div key={i} className="activity-item">
                        <div className="activity-icon">{item.type === 'Sale' ? '💰' : item.type === 'List' ? '📝' : '⚡'}</div>
                        <div className="activity-info">
                          <div className="activity-type">{item.type}</div>
                          <div className="activity-addresses">
                            {item.from && <span>From {item.from}</span>}
                            {item.to && <span>To {item.to}</span>}
                          </div>
                        </div>
                        <div className="activity-meta">
                          {item.price && <div className="activity-price">{item.price}</div>}
                          <div className="activity-time">{item.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'details' && (
                  <div className="details-list">
                    <div className="detail-row">
                      <span>Contract Address</span>
                      <span className="mono">0x1234...5678</span>
                    </div>
                    <div className="detail-row">
                      <span>Token ID</span>
                      <span className="mono">#{nft.id}</span>
                    </div>
                    <div className="detail-row">
                      <span>Token Standard</span>
                      <span>ERC-721</span>
                    </div>
                    <div className="detail-row">
                      <span>Blockchain</span>
                      <span>Ethereum</span>
                    </div>
                    <div className="detail-row">
                      <span>Created</span>
                      <span>{nft.created}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{styles}</style>
    </div>
  )
}

const styles = `
  .nft-detail-premium {
    min-height: 100vh;
    padding: 100px 0 60px;
    background: var(--bg-primary);
  }

  .detail-container {
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 clamp(1rem, 5vw, 2rem);
  }

  .breadcrumbs {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 32px;
    font-size: 14px;
  }

  .breadcrumb-link {
    color: rgba(255, 255, 255, 0.6);
    text-decoration: none;
    transition: color 0.2s;
  }

  .breadcrumb-link:hover {
    color: var(--primary-color);
  }

  .breadcrumb-sep {
    color: rgba(255, 255, 255, 0.3);
  }

  .breadcrumb-current {
    color: var(--text-primary);
    font-weight: 600;
  }

  .detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
  }

  /* Image Section */
  .image-section {
    display: flex;
    flex-direction: column;
    gap: 24px;
    position: sticky;
    top: 100px;
    height: fit-content;
  }

  .nft-showcase {
    padding: 0;
  }

  .showcase-image {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 20px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    margin-bottom: 24px;
  }

  .showcase-emoji {
    font-size: 150px;
    position: relative;
    z-index: 1;
  }

  .showcase-glow {
    position: absolute;
    inset: -80%;
    filter: blur(100px);
    opacity: 0.3;
    animation: pulse 4s ease-in-out infinite;
  }

  .showcase-controls {
    display: flex;
    gap: 12px;
    padding-bottom: 20px;
  }

  .control-btn {
    flex: 1;
    padding: 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    color: var(--text-primary);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .control-btn:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: var(--primary-color);
  }

  .dna-card .card-content {
    text-align: center;
  }

  .card-title {
    font-size: 1.2rem;
    font-weight: 700;
    margin: 0 0 20px;
  }

  .dna-sequence {
    display: flex;
    gap: 8px;
    justify-content: center;
    margin-bottom: 16px;
  }

  .dna-block {
    width: 50px;
    height: 50px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-family-mono);
    font-weight: 700;
    font-size: 12px;
    color: white;
  }

  .dna-desc {
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
    margin: 0;
  }

  /* Info Section */
  .nft-header {
    margin-bottom: 32px;
    display: flex;
    justify-content: space-between;
    gap: 24px;
  }

  .collection-link {
    font-size: 14px;
    color: var(--primary-color);
    margin-bottom: 8px;
  }

  .nft-title {
    font-family: var(--font-family-display);
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 900;
    margin: 0 0 16px;
  }

  .nft-description {
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.7;
    margin: 0;
  }

  .rarity-badge {
    padding: 8px 16px;
    background: var(--gradient-primary);
    border-radius: 100px;
    font-size: 13px;
    font-weight: 700;
    height: fit-content;
    text-transform: uppercase;
  }

  .ownership-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 24px;
  }

  .ownership-card {
    padding: 16px;
  }

  .label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 12px;
  }

  .address-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .address-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
  }

  .address {
    font-family: var(--font-family-mono);
    font-size: 14px;
    font-weight: 600;
  }

  .price-card {
    margin-bottom: 32px;
  }

  .price-card .card-content {
    padding: 32px;
  }

  .price-section {
    text-align: center;
    margin-bottom: 28px;
  }

  .price-label {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 12px;
  }

  .price-value {
    font-family: var(--font-family-display);
    font-size: 3rem;
    font-weight: 900;
    margin-bottom: 8px;
  }

  .price-usd {
    color: rgba(255, 255, 255, 0.5);
  }

  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .action-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  /* Tabs */
  .tabs-section {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    overflow: hidden;
  }

  .tabs-header {
    display: flex;
    gap: 4px;
    padding: 8px;
    background: rgba(0, 0, 0, 0.2);
  }

  .tab-btn {
    flex: 1;
    padding: 12px 24px;
    background: transparent;
    border: none;
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .tab-btn:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.03);
  }

  .tab-btn.active {
    background: var(--primary-color);
    color: white;
  }

  .tabs-content {
    padding: 24px;
  }

  .traits-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .trait-card {
    padding: 20px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    text-align: center;
  }

  .trait-type {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 8px;
    text-transform: uppercase;
  }

  .trait-value {
    font-weight: 700;
    font-size: 1.1rem;
    margin-bottom: 6px;
  }

  .trait-rarity {
    font-size: 13px;
    color: var(--primary-color);
  }

  .activity-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .activity-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
  }

  .activity-icon {
    font-size: 24px;
  }

  .activity-info {
    flex: 1;
  }

  .activity-type {
    font-weight: 600;
    margin-bottom: 4px;
  }

  .activity-addresses {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    font-family: var(--font-family-mono);
  }

  .activity-meta {
    text-align: right;
  }

  .activity-price {
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 4px;
  }

  .activity-time {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  .details-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 10px;
  }

  .detail-row span:first-child {
    color: rgba(255, 255, 255, 0.6);
  }

  .detail-row span:last-child {
    font-weight: 600;
  }

  .mono {
    font-family: var(--font-family-mono);
  }

  @media (max-width: 1024px) {
    .detail-grid {
      grid-template-columns: 1fr;
    }

    .image-section {
      position: static;
    }
  }

  @media (max-width: 640px) {
    .ownership-grid {
      grid-template-columns: 1fr;
    }

    .traits-grid {
      grid-template-columns: 1fr;
    }
  }
`
