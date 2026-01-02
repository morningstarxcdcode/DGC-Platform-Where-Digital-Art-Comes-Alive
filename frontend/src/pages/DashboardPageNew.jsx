/**
 * Dashboard Page - Premium Professional Design
 * Author: Sourav Rajak (morningstarxcdcode)
 * Version: 2.0.0
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet.jsx'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function DashboardPage() {
  const { address, isConnected, balance } = useWallet()
  const [stats, setStats] = useState({
    totalNFTs: 12,
    totalValue: '24.5',
    todayViews: 847,
    weeklyEarnings: '2.8',
    changePercent: '+12.5%',
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [topNFTs, setTopNFTs] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')

  useEffect(() => {
    fetchDashboardData()
  }, [address, timeRange])

  async function fetchDashboardData() {
    setLoading(true)
    try {
      // Demo data
      setTimeout(() => {
        setRecentActivity([
          { type: 'sale', item: 'Cosmic Dreamer', value: '2.5 ETH', time: '2h ago', buyer: '0x1234...5678' },
          { type: 'view', item: 'Neural Genesis', value: '+127 views', time: '4h ago' },
          { type: 'offer', item: 'Digital Soul', value: '3.0 ETH', time: '6h ago', from: '0xabcd...efgh' },
          { type: 'list', item: 'Quantum Art', value: '4.0 ETH', time: '1d ago' },
          { type: 'mint', item: 'Ethereal Flow', value: '0.05 ETH gas', time: '2d ago' },
        ])
        setTopNFTs([
          { id: 1, name: 'Cosmic Dreamer', views: 1247, likes: 89, price: '2.5' },
          { id: 2, name: 'Neural Genesis', views: 892, likes: 64, price: '1.8' },
          { id: 3, name: 'Digital Soul', views: 654, likes: 47, price: '3.2' },
        ])
        setLoading(false)
      }, 500)
    } catch (err) {
      console.error('Error fetching dashboard:', err)
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="dashboard-page">
        <div className="connect-prompt">
          <div className="prompt-content">
            <div className="prompt-icon">📊</div>
            <h2>Connect Your Wallet</h2>
            <p>Connect your wallet to access your dashboard</p>
          </div>
        </div>
        <style>{pageStyles}</style>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      {/* Header */}
      <section className="dashboard-header">
        <div className="container">
          <div className="header-content">
            <div className="header-text">
              <span className="greeting">Welcome back 👋</span>
              <h1>Dashboard</h1>
            </div>
            <div className="header-actions">
              <div className="time-selector">
                {['24h', '7d', '30d', 'All'].map(range => (
                  <button
                    key={range}
                    className={`time-btn ${timeRange === range.toLowerCase() ? 'active' : ''}`}
                    onClick={() => setTimeRange(range.toLowerCase())}
                  >
                    {range}
                  </button>
                ))}
              </div>
              <Link to="/generate" className="btn btn-primary">
                <span>✨</span> Create NFT
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card stat-primary">
              <div className="stat-icon">
                <span>🖼️</span>
              </div>
              <div className="stat-content">
                <span className="stat-label">Total NFTs</span>
                <span className="stat-value">{stats.totalNFTs}</span>
                <span className="stat-change positive">+3 this week</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <span>💎</span>
              </div>
              <div className="stat-content">
                <span className="stat-label">Portfolio Value</span>
                <span className="stat-value">{stats.totalValue} ETH</span>
                <span className="stat-change positive">{stats.changePercent}</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <span>👁️</span>
              </div>
              <div className="stat-content">
                <span className="stat-label">Today's Views</span>
                <span className="stat-value">{stats.todayViews}</span>
                <span className="stat-change positive">+24%</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <span>💰</span>
              </div>
              <div className="stat-content">
                <span className="stat-label">Weekly Earnings</span>
                <span className="stat-value">{stats.weeklyEarnings} ETH</span>
                <span className="stat-change positive">+18%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="dashboard-content">
        <div className="container">
          <div className="content-grid">
            {/* Activity Feed */}
            <div className="content-card activity-card">
              <div className="card-header">
                <h2>Recent Activity</h2>
                <Link to="/profile" className="view-all">View All →</Link>
              </div>
              <div className="activity-list">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <div key={i} className="activity-item skeleton">
                      <div className="skeleton-circle"></div>
                      <div className="skeleton-lines">
                        <div className="skeleton-line"></div>
                        <div className="skeleton-line short"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  recentActivity.map((item, index) => (
                    <div key={index} className="activity-item">
                      <div className={`activity-icon ${item.type}`}>
                        {item.type === 'sale' && '💰'}
                        {item.type === 'view' && '👁️'}
                        {item.type === 'offer' && '🏷️'}
                        {item.type === 'list' && '📋'}
                        {item.type === 'mint' && '🎨'}
                      </div>
                      <div className="activity-details">
                        <span className="activity-title">
                          {item.type === 'sale' && 'Sold'}
                          {item.type === 'view' && 'Views increased on'}
                          {item.type === 'offer' && 'New offer on'}
                          {item.type === 'list' && 'Listed'}
                          {item.type === 'mint' && 'Minted'}
                          {' '}<strong>{item.item}</strong>
                        </span>
                        <span className="activity-meta">
                          {item.buyer && `To ${item.buyer} • `}
                          {item.from && `From ${item.from} • `}
                          {item.time}
                        </span>
                      </div>
                      <span className="activity-value">{item.value}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Top Performing NFTs */}
            <div className="content-card top-nfts-card">
              <div className="card-header">
                <h2>Top Performing</h2>
                <Link to="/profile" className="view-all">View All →</Link>
              </div>
              <div className="top-nfts-list">
                {topNFTs.map((nft, index) => (
                  <Link key={nft.id} to={`/nft/${nft.id}`} className="top-nft-item">
                    <span className="rank">#{index + 1}</span>
                    <div className="nft-preview" style={{
                      background: `linear-gradient(135deg, 
                        hsl(${260 + index * 40}, 70%, 50%) 0%, 
                        hsl(${280 + index * 40}, 70%, 40%) 100%)`
                    }}>
                      <span>✨</span>
                    </div>
                    <div className="nft-details">
                      <span className="nft-name">{nft.name}</span>
                      <span className="nft-stats">
                        👁️ {nft.views} • ❤️ {nft.likes}
                      </span>
                    </div>
                    <span className="nft-price">{nft.price} ETH</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="content-card quick-actions-card">
              <div className="card-header">
                <h2>Quick Actions</h2>
              </div>
              <div className="quick-actions">
                <Link to="/generate" className="action-btn">
                  <span className="action-icon">✨</span>
                  <span className="action-label">Create NFT</span>
                </Link>
                <Link to="/marketplace" className="action-btn">
                  <span className="action-icon">🛒</span>
                  <span className="action-label">Browse Market</span>
                </Link>
                <Link to="/profile" className="action-btn">
                  <span className="action-icon">🖼️</span>
                  <span className="action-label">My Collection</span>
                </Link>
                <button className="action-btn">
                  <span className="action-icon">📤</span>
                  <span className="action-label">Share Profile</span>
                </button>
              </div>
            </div>

            {/* Analytics Preview */}
            <div className="content-card analytics-card">
              <div className="card-header">
                <h2>Analytics Overview</h2>
                <span className="badge">Coming Soon</span>
              </div>
              <div className="analytics-placeholder">
                <div className="chart-placeholder">
                  <div className="bar" style={{ height: '40%' }}></div>
                  <div className="bar" style={{ height: '65%' }}></div>
                  <div className="bar" style={{ height: '45%' }}></div>
                  <div className="bar" style={{ height: '80%' }}></div>
                  <div className="bar" style={{ height: '55%' }}></div>
                  <div className="bar" style={{ height: '70%' }}></div>
                  <div className="bar" style={{ height: '90%' }}></div>
                </div>
                <p>Detailed analytics coming in next update</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{pageStyles}</style>
    </div>
  )
}

const pageStyles = `
  .dashboard-page {
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
  .dashboard-header {
    padding: 140px 0 40px;
    background: 
      radial-gradient(ellipse 60% 40% at 50% 30%, rgba(137, 90, 246, 0.15) 0%, transparent 50%);
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .greeting {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 4px;
    display: block;
  }

  .header-content h1 {
    font-family: var(--font-family-display);
    font-size: 2.5rem;
    font-weight: 800;
    margin: 0;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .time-selector {
    display: flex;
    background: rgba(22, 22, 42, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 4px;
  }

  .time-btn {
    padding: 10px 16px;
    background: transparent;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s;
  }

  .time-btn:hover {
    color: var(--text-primary);
  }

  .time-btn.active {
    background: var(--gradient-primary);
    color: white;
  }

  /* Stats Grid */
  .stats-section {
    padding: 20px 0 40px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 24px;
    background: rgba(22, 22, 42, 0.6);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 20px;
    transition: all 0.3s ease;
  }

  .stat-card:hover {
    transform: translateY(-4px);
    border-color: rgba(137, 90, 246, 0.3);
  }

  .stat-card.stat-primary {
    background: linear-gradient(135deg, rgba(137, 90, 246, 0.2) 0%, rgba(109, 40, 217, 0.1) 100%);
    border-color: rgba(137, 90, 246, 0.3);
  }

  .stat-icon {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--gradient-primary);
    border-radius: 16px;
    font-size: 24px;
  }

  .stat-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .stat-label {
    font-size: 13px;
    color: var(--text-tertiary);
  }

  .stat-value {
    font-family: var(--font-family-display);
    font-size: 1.5rem;
    font-weight: 700;
  }

  .stat-change {
    font-size: 12px;
    font-weight: 600;
  }

  .stat-change.positive {
    color: #10b981;
  }

  .stat-change.negative {
    color: #ef4444;
  }

  /* Content Grid */
  .dashboard-content {
    padding: 20px 0;
  }

  .content-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }

  .content-card {
    background: rgba(22, 22, 42, 0.6);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 24px;
    overflow: hidden;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .card-header h2 {
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0;
  }

  .view-all {
    font-size: 13px;
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 500;
  }

  .view-all:hover {
    text-decoration: underline;
  }

  .badge {
    padding: 4px 10px;
    background: rgba(137, 90, 246, 0.2);
    border-radius: 100px;
    font-size: 11px;
    font-weight: 600;
    color: var(--primary-color);
  }

  /* Activity Card */
  .activity-list {
    padding: 16px;
  }

  .activity-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px;
    border-radius: 12px;
    transition: background 0.2s;
  }

  .activity-item:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  .activity-icon {
    width: 42px;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(137, 90, 246, 0.15);
    border-radius: 10px;
    font-size: 18px;
    flex-shrink: 0;
  }

  .activity-icon.sale {
    background: rgba(34, 197, 94, 0.15);
  }

  .activity-icon.offer {
    background: rgba(251, 191, 36, 0.15);
  }

  .activity-details {
    flex: 1;
    min-width: 0;
  }

  .activity-title {
    font-size: 14px;
    display: block;
  }

  .activity-meta {
    font-size: 12px;
    color: var(--text-tertiary);
  }

  .activity-value {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    flex-shrink: 0;
  }

  /* Top NFTs Card */
  .top-nfts-list {
    padding: 16px;
  }

  .top-nft-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px;
    border-radius: 12px;
    text-decoration: none;
    color: inherit;
    transition: background 0.2s;
  }

  .top-nft-item:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  .rank {
    font-family: var(--font-family-display);
    font-size: 16px;
    font-weight: 700;
    color: var(--text-tertiary);
    width: 28px;
  }

  .nft-preview {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
  }

  .nft-details {
    flex: 1;
  }

  .nft-name {
    font-size: 14px;
    font-weight: 600;
    display: block;
  }

  .nft-stats {
    font-size: 12px;
    color: var(--text-tertiary);
  }

  .nft-price {
    font-size: 14px;
    font-weight: 600;
  }

  /* Quick Actions */
  .quick-actions {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 20px;
  }

  .action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 24px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 16px;
    text-decoration: none;
    color: inherit;
    cursor: pointer;
    transition: all 0.3s;
  }

  .action-btn:hover {
    background: rgba(137, 90, 246, 0.1);
    border-color: rgba(137, 90, 246, 0.3);
    transform: translateY(-2px);
  }

  .action-icon {
    font-size: 28px;
  }

  .action-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary);
  }

  /* Analytics Card */
  .analytics-placeholder {
    padding: 40px;
    text-align: center;
  }

  .chart-placeholder {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 8px;
    height: 120px;
    margin-bottom: 20px;
  }

  .bar {
    width: 24px;
    background: var(--gradient-primary);
    border-radius: 4px;
    opacity: 0.6;
  }

  .analytics-placeholder p {
    font-size: 14px;
    color: var(--text-tertiary);
  }

  /* Skeleton */
  .activity-item.skeleton {
    display: flex;
    gap: 14px;
  }

  .skeleton-circle {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  .skeleton-lines {
    flex: 1;
  }

  .skeleton-line {
    height: 14px;
    background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 6px;
    margin-bottom: 8px;
  }

  .skeleton-line.short {
    width: 60%;
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* Responsive */
  @media (max-width: 1200px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 1024px) {
    .content-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .header-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 20px;
    }

    .header-actions {
      width: 100%;
      flex-direction: column;
    }

    .time-selector {
      width: 100%;
      justify-content: center;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
`
