/**
 * Profile Page - Premium Professional Design
 * Author: Sourav Rajak (morningstarxcdcode)
 * Version: 2.0.0
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet.jsx'
import { useContracts } from '../hooks/useContracts.jsx'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const TABS = [
  { id: 'owned', label: 'Owned', icon: '🖼️' },
  { id: 'created', label: 'Created', icon: '✨' },
  { id: 'listed', label: 'Listed', icon: '🏷️' },
  { id: 'activity', label: 'Activity', icon: '📊' },
]

export default function ProfilePage() {
  const { address, isConnected, balance } = useWallet()
  const [activeTab, setActiveTab] = useState('owned')
  const [nfts, setNfts] = useState([])
  const [activity, setActivity] = useState([])
  const [stats, setStats] = useState({
    owned: 12,
    created: 8,
    listed: 3,
    totalValue: '24.5',
    totalEarnings: '8.2',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (address) {
      fetchProfileData()
    }
  }, [address, activeTab])

  async function fetchProfileData() {
    setLoading(true)
    try {
      // In production, fetch from API
      // Demo data
      setTimeout(() => {
        setNfts([
          { id: 1, name: 'Cosmic Dreamer', price: '2.5', status: 'owned' },
          { id: 2, name: 'Neural Genesis', price: '1.8', status: 'listed' },
          { id: 3, name: 'Digital Soul', price: '3.2', status: 'owned' },
          { id: 4, name: 'Quantum Art', price: '4.0', status: 'created' },
          { id: 5, name: 'Ethereal Flow', price: '1.5', status: 'owned' },
          { id: 6, name: 'Abstract Mind', price: '2.8', status: 'listed' },
        ])
        setActivity([
          { type: 'mint', item: 'Cosmic Dreamer', time: '2h ago', value: '0.05 ETH' },
          { type: 'sale', item: 'Neural Genesis', time: '1d ago', value: '1.8 ETH' },
          { type: 'list', item: 'Abstract Mind', time: '2d ago', value: '2.8 ETH' },
          { type: 'purchase', item: 'Digital Soul', time: '5d ago', value: '3.2 ETH' },
        ])
        setLoading(false)
      }, 500)
    } catch (err) {
      console.error('Error fetching profile:', err)
      setLoading(false)
    }
  }

  const formatAddress = (addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`
  }

  if (!isConnected) {
    return (
      <div className="profile-page">
        <div className="connect-prompt">
          <div className="prompt-content">
            <div className="prompt-icon">🔐</div>
            <h2>Connect Your Wallet</h2>
            <p>Please connect your wallet to view your profile</p>
          </div>
        </div>
        <style>{pageStyles}</style>
      </div>
    )
  }

  return (
    <div className="profile-page">
      {/* Profile Header */}
      <section className="profile-header">
        <div className="header-background">
          <div className="header-gradient"></div>
        </div>
        <div className="container">
          <div className="profile-card">
            <div className="avatar-section">
              <div className="avatar">
                <div className="avatar-glow"></div>
                <div className="avatar-inner">
                  <span>🎨</span>
                </div>
              </div>
              <div className="profile-badge">Pro Creator</div>
            </div>
            
            <div className="profile-info">
              <h1 className="profile-name">Digital Artist</h1>
              <div className="wallet-address">
                <span className="address-text">{formatAddress(address)}</span>
                <button className="copy-btn" onClick={() => navigator.clipboard.writeText(address)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                </button>
              </div>
              <p className="profile-bio">
                Creating living digital art that evolves with emotion. Exploring the intersection 
                of AI and blockchain creativity.
              </p>
            </div>

            <div className="profile-stats">
              <div className="stat">
                <span className="stat-value">{stats.owned}</span>
                <span className="stat-label">Owned</span>
              </div>
              <div className="stat">
                <span className="stat-value">{stats.created}</span>
                <span className="stat-label">Created</span>
              </div>
              <div className="stat">
                <span className="stat-value">{stats.totalValue} ETH</span>
                <span className="stat-label">Total Value</span>
              </div>
              <div className="stat">
                <span className="stat-value">{stats.totalEarnings} ETH</span>
                <span className="stat-label">Earnings</span>
              </div>
            </div>

            <div className="profile-actions">
              <Link to="/generate" className="btn btn-primary">
                <span>✨</span> Create NFT
              </Link>
              <button className="btn btn-secondary">
                <span>⚙️</span> Settings
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="profile-content">
        <div className="container">
          {/* Tabs */}
          <div className="tabs-container">
            <div className="tabs">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="tab-icon">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.id !== 'activity' && (
                    <span className="tab-count">
                      {tab.id === 'owned' ? stats.owned : tab.id === 'created' ? stats.created : stats.listed}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'activity' ? (
            <div className="activity-section">
              <div className="activity-list">
                {activity.map((item, index) => (
                  <div key={index} className="activity-item">
                    <div className={`activity-icon ${item.type}`}>
                      {item.type === 'mint' && '🎨'}
                      {item.type === 'sale' && '💰'}
                      {item.type === 'list' && '🏷️'}
                      {item.type === 'purchase' && '🛒'}
                    </div>
                    <div className="activity-info">
                      <span className="activity-type">
                        {item.type === 'mint' && 'Minted'}
                        {item.type === 'sale' && 'Sold'}
                        {item.type === 'list' && 'Listed'}
                        {item.type === 'purchase' && 'Purchased'}
                      </span>
                      <span className="activity-item-name">{item.item}</span>
                    </div>
                    <div className="activity-meta">
                      <span className="activity-value">{item.value}</span>
                      <span className="activity-time">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="nft-grid">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <div key={i} className="nft-card skeleton">
                    <div className="skeleton-image"></div>
                    <div className="skeleton-content">
                      <div className="skeleton-line"></div>
                      <div className="skeleton-line short"></div>
                    </div>
                  </div>
                ))
              ) : (
                nfts
                  .filter(nft => activeTab === 'owned' || nft.status === activeTab.replace('listed', 'listed').replace('created', 'created'))
                  .map((nft, index) => (
                    <Link key={nft.id} to={`/nft/${nft.id}`} className="nft-card">
                      <div className="nft-image">
                        <div className="nft-placeholder" style={{
                          background: `linear-gradient(135deg, 
                            hsl(${260 + index * 30}, 70%, 50%) 0%, 
                            hsl(${280 + index * 30}, 70%, 40%) 100%)`
                        }}>
                          <span>✨</span>
                        </div>
                        {nft.status === 'listed' && (
                          <div className="listed-badge">Listed</div>
                        )}
                      </div>
                      <div className="nft-info">
                        <h3>{nft.name}</h3>
                        <div className="nft-footer">
                          <span className="nft-price">{nft.price} ETH</span>
                          <span className="nft-status">{nft.status}</span>
                        </div>
                      </div>
                    </Link>
                  ))
              )}
            </div>
          )}
        </div>
      </section>

      <style>{pageStyles}</style>
    </div>
  )
}

const pageStyles = `
  .profile-page {
    min-height: 100vh;
    padding-bottom: 100px;
  }

  /* Connect Prompt */
  .connect-prompt {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    padding-top: 100px;
  }

  .prompt-content {
    text-align: center;
    padding: 60px;
    background: rgba(22, 22, 42, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 24px;
  }

  .prompt-icon {
    font-size: 64px;
    margin-bottom: 20px;
  }

  .prompt-content h2 {
    font-size: 1.5rem;
    margin-bottom: 10px;
  }

  .prompt-content p {
    color: var(--text-secondary);
  }

  /* Header */
  .profile-header {
    position: relative;
    padding: 140px 0 60px;
  }

  .header-background {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  .header-gradient {
    position: absolute;
    inset: 0;
    background: 
      radial-gradient(ellipse 60% 40% at 50% 30%, rgba(137, 90, 246, 0.2) 0%, transparent 50%),
      radial-gradient(ellipse 40% 30% at 70% 70%, rgba(244, 114, 182, 0.1) 0%, transparent 50%);
  }

  .profile-card {
    position: relative;
    background: rgba(22, 22, 42, 0.8);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 32px;
    padding: 40px;
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 40px;
    align-items: center;
  }

  .avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .avatar {
    position: relative;
    width: 120px;
    height: 120px;
  }

  .avatar-glow {
    position: absolute;
    inset: -4px;
    background: var(--gradient-primary);
    border-radius: 50%;
    animation: pulse 3s ease-in-out infinite;
  }

  .avatar-inner {
    position: relative;
    width: 100%;
    height: 100%;
    background: var(--gradient-primary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48px;
    border: 4px solid var(--bg-primary);
  }

  .profile-badge {
    padding: 6px 14px;
    background: var(--gradient-gold);
    border-radius: 100px;
    font-size: 12px;
    font-weight: 700;
    color: #1a1a2e;
  }

  .profile-info {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .profile-name {
    font-family: var(--font-family-display);
    font-size: 2rem;
    font-weight: 800;
    margin: 0;
  }

  .wallet-address {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .address-text {
    font-family: var(--font-family-mono);
    font-size: 14px;
    color: var(--text-secondary);
    padding: 8px 14px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
  }

  .copy-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.05);
    border: none;
    border-radius: 8px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s;
  }

  .copy-btn:hover {
    background: rgba(137, 90, 246, 0.2);
    color: var(--text-primary);
  }

  .profile-bio {
    font-size: 14px;
    color: var(--text-secondary);
    max-width: 500px;
    line-height: 1.6;
    margin: 0;
  }

  .profile-stats {
    display: flex;
    gap: 32px;
  }

  .profile-stats .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .profile-stats .stat-value {
    font-family: var(--font-family-display);
    font-size: 1.5rem;
    font-weight: 700;
  }

  .profile-stats .stat-label {
    font-size: 12px;
    color: var(--text-tertiary);
  }

  .profile-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* Tabs */
  .profile-content {
    padding: 40px 0;
  }

  .tabs-container {
    margin-bottom: 32px;
  }

  .tabs {
    display: flex;
    gap: 8px;
    padding: 8px;
    background: rgba(22, 22, 42, 0.6);
    border-radius: 16px;
    width: fit-content;
  }

  .tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: transparent;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s;
  }

  .tab:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.05);
  }

  .tab.active {
    background: var(--gradient-primary);
    color: white;
  }

  .tab-count {
    padding: 2px 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 100px;
    font-size: 12px;
  }

  .tab.active .tab-count {
    background: rgba(255, 255, 255, 0.2);
  }

  /* NFT Grid */
  .nft-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
  }

  .nft-card {
    background: rgba(22, 22, 42, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 20px;
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    transition: all 0.4s ease;
  }

  .nft-card:hover {
    transform: translateY(-8px);
    border-color: rgba(137, 90, 246, 0.4);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }

  .nft-image {
    position: relative;
    aspect-ratio: 1;
  }

  .nft-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48px;
    transition: transform 0.6s ease;
  }

  .nft-card:hover .nft-placeholder {
    transform: scale(1.08);
  }

  .listed-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    padding: 6px 12px;
    background: rgba(34, 197, 94, 0.9);
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
  }

  .nft-info {
    padding: 20px;
  }

  .nft-info h3 {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 12px;
  }

  .nft-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .nft-price {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .nft-status {
    font-size: 12px;
    color: var(--text-tertiary);
    text-transform: capitalize;
  }

  /* Activity */
  .activity-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .activity-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: rgba(22, 22, 42, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 16px;
    transition: all 0.2s;
  }

  .activity-item:hover {
    border-color: rgba(137, 90, 246, 0.3);
  }

  .activity-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(137, 90, 246, 0.15);
    border-radius: 12px;
    font-size: 20px;
  }

  .activity-icon.sale {
    background: rgba(34, 197, 94, 0.15);
  }

  .activity-info {
    flex: 1;
  }

  .activity-type {
    font-size: 14px;
    font-weight: 600;
    display: block;
  }

  .activity-item-name {
    font-size: 13px;
    color: var(--text-tertiary);
  }

  .activity-meta {
    text-align: right;
  }

  .activity-value {
    font-size: 14px;
    font-weight: 600;
    display: block;
  }

  .activity-time {
    font-size: 12px;
    color: var(--text-tertiary);
  }

  /* Skeleton */
  .nft-card.skeleton {
    pointer-events: none;
  }

  .skeleton-image {
    aspect-ratio: 1;
    background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  .skeleton-content {
    padding: 20px;
  }

  .skeleton-line {
    height: 16px;
    background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 8px;
    margin-bottom: 10px;
  }

  .skeleton-line.short {
    width: 60%;
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .profile-card {
      grid-template-columns: 1fr;
      text-align: center;
    }

    .profile-info {
      align-items: center;
    }

    .wallet-address {
      justify-content: center;
    }

    .profile-stats {
      justify-content: center;
    }

    .profile-actions {
      flex-direction: row;
      justify-content: center;
    }
  }

  @media (max-width: 768px) {
    .profile-stats {
      flex-wrap: wrap;
      gap: 20px;
    }

    .tabs {
      width: 100%;
      overflow-x: auto;
    }

    .nft-grid {
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    }
  }
`
