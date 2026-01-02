import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet.jsx'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const TABS = [
  { id: 'owned', label: 'Owned NFTs' },
  { id: 'created', label: 'Created' },
  { id: 'activity', label: 'Activity' }
]

function ProfilePage() {
  const { address, isConnected, balance } = useWallet()
  const [searchParams] = useSearchParams()
  const profileAddress = searchParams.get('address') || address

  const [activeTab, setActiveTab] = useState('owned')
  const [nfts, setNfts] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    totalOwned: 0,
    totalCreated: 0,
    totalSales: 0,
    totalEarnings: '0'
  })

  const isOwnProfile = address && profileAddress?.toLowerCase() === address.toLowerCase()

  useEffect(() => {
    if (profileAddress) {
      fetchProfileData()
    }
  }, [profileAddress, activeTab])

  async function fetchProfileData() {
    try {
      setLoading(true)
      setError(null)

      if (activeTab === 'owned') {
        const response = await axios.get(`${API_BASE}/api/nfts?owner=${profileAddress}`)
        setNfts(response.data.nfts || [])
        setStats(prev => ({ ...prev, totalOwned: response.data.total || 0 }))
      } else if (activeTab === 'created') {
        const response = await axios.get(`${API_BASE}/api/nfts?creator=${profileAddress}`)
        setNfts(response.data.nfts || [])
        setStats(prev => ({ ...prev, totalCreated: response.data.total || 0 }))
      } else if (activeTab === 'activity') {
        // Fetch activity - this would come from blockchain events
        const response = await axios.get(`${API_BASE}/api/activity?address=${profileAddress}`)
        setActivities(response.data.activities || [])
      }
    } catch (err) {
      console.error('Error fetching profile data:', err)
      // Don't set error for empty results
      if (err.response?.status !== 404) {
        setError('Failed to load profile data')
      }
    } finally {
      setLoading(false)
    }
  }

  const formatAddress = (addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(profileAddress)
    alert('Address copied to clipboard!')
  }

  if (!isConnected && !profileAddress) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h2>Connect Your Wallet</h2>
        <p>Please connect your wallet to view your profile.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Profile Header */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {/* Avatar */}
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #646cff, #535bf2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#fff'
          }}>
            {profileAddress?.slice(2, 4).toUpperCase()}
          </div>

          {/* Profile Info */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <h1 style={{ margin: 0 }}>
                {isOwnProfile ? 'My Profile' : 'Profile'}
              </h1>
              {isOwnProfile && (
                <span style={{
                  background: '#646cff',
                  color: '#fff',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem'
                }}>
                  You
                </span>
              )}
            </div>
            
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                color: '#888',
                cursor: 'pointer'
              }}
              onClick={copyAddress}
              title="Click to copy"
            >
              <span style={{ fontFamily: 'monospace' }}>{formatAddress(profileAddress)}</span>
              <span style={{ fontSize: '0.8rem' }}>📋</span>
            </div>

            {isOwnProfile && balance && (
              <div style={{ marginTop: '0.5rem', color: '#888' }}>
                Balance: <span style={{ color: '#646cff', fontWeight: '600' }}>{parseFloat(balance).toFixed(4)} ETH</span>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          {isOwnProfile && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/generate" className="btn btn-primary">
                Create NFT
              </Link>
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '1rem', 
          marginTop: '2rem',
          paddingTop: '2rem',
          borderTop: '1px solid #333'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#646cff' }}>
              {stats.totalOwned}
            </div>
            <div style={{ color: '#888', fontSize: '0.9rem' }}>Owned</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#646cff' }}>
              {stats.totalCreated}
            </div>
            <div style={{ color: '#888', fontSize: '0.9rem' }}>Created</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#646cff' }}>
              {stats.totalSales}
            </div>
            <div style={{ color: '#888', fontSize: '0.9rem' }}>Sales</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#646cff' }}>
              {stats.totalEarnings} ETH
            </div>
            <div style={{ color: '#888', fontSize: '0.9rem' }}>Earnings</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '2rem',
        borderBottom: '1px solid #333',
        paddingBottom: '1rem'
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`btn ${activeTab === tab.id ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error Display */}
      {error && <div className="error">{error}</div>}

      {/* Loading State */}
      {loading && (
        <div className="loading">
          <div>Loading...</div>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {/* NFTs Grid */}
          {(activeTab === 'owned' || activeTab === 'created') && (
            <>
              {nfts.length > 0 ? (
                <div className="grid grid-3">
                  {nfts.map((nft) => (
                    <Link 
                      key={nft.token_id} 
                      to={`/nft/${nft.token_id}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <div className="nft-card">
                        <img 
                          src={nft.image || '/placeholder-image.svg'} 
                          alt={nft.name}
                          className="nft-image"
                          onError={(e) => {
                            e.target.src = '/placeholder-image.svg'
                          }}
                        />
                        <div className="nft-info">
                          <div className="nft-title">{nft.name}</div>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            color: '#888',
                            fontSize: '0.9rem'
                          }}>
                            <span>{nft.content_type}</span>
                            {nft.price && (
                              <span className="nft-price">{nft.price} ETH</span>
                            )}
                          </div>
                          {nft.is_listed && (
                            <div style={{ 
                              marginTop: '0.5rem',
                              color: '#51cf66',
                              fontSize: '0.8rem'
                            }}>
                              Listed for sale
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>
                  <h3>No NFTs found</h3>
                  <p>
                    {activeTab === 'owned' 
                      ? "You don't own any NFTs yet."
                      : "You haven't created any NFTs yet."}
                  </p>
                  {isOwnProfile && (
                    <Link to="/generate" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                      Create Your First NFT
                    </Link>
                  )}
                </div>
              )}
            </>
          )}

          {/* Activity Feed */}
          {activeTab === 'activity' && (
            <>
              {activities.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {activities.map((activity, index) => (
                    <div key={index} className="card" style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                            {activity.type}
                          </div>
                          <div style={{ color: '#888', fontSize: '0.9rem' }}>
                            {activity.description}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', color: '#888', fontSize: '0.9rem' }}>
                          {activity.timestamp && new Date(activity.timestamp).toLocaleDateString()}
                          {activity.value && (
                            <div style={{ color: '#646cff', fontWeight: '600' }}>
                              {activity.value} ETH
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>
                  <h3>No activity yet</h3>
                  <p>Your transaction history will appear here.</p>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

export default ProfilePage
