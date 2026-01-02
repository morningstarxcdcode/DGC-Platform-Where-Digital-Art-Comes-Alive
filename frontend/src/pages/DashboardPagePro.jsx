/**
 * Dashboard Page - Ultra Premium Professional Design
 * Analytics & Activity Overview
 * Author: Sourav Rajak (morningstarxcdcode)
 * Version: 3.0.0 - Professional Edition
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet.jsx'

export default function DashboardPage() {
  const { address, isConnected, balance } = useWallet()
  const [activeView, setActiveView] = useState('overview')
  const [timeRange, setTimeRange] = useState('7d')

  // Mock data
  const stats = {
    totalEarnings: '12.84',
    totalSales: 156,
    totalViews: '45.2K',
    avgPrice: '0.82',
    change: {
      earnings: '+24.5%',
      sales: '+12%',
      views: '+18.3%',
      price: '+5.2%',
    }
  }

  const recentActivity = [
    { type: 'sale', title: 'Cosmic Dreams #42', price: '0.5 ETH', buyer: '0x1234...5678', time: '2 hours ago' },
    { type: 'bid', title: 'Neural Patterns', price: '0.7 ETH', bidder: '0xabcd...efgh', time: '5 hours ago' },
    { type: 'like', title: 'Digital Genesis', user: '@collector', time: '8 hours ago' },
    { type: 'follow', user: '@artlover', time: '1 day ago' },
    { type: 'mint', title: 'Abstract Reality', time: '2 days ago' },
  ]

  const topNFTs = [
    { id: 1, name: 'Cosmic Dreams #42', views: '2.4K', likes: 234, sales: 5 },
    { id: 2, name: 'Neural Patterns', views: '1.8K', likes: 189, sales: 3 },
    { id: 3, name: 'Digital Genesis', views: '1.5K', likes: 156, sales: 4 },
    { id: 4, name: 'Abstract Reality', views: '1.2K', likes: 124, sales: 2 },
  ]

  const chartData = [40, 65, 45, 80, 55, 90, 75]

  return (
    <div className="dashboard-page">
      {/* Background */}
      <div className="page-bg">
        <div className="bg-gradient"></div>
        <div className="bg-grid"></div>
      </div>

      {/* Header */}
      <section className="page-header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <h1>Dashboard</h1>
              <p>Track your performance and manage your NFTs</p>
            </div>
            <div className="header-right">
              <select 
                className="time-select"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
              <Link to="/generate" className="btn-create">
                <span>✨</span> Create New
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon earnings">
                <span>💰</span>
              </div>
              <div className="stat-content">
                <span className="stat-label">Total Earnings</span>
                <div className="stat-row">
                  <span className="stat-value">{stats.totalEarnings} ETH</span>
                  <span className="stat-change positive">{stats.change.earnings}</span>
                </div>
              </div>
              <div className="stat-chart">
                {chartData.map((v, i) => (
                  <div key={i} className="chart-bar" style={{ height: `${v}%` }}></div>
                ))}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon sales">
                <span>📈</span>
              </div>
              <div className="stat-content">
                <span className="stat-label">Total Sales</span>
                <div className="stat-row">
                  <span className="stat-value">{stats.totalSales}</span>
                  <span className="stat-change positive">{stats.change.sales}</span>
                </div>
              </div>
              <div className="stat-chart">
                {chartData.map((v, i) => (
                  <div key={i} className="chart-bar sales" style={{ height: `${v}%` }}></div>
                ))}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon views">
                <span>👁️</span>
              </div>
              <div className="stat-content">
                <span className="stat-label">Total Views</span>
                <div className="stat-row">
                  <span className="stat-value">{stats.totalViews}</span>
                  <span className="stat-change positive">{stats.change.views}</span>
                </div>
              </div>
              <div className="stat-chart">
                {chartData.map((v, i) => (
                  <div key={i} className="chart-bar views" style={{ height: `${v}%` }}></div>
                ))}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon price">
                <span>💎</span>
              </div>
              <div className="stat-content">
                <span className="stat-label">Avg. Sale Price</span>
                <div className="stat-row">
                  <span className="stat-value">{stats.avgPrice} ETH</span>
                  <span className="stat-change positive">{stats.change.price}</span>
                </div>
              </div>
              <div className="stat-chart">
                {chartData.map((v, i) => (
                  <div key={i} className="chart-bar price" style={{ height: `${v}%` }}></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="main-section">
        <div className="container">
          <div className="main-grid">
            {/* Left Column */}
            <div className="left-column">
              {/* Performance Chart */}
              <div className="chart-card">
                <div className="card-header">
                  <h3>Performance Overview</h3>
                  <div className="chart-tabs">
                    <button className="chart-tab active">Revenue</button>
                    <button className="chart-tab">Sales</button>
                    <button className="chart-tab">Views</button>
                  </div>
                </div>
                <div className="card-body">
                  <div className="chart-placeholder">
                    <div className="chart-line">
                      <svg viewBox="0 0 400 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#8B5CF6" />
                            <stop offset="100%" stopColor="#EC4899" />
                          </linearGradient>
                          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgba(139, 92, 246, 0.3)" />
                            <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M0,80 Q50,60 100,65 T200,45 T300,55 T400,30"
                          fill="none"
                          stroke="url(#lineGradient)"
                          strokeWidth="3"
                        />
                        <path
                          d="M0,80 Q50,60 100,65 T200,45 T300,55 T400,30 L400,100 L0,100 Z"
                          fill="url(#areaGradient)"
                        />
                      </svg>
                    </div>
                    <div className="chart-labels">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Performing NFTs */}
              <div className="top-nfts-card">
                <div className="card-header">
                  <h3>Top Performing NFTs</h3>
                  <Link to="/profile" className="view-all">View All →</Link>
                </div>
                <div className="card-body">
                  <div className="top-nfts-list">
                    {topNFTs.map((nft, i) => (
                      <Link to={`/nft/${nft.id}`} key={nft.id} className="top-nft-item">
                        <span className="rank">{i + 1}</span>
                        <div className="nft-thumb">
                          <span>✨</span>
                        </div>
                        <div className="nft-info">
                          <span className="nft-name">{nft.name}</span>
                          <div className="nft-stats">
                            <span>👁️ {nft.views}</span>
                            <span>❤️ {nft.likes}</span>
                            <span>💰 {nft.sales}</span>
                          </div>
                        </div>
                        <span className="arrow">→</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="right-column">
              {/* Quick Actions */}
              <div className="actions-card">
                <div className="card-header">
                  <h3>Quick Actions</h3>
                </div>
                <div className="card-body">
                  <div className="actions-grid">
                    <Link to="/generate" className="action-item">
                      <div className="action-icon create">
                        <span>✨</span>
                      </div>
                      <span className="action-label">Create NFT</span>
                    </Link>
                    <Link to="/marketplace" className="action-item">
                      <div className="action-icon browse">
                        <span>🛒</span>
                      </div>
                      <span className="action-label">Browse</span>
                    </Link>
                    <Link to="/profile" className="action-item">
                      <div className="action-icon collection">
                        <span>🖼️</span>
                      </div>
                      <span className="action-label">Collection</span>
                    </Link>
                    <button className="action-item">
                      <div className="action-icon settings">
                        <span>⚙️</span>
                      </div>
                      <span className="action-label">Settings</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="activity-card">
                <div className="card-header">
                  <h3>Recent Activity</h3>
                  <button className="filter-btn">
                    <span>🔽</span> Filter
                  </button>
                </div>
                <div className="card-body">
                  <div className="activity-list">
                    {recentActivity.map((activity, i) => (
                      <div key={i} className="activity-item">
                        <div className="activity-icon">
                          {activity.type === 'sale' && '💰'}
                          {activity.type === 'bid' && '🏷️'}
                          {activity.type === 'like' && '❤️'}
                          {activity.type === 'follow' && '👤'}
                          {activity.type === 'mint' && '✨'}
                        </div>
                        <div className="activity-content">
                          {activity.type === 'sale' && (
                            <>
                              <span className="activity-text">
                                <strong>{activity.title}</strong> sold for <strong>{activity.price}</strong>
                              </span>
                              <span className="activity-sub">to {activity.buyer}</span>
                            </>
                          )}
                          {activity.type === 'bid' && (
                            <>
                              <span className="activity-text">
                                New bid on <strong>{activity.title}</strong>
                              </span>
                              <span className="activity-sub">{activity.price} by {activity.bidder}</span>
                            </>
                          )}
                          {activity.type === 'like' && (
                            <>
                              <span className="activity-text">
                                <strong>{activity.user}</strong> liked <strong>{activity.title}</strong>
                              </span>
                            </>
                          )}
                          {activity.type === 'follow' && (
                            <>
                              <span className="activity-text">
                                <strong>{activity.user}</strong> started following you
                              </span>
                            </>
                          )}
                          {activity.type === 'mint' && (
                            <>
                              <span className="activity-text">
                                You minted <strong>{activity.title}</strong>
                              </span>
                            </>
                          )}
                        </div>
                        <span className="activity-time">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Wallet Card */}
              <div className="wallet-card">
                <div className="wallet-header">
                  <div className="wallet-icon">🔐</div>
                  <span>Wallet Balance</span>
                </div>
                <div className="wallet-balance">
                  <span className="balance-value">{balance ? parseFloat(balance).toFixed(4) : '0.0000'}</span>
                  <span className="balance-currency">ETH</span>
                </div>
                <div className="wallet-actions">
                  <button className="wallet-btn">
                    <span>↓</span> Deposit
                  </button>
                  <button className="wallet-btn">
                    <span>↑</span> Withdraw
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{styles}</style>
    </div>
  )
}

const styles = `
  .dashboard-page {
    min-height: 100vh;
    padding-top: 80px;
    position: relative;
  }

  .page-bg {
    position: fixed;
    inset: 0;
    z-index: -1;
  }

  .bg-gradient {
    position: absolute;
    width: 100%;
    height: 100%;
    background: 
      radial-gradient(ellipse 60% 40% at 10% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse 50% 50% at 90% 80%, rgba(236, 72, 153, 0.1) 0%, transparent 50%);
  }

  .bg-grid {
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
    background-size: 50px 50px;
    mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
  }

  /* Page Header */
  .page-header {
    padding: 40px 0;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-left h1 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 8px;
  }

  .header-left p {
    font-size: 15px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
  }

  .header-right {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .time-select {
    padding: 14px 20px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    font-size: 14px;
    color: white;
    cursor: pointer;
    outline: none;
  }

  .btn-create {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 28px;
    background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
    border-radius: 14px;
    font-size: 14px;
    font-weight: 600;
    color: white;
    text-decoration: none;
    transition: all 0.3s;
    box-shadow: 0 10px 30px -10px rgba(139, 92, 246, 0.5);
  }

  .btn-create:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 40px -10px rgba(139, 92, 246, 0.6);
  }

  /* Stats Section */
  .stats-section {
    padding: 0 0 40px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }

  .stat-card {
    position: relative;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 20px;
    padding: 24px;
    overflow: hidden;
    transition: all 0.3s;
  }

  .stat-card:hover {
    border-color: rgba(139, 92, 246, 0.3);
    transform: translateY(-4px);
  }

  .stat-icon {
    width: 52px;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 14px;
    font-size: 24px;
    margin-bottom: 20px;
  }

  .stat-icon.earnings {
    background: rgba(16, 185, 129, 0.15);
  }

  .stat-icon.sales {
    background: rgba(59, 130, 246, 0.15);
  }

  .stat-icon.views {
    background: rgba(245, 158, 11, 0.15);
  }

  .stat-icon.price {
    background: rgba(139, 92, 246, 0.15);
  }

  .stat-label {
    display: block;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .stat-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .stat-value {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.75rem;
    font-weight: 700;
  }

  .stat-change {
    padding: 4px 10px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
  }

  .stat-change.positive {
    background: rgba(16, 185, 129, 0.15);
    color: #10B981;
  }

  .stat-change.negative {
    background: rgba(239, 68, 68, 0.15);
    color: #EF4444;
  }

  .stat-chart {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 100px;
    height: 50px;
    display: flex;
    align-items: flex-end;
    gap: 4px;
    padding: 8px;
    opacity: 0.3;
  }

  .chart-bar {
    flex: 1;
    background: linear-gradient(to top, #8B5CF6, rgba(139, 92, 246, 0.3));
    border-radius: 2px;
  }

  .chart-bar.sales {
    background: linear-gradient(to top, #3B82F6, rgba(59, 130, 246, 0.3));
  }

  .chart-bar.views {
    background: linear-gradient(to top, #F59E0B, rgba(245, 158, 11, 0.3));
  }

  .chart-bar.price {
    background: linear-gradient(to top, #10B981, rgba(16, 185, 129, 0.3));
  }

  /* Main Section */
  .main-section {
    padding: 0 0 100px;
  }

  .main-grid {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 24px;
  }

  /* Cards Common */
  .chart-card,
  .top-nfts-card,
  .actions-card,
  .activity-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 20px;
    overflow: hidden;
    margin-bottom: 24px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .card-header h3 {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
  }

  .card-body {
    padding: 24px;
  }

  .view-all {
    font-size: 13px;
    color: #A78BFA;
    text-decoration: none;
    transition: color 0.2s;
  }

  .view-all:hover {
    color: #C4B5FD;
  }

  /* Chart Card */
  .chart-tabs {
    display: flex;
    gap: 8px;
  }

  .chart-tab {
    padding: 8px 16px;
    background: transparent;
    border: none;
    border-radius: 10px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: all 0.2s;
  }

  .chart-tab:hover {
    color: white;
  }

  .chart-tab.active {
    background: rgba(139, 92, 246, 0.15);
    color: white;
  }

  .chart-placeholder {
    height: 200px;
    display: flex;
    flex-direction: column;
  }

  .chart-line {
    flex: 1;
    position: relative;
  }

  .chart-line svg {
    width: 100%;
    height: 100%;
  }

  .chart-labels {
    display: flex;
    justify-content: space-between;
    padding-top: 16px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.4);
  }

  /* Top NFTs */
  .top-nfts-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .top-nft-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 14px;
    text-decoration: none;
    color: inherit;
    transition: all 0.2s;
  }

  .top-nft-item:hover {
    background: rgba(0, 0, 0, 0.3);
    transform: translateX(4px);
  }

  .rank {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(139, 92, 246, 0.15);
    border-radius: 8px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: #A78BFA;
  }

  .nft-thumb {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.1));
    border-radius: 12px;
    font-size: 20px;
  }

  .nft-info {
    flex: 1;
  }

  .nft-name {
    display: block;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 4px;
  }

  .nft-stats {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  .arrow {
    color: rgba(255, 255, 255, 0.3);
    transition: transform 0.2s;
  }

  .top-nft-item:hover .arrow {
    transform: translateX(4px);
    color: #A78BFA;
  }

  /* Actions Card */
  .actions-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 24px 16px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid transparent;
    border-radius: 16px;
    text-decoration: none;
    color: inherit;
    cursor: pointer;
    transition: all 0.2s;
  }

  .action-item:hover {
    background: rgba(0, 0, 0, 0.3);
    border-color: rgba(139, 92, 246, 0.2);
    transform: translateY(-2px);
  }

  .action-icon {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    font-size: 24px;
  }

  .action-icon.create {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.1));
  }

  .action-icon.browse {
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(16, 185, 129, 0.1));
  }

  .action-icon.collection {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(239, 68, 68, 0.1));
  }

  .action-icon.settings {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.1));
  }

  .action-label {
    font-size: 13px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
  }

  /* Activity Card */
  .filter-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.2s;
  }

  .filter-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .activity-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .activity-item {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 14px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 14px;
    transition: background 0.2s;
  }

  .activity-item:hover {
    background: rgba(0, 0, 0, 0.3);
  }

  .activity-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(139, 92, 246, 0.1);
    border-radius: 10px;
    font-size: 16px;
    flex-shrink: 0;
  }

  .activity-content {
    flex: 1;
    min-width: 0;
  }

  .activity-text {
    display: block;
    font-size: 13px;
    margin-bottom: 4px;
  }

  .activity-text strong {
    color: white;
    font-weight: 500;
  }

  .activity-sub {
    display: block;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  .activity-time {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
    white-space: nowrap;
  }

  /* Wallet Card */
  .wallet-card {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.1) 100%);
    border: 1px solid rgba(139, 92, 246, 0.2);
    border-radius: 20px;
    padding: 24px;
  }

  .wallet-header {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 20px;
  }

  .wallet-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    font-size: 18px;
  }

  .wallet-balance {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 24px;
  }

  .balance-value {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 2.25rem;
    font-weight: 700;
  }

  .balance-currency {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.6);
  }

  .wallet-actions {
    display: flex;
    gap: 12px;
  }

  .wallet-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 14px;
    font-size: 14px;
    font-weight: 500;
    color: white;
    cursor: pointer;
    transition: all 0.2s;
  }

  .wallet-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.25);
  }

  /* Responsive */
  @media (max-width: 1200px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .main-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .header-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 24px;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .actions-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  @media (max-width: 480px) {
    .actions-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
`
