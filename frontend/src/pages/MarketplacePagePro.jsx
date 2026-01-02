/**
 * Marketplace Page - Premium NFT Gallery
 * DGC Platform
 * Author: Sourav Rajak
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [filterPrice, setFilterPrice] = useState('all')
  const [viewMode, setViewMode] = useState('grid')

  // Mock NFT data
  const nfts = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: `Living NFT #${1000 + i}`,
    creator: `0x${Math.random().toString(16).slice(2, 10)}...`,
    price: (Math.random() * 5 + 0.5).toFixed(2),
    likes: Math.floor(Math.random() * 200) + 20,
    color: ['#8B5CF6', '#EC4899', '#06B6D4', '#F59E0B', '#10B981'][i % 5],
    rarity: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'][i % 5],
  }))

  return (
    <div className="marketplace-premium">
      <div className="marketplace-container">
        {/* Header */}
        <div className="marketplace-header">
          <div>
            <h1 className="marketplace-title">
              NFT <span className="gradient-text">Marketplace</span>
            </h1>
            <p className="marketplace-subtitle">Discover living, evolving digital art</p>
          </div>
          <div className="header-stats">
            <div className="stat-box">
              <div className="stat-value">{nfts.length}</div>
              <div className="stat-label">Items</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">12K+</div>
              <div className="stat-label">Owners</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">$2.5M</div>
              <div className="stat-label">Volume</div>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="filters-bar">
          <div className="search-wrapper">
            <Input
              placeholder="Search NFTs..."
              prefix="🔍"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-controls">
            <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="recent">Recently Listed</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>

            <select className="filter-select" value={filterPrice} onChange={(e) => setFilterPrice(e.target.value)}>
              <option value="all">All Prices</option>
              <option value="0-1">0 - 1 ETH</option>
              <option value="1-5">1 - 5 ETH</option>
              <option value="5+">5+ ETH</option>
            </select>

            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                ⊞
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                ☰
              </button>
            </div>
          </div>
        </div>

        {/* NFT Grid */}
        <div className={`nft-gallery ${viewMode}`}>
          {nfts.map((nft) => (
            <Link key={nft.id} to={`/nft/${nft.id}`} className="nft-item">
              <Card variant="default" hover>
                <div className="nft-card-content">
                  <div className="nft-image-wrap">
                    <div 
                      className="nft-image"
                      style={{ background: `linear-gradient(135deg, ${nft.color}40 0%, ${nft.color}10 100%)` }}
                    >
                      <div className="nft-emoji">✨</div>
                      <div className="nft-glow" style={{ background: nft.color }} />
                    </div>
                    <div className="nft-badge">{nft.rarity}</div>
                  </div>

                  <div className="nft-info">
                    <div className="nft-top">
                      <h3 className="nft-name">{nft.name}</h3>
                      <div className="nft-likes">
                        <span>❤️</span>
                        <span>{nft.likes}</span>
                      </div>
                    </div>

                    <div className="nft-creator">
                      <div className="creator-avatar" style={{ background: nft.color }} />
                      <span className="creator-address">{nft.creator}</span>
                    </div>

                    <div className="nft-footer">
                      <div className="price-section">
                        <span className="price-label">Price</span>
                        <span className="price-value">{nft.price} ETH</span>
                      </div>
                      <Button variant="primary" size="sm">
                        Buy Now
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Load More */}
        <div className="load-more">
          <Button variant="outline" size="lg">
            Load More NFTs
          </Button>
        </div>
      </div>

      <style>{styles}</style>
    </div>
  )
}

const styles = `
  .marketplace-premium {
    min-height: 100vh;
    padding: 100px 0 60px;
    background: var(--bg-primary);
  }

  .marketplace-container {
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 clamp(1rem, 5vw, 2rem);
  }

  .marketplace-header {
    margin-bottom: 48px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 32px;
    flex-wrap: wrap;
  }

  .marketplace-title {
    font-family: var(--font-family-display);
    font-size: clamp(2.5rem, 5vw, 3.5rem);
    font-weight: 900;
    margin: 0 0 8px;
  }

  .marketplace-subtitle {
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .header-stats {
    display: flex;
    gap: 24px;
  }

  .stat-box {
    padding: 16px 24px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    text-align: center;
  }

  .stat-value {
    font-family: var(--font-family-display);
    font-size: 1.8rem;
    font-weight: 800;
    margin-bottom: 4px;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .stat-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  .filters-bar {
    display: flex;
    gap: 16px;
    margin-bottom: 40px;
    flex-wrap: wrap;
  }

  .search-wrapper {
    flex: 1;
    min-width: 280px;
  }

  .filter-controls {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .filter-select {
    padding: 12px 20px;
    background: rgba(255, 255, 255, 0.03);
    border: 2px solid var(--border-color);
    border-radius: 12px;
    color: var(--text-primary);
    font-family: var(--font-family);
    font-size: 14px;
    cursor: pointer;
    outline: none;
    transition: all 0.2s;
  }

  .filter-select:focus,
  .filter-select:hover {
    border-color: var(--primary-color);
  }

  .view-toggle {
    display: flex;
    gap: 4px;
    background: rgba(255, 255, 255, 0.03);
    border: 2px solid var(--border-color);
    border-radius: 12px;
    padding: 4px;
  }

  .view-btn {
    width: 40px;
    height: 40px;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    font-size: 18px;
    transition: all 0.2s;
  }

  .view-btn:hover {
    color: var(--text-primary);
  }

  .view-btn.active {
    background: var(--primary-color);
    color: white;
  }

  .nft-gallery {
    display: grid;
    gap: 24px;
    margin-bottom: 48px;
  }

  .nft-gallery.grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }

  .nft-gallery.list {
    grid-template-columns: 1fr;
  }

  .nft-item {
    text-decoration: none;
    color: inherit;
  }

  .nft-card-content {
    padding: 0;
  }

  .nft-image-wrap {
    position: relative;
    margin-bottom: 16px;
  }

  .nft-image {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 16px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nft-emoji {
    font-size: 80px;
    position: relative;
    z-index: 1;
  }

  .nft-glow {
    position: absolute;
    inset: -50%;
    filter: blur(60px);
    opacity: 0.25;
  }

  .nft-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    padding: 6px 12px;
    background: rgba(0, 0, 0, 0.7);
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
  }

  .nft-info {
    padding: 0 20px 20px;
  }

  .nft-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
  }

  .nft-name {
    font-size: 1.2rem;
    font-weight: 700;
    margin: 0;
  }

  .nft-likes {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
  }

  .nft-creator {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
  }

  .creator-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
  }

  .creator-address {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
    font-family: var(--font-family-mono);
  }

  .nft-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }

  .price-section {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .price-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  .price-value {
    font-family: var(--font-family-display);
    font-size: 1.2rem;
    font-weight: 800;
    color: var(--primary-color);
  }

  .load-more {
    text-align: center;
  }

  @media (max-width: 768px) {
    .header-stats {
      width: 100%;
      justify-content: space-between;
    }

    .nft-gallery.grid {
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    }
  }
`
