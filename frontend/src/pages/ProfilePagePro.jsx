/**
 * Profile Page - Creator Dashboard
 * DGC Platform
 * Author: Sourav Rajak
 */

import { useState } from 'react'
import { useWallet } from '../hooks/useWallet.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'

export default function ProfilePage() {
  const { isConnected, account, connectWallet } = useWallet()
  const [activeTab, setActiveTab] = useState('created')

  // Mock data
  const stats = [
    { label: 'Created', value: '24', icon: '🎨' },
    { label: 'Collected', value: '12', icon: '💎' },
    { label: 'Total Sales', value: '42.5 ETH', icon: '💰' },
    { label: 'Followers', value: '1.2K', icon: '👥' },
  ]

  const nfts = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    name: `Living NFT #${1000 + i}`,
    price: (Math.random() * 5 + 0.5).toFixed(2),
    color: ['#8B5CF6', '#EC4899', '#06B6D4'][i % 3],
  }))

  if (!isConnected) {
    return (
      <div className="profile-connect">
        <Card variant="default" className="connect-card">
          <div className="connect-content">
            <div className="connect-icon">🔐</div>
            <h2 className="connect-title">Connect Your Wallet</h2>
            <p className="connect-desc">Connect your wallet to view your profile and manage your NFTs</p>
            <Button variant="primary" size="lg" onClick={connectWallet} icon="⚡">
              Connect Wallet
            </Button>
          </div>
        </Card>
        <style>{styles}</style>
      </div>
    )
  }

  return (
    <div className="profile-premium">
      <div className="profile-container">
        {/* Cover & Avatar */}
        <div className="profile-cover">
          <div className="cover-gradient" />
          <div className="avatar-section">
            <div className="avatar-wrap">
              <div className="avatar" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' }}>
                {account && account.slice(2, 4).toUpperCase()}
              </div>
              <button className="avatar-edit">📷</button>
            </div>
            <div className="profile-info">
              <h1 className="profile-name">Creator {account && account.slice(0, 6)}...</h1>
              <p className="profile-address">{account}</p>
              <div className="profile-badges">
                <span className="badge">✅ Verified</span>
                <span className="badge">⭐ Top Creator</span>
              </div>
            </div>
            <div className="profile-actions">
              <Button variant="outline">Edit Profile</Button>
              <Button variant="ghost">⚙️</Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {stats.map((stat, i) => (
            <Card key={i} variant="default" hover>
              <div className="stat-card">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-data">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button 
            className={`profile-tab ${activeTab === 'created' ? 'active' : ''}`}
            onClick={() => setActiveTab('created')}
          >
            <span>🎨</span> Created ({nfts.length})
          </button>
          <button 
            className={`profile-tab ${activeTab === 'collected' ? 'active' : ''}`}
            onClick={() => setActiveTab('collected')}
          >
            <span>💎</span> Collected ({nfts.length})
          </button>
          <button 
            className={`profile-tab ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            <span>📊</span> Activity
          </button>
        </div>

        {/* Content */}
        <div className="tab-content">
          {(activeTab === 'created' || activeTab === 'collected') && (
            <div className="nfts-grid">
              {nfts.map((nft) => (
                <Card key={nft.id} variant="default" hover>
                  <div className="nft-card">
                    <div 
                      className="nft-image"
                      style={{ background: `linear-gradient(135deg, ${nft.color}40 0%, ${nft.color}10 100%)` }}
                    >
                      <div className="nft-emoji">✨</div>
                      <div className="nft-glow" style={{ background: nft.color }} />
                    </div>
                    <div className="nft-info">
                      <h3 className="nft-name">{nft.name}</h3>
                      <div className="nft-price">{nft.price} ETH</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="activity-feed">
              {[...Array(5)].map((_, i) => (
                <Card key={i} variant="default" hover={false}>
                  <div className="activity-row">
                    <div className="activity-icon">💰</div>
                    <div className="activity-details">
                      <div className="activity-title">Sold Living NFT #{1000 + i}</div>
                      <div className="activity-time">2 hours ago</div>
                    </div>
                    <div className="activity-value">{(Math.random() * 3 + 1).toFixed(2)} ETH</div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{styles}</style>
    </div>
  )
}

const styles = `
  .profile-connect {
    min-height: 100vh;
    padding: 100px 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .connect-card {
    max-width: 500px;
    margin: 0 auto;
  }

  .connect-content {
    text-align: center;
    padding: 60px 40px;
  }

  .connect-icon {
    font-size: 80px;
    margin-bottom: 24px;
  }

  .connect-title {
    font-size: 2rem;
    font-weight: 800;
    margin: 0 0 16px;
  }

  .connect-desc {
    color: rgba(255, 255, 255, 0.6);
    margin: 0 0 32px;
  }

  .profile-premium {
    min-height: 100vh;
    padding: 80px 0 60px;
    background: var(--bg-primary);
  }

  .profile-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 clamp(1rem, 5vw, 2rem);
  }

  .profile-cover {
    position: relative;
    margin-bottom: 60px;
  }

  .cover-gradient {
    height: 300px;
    background: var(--gradient-aurora);
    border-radius: 24px;
    margin-bottom: -80px;
  }

  .avatar-section {
    position: relative;
    display: flex;
    align-items: flex-end;
    gap: 32px;
    padding: 0 40px;
    flex-wrap: wrap;
  }

  .avatar-wrap {
    position: relative;
  }

  .avatar {
    width: 160px;
    height: 160px;
    border-radius: 50%;
    border: 6px solid var(--bg-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    font-weight: 900;
    color: white;
  }

  .avatar-edit {
    position: absolute;
    bottom: 10px;
    right: 10px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 3px solid var(--bg-primary);
    background: var(--primary-color);
    cursor: pointer;
    font-size: 18px;
  }

  .profile-info {
    flex: 1;
    min-width: 300px;
  }

  .profile-name {
    font-family: var(--font-family-display);
    font-size: 2.5rem;
    font-weight: 900;
    margin: 0 0 8px;
  }

  .profile-address {
    font-family: var(--font-family-mono);
    color: rgba(255, 255, 255, 0.6);
    margin: 0 0 16px;
  }

  .profile-badges {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .badge {
    padding: 6px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 100px;
    font-size: 13px;
    font-weight: 600;
  }

  .profile-actions {
    display: flex;
    gap: 12px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
    margin-bottom: 48px;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 24px;
  }

  .stat-icon {
    font-size: 40px;
  }

  .stat-data {
    flex: 1;
  }

  .stat-value {
    font-family: var(--font-family-display);
    font-size: 2rem;
    font-weight: 800;
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
  }

  .profile-tabs {
    display: flex;
    gap: 12px;
    margin-bottom: 32px;
    border-bottom: 2px solid rgba(255, 255, 255, 0.05);
    overflow-x: auto;
  }

  .profile-tab {
    padding: 16px 24px;
    background: transparent;
    border: none;
    border-bottom: 3px solid transparent;
    color: rgba(255, 255, 255, 0.6);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .profile-tab:hover {
    color: var(--text-primary);
  }

  .profile-tab.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
  }

  .tab-content {
    min-height: 400px;
  }

  .nfts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
  }

  .nft-card {
    padding: 0;
  }

  .nft-image {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 16px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    overflow: hidden;
  }

  .nft-emoji {
    font-size: 60px;
    position: relative;
    z-index: 1;
  }

  .nft-glow {
    position: absolute;
    inset: -50%;
    filter: blur(60px);
    opacity: 0.25;
  }

  .nft-info {
    padding: 0 16px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .nft-name {
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0;
  }

  .nft-price {
    font-family: var(--font-family-display);
    font-weight: 800;
    color: var(--primary-color);
  }

  .activity-feed {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .activity-row {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px;
  }

  .activity-icon {
    font-size: 32px;
  }

  .activity-details {
    flex: 1;
  }

  .activity-title {
    font-weight: 600;
    margin-bottom: 4px;
  }

  .activity-time {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
  }

  .activity-value {
    font-family: var(--font-family-display);
    font-size: 1.2rem;
    font-weight: 800;
    color: var(--primary-color);
  }

  @media (max-width: 1024px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 640px) {
    .avatar-section {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .profile-info {
      min-width: auto;
    }

    .profile-badges {
      justify-content: center;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .nfts-grid {
      grid-template-columns: 1fr;
    }
  }
`
