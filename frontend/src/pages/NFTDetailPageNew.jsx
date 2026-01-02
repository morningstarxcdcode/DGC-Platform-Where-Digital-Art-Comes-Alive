/**
 * NFT Detail Page - Premium Professional Design
 * Author: Sourav Rajak (morningstarxcdcode)
 * Version: 2.0.0
 */

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet.jsx'

export default function NFTDetailPage() {
  const { tokenId } = useParams()
  const { address, isConnected } = useWallet()
  const [nft, setNft] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('details')
  const [bidAmount, setBidAmount] = useState('')
  const [showBidModal, setShowBidModal] = useState(false)

  useEffect(() => {
    fetchNFTDetails()
  }, [tokenId])

  async function fetchNFTDetails() {
    setLoading(true)
    // Demo data
    setTimeout(() => {
      setNft({
        id: tokenId,
        name: 'Cosmic Dreamer #' + tokenId,
        description: 'A mesmerizing exploration of digital consciousness and cosmic energy. This AI-generated masterpiece captures the essence of imagination meeting technology, with flowing forms and ethereal light creating a symphony of visual poetry.',
        image: null,
        price: '2.5',
        highestBid: '2.8',
        owner: '0x1234...5678',
        creator: '0xabcd...efgh',
        createdAt: '2024-01-15',
        views: 1247,
        favorites: 89,
        traits: [
          { type: 'Style', value: 'Abstract', rarity: '12%' },
          { type: 'Palette', value: 'Cosmic', rarity: '8%' },
          { type: 'Complexity', value: 'High', rarity: '15%' },
          { type: 'AI Model', value: 'Stable Diffusion', rarity: '45%' },
          { type: 'Resolution', value: '4K', rarity: '22%' },
        ],
        history: [
          { event: 'Listed', from: '0x1234...5678', price: '2.5 ETH', date: '2d ago' },
          { event: 'Transferred', from: '0x9876...4321', to: '0x1234...5678', date: '5d ago' },
          { event: 'Minted', from: '0xabcd...efgh', date: '10d ago' },
        ],
        bids: [
          { bidder: '0xaaaa...bbbb', amount: '2.8 ETH', date: '1h ago' },
          { bidder: '0xcccc...dddd', amount: '2.3 ETH', date: '4h ago' },
          { bidder: '0xeeee...ffff', amount: '2.0 ETH', date: '1d ago' },
        ],
        provenance: {
          hash: '0x123abc...789xyz',
          ipfs: 'QmXyz...',
          chain: 'Ethereum',
          contract: '0xDGC...Token'
        }
      })
      setLoading(false)
    }, 500)
  }

  if (loading) {
    return (
      <div className="nft-detail-page">
        <div className="loading-container">
          <div className="loader"></div>
          <span>Loading NFT...</span>
        </div>
        <style>{pageStyles}</style>
      </div>
    )
  }

  return (
    <div className="nft-detail-page">
      {/* Breadcrumb */}
      <div className="container">
        <nav className="breadcrumb">
          <Link to="/marketplace">Marketplace</Link>
          <span className="separator">›</span>
          <span>{nft.name}</span>
        </nav>
      </div>

      {/* Main Content */}
      <section className="nft-main">
        <div className="container">
          <div className="nft-grid">
            {/* Left - Artwork */}
            <div className="nft-artwork-section">
              <div className="artwork-container">
                <div className="artwork-frame">
                  {nft.image ? (
                    <img src={nft.image} alt={nft.name} />
                  ) : (
                    <div className="artwork-placeholder">
                      <span>✨</span>
                      <p>AI Generated Artwork</p>
                    </div>
                  )}
                </div>
                <div className="artwork-actions">
                  <button className="action-btn">
                    <span>❤️</span>
                    <span>{nft.favorites}</span>
                  </button>
                  <button className="action-btn">
                    <span>👁️</span>
                    <span>{nft.views}</span>
                  </button>
                  <button className="action-btn">
                    <span>🔗</span>
                    <span>Share</span>
                  </button>
                  <button className="action-btn">
                    <span>⋯</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right - Details */}
            <div className="nft-details-section">
              {/* Title & Creator */}
              <div className="nft-header">
                <div className="collection-badge">
                  <span>🎨</span> DGC Collection
                </div>
                <h1>{nft.name}</h1>
                <div className="creator-info">
                  <div className="creator-avatar">
                    <span>🧑‍🎨</span>
                  </div>
                  <div>
                    <span className="label">Created by</span>
                    <Link to={`/profile/${nft.creator}`} className="creator-link">{nft.creator}</Link>
                  </div>
                </div>
              </div>

              {/* Price Card */}
              <div className="price-card">
                <div className="price-header">
                  <span className="price-label">Current Price</span>
                  <span className="ends-in">⏰ Auction ends in 23h 45m</span>
                </div>
                <div className="price-amount">
                  <span className="eth-icon">Ξ</span>
                  <span className="price-value">{nft.price}</span>
                  <span className="price-usd">≈ $4,250.00</span>
                </div>
                <div className="highest-bid">
                  <span>Highest Bid: </span>
                  <strong>{nft.highestBid} ETH</strong>
                </div>
                <div className="price-actions">
                  <button className="btn btn-primary btn-large">
                    <span>💳</span> Buy Now
                  </button>
                  <button 
                    className="btn btn-outline btn-large"
                    onClick={() => setShowBidModal(true)}
                  >
                    <span>🏷️</span> Place Bid
                  </button>
                </div>
              </div>

              {/* Owner Info */}
              <div className="owner-card">
                <div className="owner-avatar">
                  <span>👤</span>
                </div>
                <div className="owner-info">
                  <span className="label">Owned by</span>
                  <Link to={`/profile/${nft.owner}`} className="owner-link">{nft.owner}</Link>
                </div>
              </div>

              {/* Description */}
              <div className="description-card">
                <h3>Description</h3>
                <p>{nft.description}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="tabs-section">
        <div className="container">
          <div className="tabs">
            {['details', 'traits', 'history', 'bids', 'provenance'].map(tab => (
              <button
                key={tab}
                className={`tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="tab-content">
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-icon">📅</span>
                  <div>
                    <span className="detail-label">Created</span>
                    <span className="detail-value">{nft.createdAt}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">⛓️</span>
                  <div>
                    <span className="detail-label">Blockchain</span>
                    <span className="detail-value">{nft.provenance.chain}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">📜</span>
                  <div>
                    <span className="detail-label">Contract</span>
                    <span className="detail-value">{nft.provenance.contract}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">🆔</span>
                  <div>
                    <span className="detail-label">Token ID</span>
                    <span className="detail-value">#{tokenId}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Traits Tab */}
            {activeTab === 'traits' && (
              <div className="traits-grid">
                {nft.traits.map((trait, i) => (
                  <div key={i} className="trait-card">
                    <span className="trait-type">{trait.type}</span>
                    <span className="trait-value">{trait.value}</span>
                    <span className="trait-rarity">{trait.rarity} have this trait</span>
                  </div>
                ))}
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="history-list">
                {nft.history.map((event, i) => (
                  <div key={i} className="history-item">
                    <div className="history-icon">
                      {event.event === 'Minted' && '🎨'}
                      {event.event === 'Listed' && '📋'}
                      {event.event === 'Transferred' && '🔄'}
                      {event.event === 'Sold' && '💰'}
                    </div>
                    <div className="history-details">
                      <span className="history-event">{event.event}</span>
                      <span className="history-meta">
                        {event.from && `From ${event.from}`}
                        {event.to && ` → ${event.to}`}
                      </span>
                    </div>
                    <div className="history-right">
                      {event.price && <span className="history-price">{event.price}</span>}
                      <span className="history-date">{event.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bids Tab */}
            {activeTab === 'bids' && (
              <div className="bids-list">
                {nft.bids.map((bid, i) => (
                  <div key={i} className="bid-item">
                    <div className="bidder-avatar">
                      <span>👤</span>
                    </div>
                    <div className="bid-details">
                      <span className="bidder-address">{bid.bidder}</span>
                      <span className="bid-date">{bid.date}</span>
                    </div>
                    <span className="bid-amount">{bid.amount}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Provenance Tab */}
            {activeTab === 'provenance' && (
              <div className="provenance-info">
                <div className="provenance-item">
                  <span className="provenance-label">Transaction Hash</span>
                  <span className="provenance-value">{nft.provenance.hash}</span>
                </div>
                <div className="provenance-item">
                  <span className="provenance-label">IPFS Hash</span>
                  <span className="provenance-value">{nft.provenance.ipfs}</span>
                </div>
                <div className="provenance-item">
                  <span className="provenance-label">Verified on</span>
                  <span className="provenance-value verified">✓ {nft.provenance.chain}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bid Modal */}
      {showBidModal && (
        <div className="modal-overlay" onClick={() => setShowBidModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Place a Bid</h3>
              <button className="close-btn" onClick={() => setShowBidModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="modal-subtitle">You are about to place a bid on <strong>{nft.name}</strong></p>
              <div className="bid-input-group">
                <label>Your Bid (ETH)</label>
                <div className="input-wrapper">
                  <span className="eth-symbol">Ξ</span>
                  <input
                    type="number"
                    step="0.01"
                    value={bidAmount}
                    onChange={e => setBidAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <span className="min-bid">Minimum bid: {nft.highestBid} ETH</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowBidModal(false)}>Cancel</button>
              <button className="btn btn-primary" disabled={!bidAmount}>Place Bid</button>
            </div>
          </div>
        </div>
      )}

      <style>{pageStyles}</style>
    </div>
  )
}

const pageStyles = `
  .nft-detail-page {
    min-height: 100vh;
    padding-top: 100px;
    padding-bottom: 100px;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 50vh;
    gap: 16px;
    color: var(--text-secondary);
  }

  .loader {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(137, 90, 246, 0.2);
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Breadcrumb */
  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 20px 0 40px;
    font-size: 14px;
  }

  .breadcrumb a {
    color: var(--text-secondary);
    text-decoration: none;
    transition: color 0.2s;
  }

  .breadcrumb a:hover {
    color: var(--primary-color);
  }

  .separator {
    color: var(--text-tertiary);
  }

  /* Main Grid */
  .nft-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: start;
  }

  /* Artwork Section */
  .artwork-container {
    position: sticky;
    top: 120px;
  }

  .artwork-frame {
    width: 100%;
    aspect-ratio: 1;
    background: linear-gradient(135deg, rgba(137, 90, 246, 0.2) 0%, rgba(109, 40, 217, 0.1) 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .artwork-frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .artwork-placeholder {
    text-align: center;
    padding: 40px;
  }

  .artwork-placeholder span {
    font-size: 80px;
    display: block;
    margin-bottom: 16px;
  }

  .artwork-placeholder p {
    color: var(--text-secondary);
    font-size: 14px;
  }

  .artwork-actions {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-top: 20px;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 12px 20px;
    background: rgba(22, 22, 42, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    font-size: 14px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s;
  }

  .action-btn:hover {
    background: rgba(137, 90, 246, 0.1);
    border-color: rgba(137, 90, 246, 0.3);
    color: var(--text-primary);
  }

  /* Details Section */
  .nft-header {
    margin-bottom: 24px;
  }

  .collection-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: rgba(137, 90, 246, 0.15);
    border-radius: 100px;
    font-size: 13px;
    font-weight: 500;
    color: var(--primary-color);
    margin-bottom: 16px;
  }

  .nft-header h1 {
    font-family: var(--font-family-display);
    font-size: 2.5rem;
    font-weight: 800;
    margin: 0 0 20px;
    line-height: 1.2;
  }

  .creator-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .creator-avatar {
    width: 44px;
    height: 44px;
    background: var(--gradient-primary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
  }

  .label {
    font-size: 12px;
    color: var(--text-tertiary);
    display: block;
  }

  .creator-link {
    color: var(--text-primary);
    text-decoration: none;
    font-weight: 500;
  }

  .creator-link:hover {
    color: var(--primary-color);
  }

  /* Price Card */
  .price-card {
    background: rgba(22, 22, 42, 0.8);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 24px;
    padding: 28px;
    margin-bottom: 20px;
  }

  .price-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .price-label {
    font-size: 13px;
    color: var(--text-secondary);
  }

  .ends-in {
    font-size: 13px;
    color: var(--primary-color);
    font-weight: 500;
  }

  .price-amount {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 8px;
  }

  .eth-icon {
    font-size: 2rem;
    font-weight: 700;
    color: var(--primary-color);
  }

  .price-value {
    font-family: var(--font-family-display);
    font-size: 3rem;
    font-weight: 800;
  }

  .price-usd {
    font-size: 14px;
    color: var(--text-tertiary);
  }

  .highest-bid {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 24px;
  }

  .highest-bid strong {
    color: #10b981;
  }

  .price-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .btn-large {
    padding: 16px 24px;
    font-size: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  /* Owner Card */
  .owner-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 20px;
    background: rgba(22, 22, 42, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 16px;
    margin-bottom: 20px;
  }

  .owner-avatar {
    width: 48px;
    height: 48px;
    background: rgba(137, 90, 246, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
  }

  .owner-link {
    color: var(--text-primary);
    text-decoration: none;
    font-weight: 500;
  }

  .owner-link:hover {
    color: var(--primary-color);
  }

  /* Description Card */
  .description-card {
    padding: 24px;
    background: rgba(22, 22, 42, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 16px;
  }

  .description-card h3 {
    font-size: 1rem;
    margin: 0 0 12px;
  }

  .description-card p {
    font-size: 14px;
    line-height: 1.7;
    color: var(--text-secondary);
    margin: 0;
  }

  /* Tabs Section */
  .tabs-section {
    margin-top: 60px;
  }

  .tabs {
    display: flex;
    gap: 8px;
    padding: 6px;
    background: rgba(22, 22, 42, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 16px;
    margin-bottom: 24px;
    overflow-x: auto;
  }

  .tab {
    padding: 14px 24px;
    background: transparent;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .tab:hover {
    color: var(--text-primary);
  }

  .tab.active {
    background: var(--gradient-primary);
    color: white;
  }

  .tab-content {
    padding: 32px;
    background: rgba(22, 22, 42, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 20px;
  }

  /* Details Grid */
  .details-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }

  .detail-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
  }

  .detail-icon {
    font-size: 24px;
  }

  .detail-label {
    font-size: 12px;
    color: var(--text-tertiary);
    display: block;
    margin-bottom: 4px;
  }

  .detail-value {
    font-size: 14px;
    font-weight: 500;
  }

  /* Traits Grid */
  .traits-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .trait-card {
    padding: 20px;
    background: rgba(137, 90, 246, 0.08);
    border: 1px solid rgba(137, 90, 246, 0.2);
    border-radius: 14px;
    text-align: center;
  }

  .trait-type {
    font-size: 11px;
    color: var(--primary-color);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
    display: block;
    margin-bottom: 6px;
  }

  .trait-value {
    font-size: 16px;
    font-weight: 600;
    display: block;
    margin-bottom: 8px;
  }

  .trait-rarity {
    font-size: 12px;
    color: var(--text-tertiary);
  }

  /* History List */
  .history-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .history-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
  }

  .history-icon {
    width: 44px;
    height: 44px;
    background: rgba(137, 90, 246, 0.15);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
  }

  .history-details {
    flex: 1;
  }

  .history-event {
    font-weight: 600;
    display: block;
    margin-bottom: 4px;
  }

  .history-meta {
    font-size: 13px;
    color: var(--text-tertiary);
  }

  .history-right {
    text-align: right;
  }

  .history-price {
    font-weight: 600;
    display: block;
    margin-bottom: 4px;
  }

  .history-date {
    font-size: 13px;
    color: var(--text-tertiary);
  }

  /* Bids List */
  .bids-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .bid-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
  }

  .bidder-avatar {
    width: 44px;
    height: 44px;
    background: rgba(137, 90, 246, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }

  .bid-details {
    flex: 1;
  }

  .bidder-address {
    font-weight: 500;
    display: block;
    margin-bottom: 4px;
  }

  .bid-date {
    font-size: 13px;
    color: var(--text-tertiary);
  }

  .bid-amount {
    font-family: var(--font-family-display);
    font-size: 18px;
    font-weight: 700;
    color: var(--primary-color);
  }

  /* Provenance */
  .provenance-info {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .provenance-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
  }

  .provenance-label {
    font-size: 14px;
    color: var(--text-secondary);
  }

  .provenance-value {
    font-family: var(--font-family-mono);
    font-size: 13px;
  }

  .provenance-value.verified {
    color: #10b981;
    font-weight: 600;
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }

  .modal {
    width: 100%;
    max-width: 440px;
    background: var(--surface-primary);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    overflow: hidden;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .modal-header h3 {
    font-size: 1.25rem;
    margin: 0;
  }

  .close-btn {
    width: 36px;
    height: 36px;
    background: rgba(255, 255, 255, 0.05);
    border: none;
    border-radius: 50%;
    font-size: 24px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
  }

  .modal-body {
    padding: 24px;
  }

  .modal-subtitle {
    font-size: 14px;
    color: var(--text-secondary);
    margin: 0 0 24px;
  }

  .bid-input-group {
    margin-bottom: 16px;
  }

  .bid-input-group label {
    font-size: 14px;
    font-weight: 500;
    display: block;
    margin-bottom: 10px;
  }

  .input-wrapper {
    display: flex;
    align-items: center;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    overflow: hidden;
    transition: border-color 0.2s;
  }

  .input-wrapper:focus-within {
    border-color: var(--primary-color);
  }

  .eth-symbol {
    padding: 0 16px;
    font-size: 20px;
    font-weight: 600;
    color: var(--text-tertiary);
  }

  .input-wrapper input {
    flex: 1;
    padding: 16px;
    padding-left: 0;
    background: transparent;
    border: none;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    outline: none;
  }

  .min-bid {
    font-size: 13px;
    color: var(--text-tertiary);
    margin-top: 10px;
    display: block;
  }

  .modal-footer {
    display: flex;
    gap: 12px;
    padding: 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  .modal-footer .btn {
    flex: 1;
    padding: 14px;
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .nft-grid {
      grid-template-columns: 1fr;
      gap: 40px;
    }

    .artwork-container {
      position: static;
    }

    .nft-header h1 {
      font-size: 2rem;
    }
  }

  @media (max-width: 768px) {
    .price-actions {
      grid-template-columns: 1fr;
    }

    .details-grid {
      grid-template-columns: 1fr;
    }

    .traits-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .tabs {
      padding: 4px;
    }

    .tab {
      padding: 12px 16px;
      font-size: 13px;
    }
  }
`
