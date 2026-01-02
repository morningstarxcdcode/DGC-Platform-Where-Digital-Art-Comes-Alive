import { useState } from 'react'
import { useWallet } from '../hooks/useWallet.jsx'
import { useRealTimeData } from '../hooks/useWebSocket.jsx'
import SystemStatus from './SystemStatus.jsx'

/**
 * MetaMask Real-Time Dashboard Component - Professional Studio Design
 * 
 * Features:
 * - Professional dark theme with neon accents
 * - Real-time WebSocket data streaming
 * - Live balance tracking with USD conversion
 * - Transaction monitoring with status indicators
 * - NFT portfolio with image previews
 * - Gas price tracking with speed options
 * - Multi-wallet provider support
 * - Network switching capabilities
 * 
 * Validates: Requirements 13.1-13.8
 * Implements: Tasks 20.1-20.5, 21.1-21.6
 */

function MetaMaskDashboard() {
  const { 
    address, 
    isConnected, 
    balance, 
    balanceUSD,
    isAutoWallet, 
    connect, 
    switchNetwork, 
    chainId, 
    targetNetwork,
    networkName,
    gasPrice,
    blockNumber,
    tokens,
    nfts,
    transactions,
    isLoadingData,
    refreshData
  } = useWallet()
  
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [showSystemStatus, setShowSystemStatus] = useState(false)

  // Real-time data integration
  const {
    gasPrice: realtimeGasPrice,
    marketData,
    walletConnected,
    isFullyConnected,
    reconnectWallet
  } = useRealTimeData(address)

  // Use real-time gas price if available, otherwise use wallet hook gas price
  const currentGasPrice = realtimeGasPrice || {
    slow: gasPrice ? Math.max(1, parseFloat(gasPrice) - 10).toFixed(1) : '20',
    standard: gasPrice || '35',
    fast: gasPrice ? (parseFloat(gasPrice) + 10).toFixed(1) : '50',
    instant: gasPrice ? (parseFloat(gasPrice) + 25).toFixed(1) : '70'
  }

  // Create wallet data object from hook data
  const walletData = {
    eth_balance: balance,
    eth_usd_value: parseFloat(balanceUSD || '0'),
    tokens: tokens || [],
    nfts: nfts || [],
    transactions: transactions || []
  }

  const loading = isLoadingData

  if (!isConnected) {
    return (
      <div className="metamask-dashboard-professional">
        <div className="connect-prompt-studio">
          <div className="studio-header">
            <div className="studio-icon">
              <div className="icon-gradient">🦊</div>
            </div>
            <h3 className="studio-title">WALLET CONNECTION REQUIRED</h3>
            <p className="studio-subtitle">Connect your Web3 wallet to access the professional dashboard</p>
          </div>
          
          <div className="wallet-options-grid">
            <button className="wallet-option-card metamask" onClick={connect}>
              <div className="wallet-icon">🦊</div>
              <div className="wallet-info">
                <span className="wallet-name">MetaMask</span>
                <span className="wallet-desc">Browser Extension</span>
              </div>
              <div className="connect-indicator">→</div>
            </button>
            
            <button className="wallet-option-card auto-wallet" onClick={connect}>
              <div className="wallet-icon">🪄</div>
              <div className="wallet-info">
                <span className="wallet-name">Auto-Wallet</span>
                <span className="wallet-desc">Zero Setup</span>
              </div>
              <div className="connect-indicator">→</div>
            </button>
          </div>
          
          <div className="connection-features">
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span className="feature-text">Real-time Updates</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔒</span>
              <span className="feature-text">Secure Connection</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span className="feature-text">Live Analytics</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading && !walletData) {
    return (
      <div className="metamask-dashboard-professional">
        <div className="loading-studio">
          <div className="loading-animation">
            <div className="loading-ring"></div>
            <div className="loading-ring"></div>
            <div className="loading-ring"></div>
          </div>
          <div className="loading-text">
            <span className="loading-title">INITIALIZING DASHBOARD</span>
            <span className="loading-subtitle">Connecting to blockchain networks...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="metamask-dashboard-professional">
      {/* Professional Studio Header */}
      <div className="dashboard-studio-header">
        <div className="header-left">
          <div className="wallet-status-indicator">
            <div className={`status-dot ${walletConnected ? 'connected' : 'disconnected'}`}></div>
            <div className="wallet-info-compact">
              <span className="wallet-type">{isAutoWallet ? 'AUTO-WALLET' : 'METAMASK'}</span>
              <span className="wallet-address">{address?.slice(0, 8)}...{address?.slice(-6)}</span>
            </div>
          </div>
          
          <div className="live-indicators">
            {walletConnected && (
              <div className="live-badge">
                <span className="live-dot"></span>
                <span className="live-text">LIVE</span>
              </div>
            )}
            {isFullyConnected && (
              <div className="full-sync-badge">
                <span className="sync-icon">⚡</span>
                <span className="sync-text">FULL SYNC</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="header-right">
          <div className="system-stats">
            <div className="stat-item">
              <span className="stat-label">NETWORK</span>
              <span className="stat-value">{networkName || (chainId === targetNetwork ? 'MAINNET' : 'TESTNET')}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">STATUS</span>
              <span className="stat-value">{walletConnected ? 'LIVE' : 'OFFLINE'}</span>
            </div>
            {marketData && (
              <div className="stat-item">
                <span className="stat-label">ETH PRICE</span>
                <span className="stat-value">${marketData.eth_price?.toFixed(0)}</span>
              </div>
            )}
            <div className="stat-item">
              <span className="stat-label">BLOCK</span>
              <span className="stat-value">{blockNumber || '---'}</span>
            </div>
          </div>
          
          <div className="header-actions">
            <button 
              className={`action-btn system-status ${showSystemStatus ? 'active' : ''}`}
              onClick={() => setShowSystemStatus(!showSystemStatus)}
            >
              <span className="btn-icon">📊</span>
              <span className="btn-text">SYSTEM</span>
            </button>
            
            {chainId !== targetNetwork && (
              <button className="action-btn warning" onClick={() => switchNetwork(targetNetwork)}>
                <span className="btn-icon">⚠️</span>
                <span className="btn-text">SWITCH NETWORK</span>
              </button>
            )}
            
            <button className="action-btn refresh" onClick={refreshData}>
              <span className="btn-icon">🔄</span>
              <span className="btn-text">REFRESH</span>
            </button>
            
            {!walletConnected && (
              <button className="action-btn reconnect" onClick={reconnectWallet}>
                <span className="btn-icon">🔗</span>
                <span className="btn-text">RECONNECT</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* System Status Panel */}
      {showSystemStatus && (
        <div className="system-status-panel">
          <SystemStatus compact={false} showDetails={true} />
        </div>
      )}

      {/* Professional Tab Navigation */}
      <div className="dashboard-tabs-studio">
        <div className="tabs-container">
          <button 
            className={`tab-studio ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="tab-icon">📊</span>
            <span className="tab-label">OVERVIEW</span>
            <div className="tab-indicator"></div>
          </button>
          
          <button 
            className={`tab-studio ${activeTab === 'tokens' ? 'active' : ''}`}
            onClick={() => setActiveTab('tokens')}
          >
            <span className="tab-icon">🪙</span>
            <span className="tab-label">TOKENS</span>
            <div className="tab-indicator"></div>
          </button>
          
          <button 
            className={`tab-studio ${activeTab === 'nfts' ? 'active' : ''}`}
            onClick={() => setActiveTab('nfts')}
          >
            <span className="tab-icon">🖼️</span>
            <span className="tab-label">NFTs</span>
            <div className="tab-indicator"></div>
          </button>
          
          <button 
            className={`tab-studio ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            <span className="tab-icon">📜</span>
            <span className="tab-label">TRANSACTIONS</span>
            <div className="tab-indicator"></div>
          </button>
        </div>
      </div>

      {/* Professional Dashboard Content */}
      <div className="dashboard-content-studio">
        {activeTab === 'overview' && (
          <div className="overview-studio">
            {/* Main Balance Card */}
            <div className="balance-card-studio">
              <div className="card-header">
                <div className="header-info">
                  <span className="card-title">TOTAL PORTFOLIO VALUE</span>
                  <span className="card-subtitle">Real-time blockchain data</span>
                </div>
                <div className="header-actions">
                  <div className="currency-selector">
                    <span className="currency-label">ETH</span>
                  </div>
                </div>
              </div>
              
              <div className="balance-display">
                <div className="balance-main">
                  <span className="balance-amount">
                    {parseFloat(walletData?.eth_balance || balance || '0').toFixed(6)}
                  </span>
                  <span className="balance-currency">ETH</span>
                </div>
                <div className="balance-usd">
                  <span className="usd-symbol">≈ $</span>
                  <span className="usd-amount">
                    {(walletData?.eth_usd_value || 0).toLocaleString(undefined, { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </span>
                  <span className="usd-label">USD</span>
                </div>
              </div>
              
              <div className="balance-footer">
                <div className="price-change">
                  <span className="change-indicator positive">↗</span>
                  <span className="change-text">+2.4% (24h)</span>
                </div>
                <div className="last-updated">
                  <span className="update-text">Last updated: {new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            {/* Gas Price Widget */}
            {currentGasPrice && (
              <div className="gas-widget-studio">
                <div className="widget-header">
                  <span className="widget-icon">⛽</span>
                  <span className="widget-title">GAS TRACKER</span>
                  <div className="widget-status">
                    <span className="status-dot active"></span>
                    <span className="status-text">LIVE</span>
                  </div>
                </div>
                
                <div className="gas-options-grid">
                  <div className="gas-option slow">
                    <div className="option-header">
                      <span className="option-icon">🐢</span>
                      <span className="option-label">SLOW</span>
                    </div>
                    <div className="option-value">{currentGasPrice.slow}</div>
                    <div className="option-unit">GWEI</div>
                  </div>
                  
                  <div className="gas-option standard">
                    <div className="option-header">
                      <span className="option-icon">🚶</span>
                      <span className="option-label">STANDARD</span>
                    </div>
                    <div className="option-value">{currentGasPrice.standard}</div>
                    <div className="option-unit">GWEI</div>
                  </div>
                  
                  <div className="gas-option fast">
                    <div className="option-header">
                      <span className="option-icon">🏃</span>
                      <span className="option-label">FAST</span>
                    </div>
                    <div className="option-value">{currentGasPrice.fast}</div>
                    <div className="option-unit">GWEI</div>
                  </div>
                  
                  <div className="gas-option instant">
                    <div className="option-header">
                      <span className="option-icon">🚀</span>
                      <span className="option-label">INSTANT</span>
                    </div>
                    <div className="option-value">{currentGasPrice.instant}</div>
                    <div className="option-unit">GWEI</div>
                  </div>
                </div>
              </div>
            )}

            {/* Portfolio Stats Grid */}
            <div className="stats-grid-studio">
              <div className="stat-card">
                <div className="stat-icon">🪙</div>
                <div className="stat-content">
                  <div className="stat-value">{walletData?.tokens?.length || 0}</div>
                  <div className="stat-label">TOKENS</div>
                </div>
                <div className="stat-trend">
                  <span className="trend-indicator">→</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🖼️</div>
                <div className="stat-content">
                  <div className="stat-value">{walletData?.nfts?.length || 0}</div>
                  <div className="stat-label">NFTs</div>
                </div>
                <div className="stat-trend">
                  <span className="trend-indicator">↗</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📜</div>
                <div className="stat-content">
                  <div className="stat-value">{walletData?.transactions?.length || 0}</div>
                  <div className="stat-label">TRANSACTIONS</div>
                </div>
                <div className="stat-trend">
                  <span className="trend-indicator">↗</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🔗</div>
                <div className="stat-content">
                  <div className="stat-value">{networkName || (chainId === targetNetwork ? 'MAINNET' : 'TESTNET')}</div>
                  <div className="stat-label">NETWORK</div>
                </div>
                <div className="stat-trend">
                  <span className="trend-indicator">●</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tokens' && (
          <div className="tokens-studio">
            <div className="section-header-studio">
              <div className="header-left">
                <span className="section-icon">🪙</span>
                <span className="section-title">TOKEN HOLDINGS</span>
              </div>
              <div className="header-right">
                <button className="action-btn secondary">
                  <span className="btn-icon">🔄</span>
                  <span className="btn-text">REFRESH</span>
                </button>
              </div>
            </div>
            
            {walletData?.tokens?.length > 0 ? (
              <div className="tokens-grid-studio">
                {walletData.tokens.map((token, index) => (
                  <div key={index} className="token-card-studio">
                    <div className="token-header">
                      <div className="token-icon">
                        {token.logo_url ? (
                          <img src={token.logo_url} alt={token.symbol} className="token-logo" />
                        ) : (
                          <div className="token-placeholder">🪙</div>
                        )}
                      </div>
                      <div className="token-info">
                        <span className="token-symbol">{token.symbol}</span>
                        <span className="token-name">{token.name}</span>
                      </div>
                    </div>
                    
                    <div className="token-balance">
                      <div className="balance-amount">{parseFloat(token.balance).toFixed(4)}</div>
                      <div className="balance-symbol">{token.symbol}</div>
                    </div>
                    
                    {token.usd_value && (
                      <div className="token-value">
                        <span className="value-usd">${token.usd_value.toFixed(2)}</span>
                        <span className="value-change">+2.1%</span>
                      </div>
                    )}
                    
                    <div className="token-actions">
                      <button className="token-action">SEND</button>
                      <button className="token-action">SWAP</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state-studio">
                <div className="empty-icon">🪙</div>
                <div className="empty-title">NO TOKENS DETECTED</div>
                <div className="empty-subtitle">This wallet doesn't hold any ERC-20 tokens</div>
                <button className="empty-action">EXPLORE TOKENS</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'nfts' && (
          <div className="nfts-studio">
            <div className="section-header-studio">
              <div className="header-left">
                <span className="section-icon">🖼️</span>
                <span className="section-title">NFT COLLECTION</span>
              </div>
              <div className="header-right">
                <div className="view-options">
                  <button className="view-btn active">GRID</button>
                  <button className="view-btn">LIST</button>
                </div>
              </div>
            </div>
            
            {walletData?.nfts?.length > 0 ? (
              <div className="nfts-grid-studio">
                {walletData.nfts.map((nft, index) => (
                  <div key={index} className="nft-card-studio">
                    <div className="nft-image-container">
                      {nft.tokenURI ? (
                        <img src={nft.tokenURI} alt={nft.name} className="nft-image" />
                      ) : (
                        <div className="nft-placeholder">
                          <span className="placeholder-icon">🖼️</span>
                        </div>
                      )}
                      <div className="nft-overlay">
                        <button className="overlay-action">VIEW</button>
                        <button className="overlay-action">SELL</button>
                      </div>
                    </div>
                    
                    <div className="nft-details">
                      <div className="nft-header">
                        <span className="nft-name">{nft.name}</span>
                        {nft.collection && (
                          <span className="nft-collection">{nft.collection}</span>
                        )}
                      </div>
                      
                      <div className="nft-stats">
                        <div className="stat">
                          <span className="stat-label">TOKEN ID</span>
                          <span className="stat-value">#{nft.tokenId}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state-studio">
                <div className="empty-icon">🖼️</div>
                <div className="empty-title">NO NFTs FOUND</div>
                <div className="empty-subtitle">Start your collection by creating or purchasing NFTs</div>
                <div className="empty-actions">
                  <button className="empty-action primary">CREATE NFT</button>
                  <button className="empty-action secondary">BROWSE MARKETPLACE</button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="transactions-studio">
            <div className="section-header-studio">
              <div className="header-left">
                <span className="section-icon">📜</span>
                <span className="section-title">TRANSACTION HISTORY</span>
              </div>
              <div className="header-right">
                <div className="filter-options">
                  <select className="filter-select">
                    <option>ALL TYPES</option>
                    <option>SEND</option>
                    <option>RECEIVE</option>
                    <option>SWAP</option>
                  </select>
                </div>
              </div>
            </div>
            
            {walletData?.transactions?.length > 0 ? (
              <div className="transactions-list-studio">
                {walletData.transactions.map((tx, index) => (
                  <div key={index} className="transaction-card-studio">
                    <div className="tx-icon-container">
                      <div className={`tx-icon ${tx.from?.toLowerCase() === address?.toLowerCase() ? 'outgoing' : 'incoming'}`}>
                        {tx.from?.toLowerCase() === address?.toLowerCase() ? '📤' : '📥'}
                      </div>
                    </div>
                    
                    <div className="tx-details">
                      <div className="tx-header">
                        <span className="tx-type">
                          {tx.from?.toLowerCase() === address?.toLowerCase() ? 'SENT' : 'RECEIVED'}
                        </span>
                        <span className="tx-hash">{tx.hash?.slice(0, 10)}...{tx.hash?.slice(-8)}</span>
                      </div>
                      
                      <div className="tx-info">
                        <span className="tx-time">
                          {tx.timestamp ? new Date(tx.timestamp * 1000).toLocaleString() : 'Pending'}
                        </span>
                        <div className="tx-addresses">
                          <span className="address-label">
                            {tx.from?.toLowerCase() === address?.toLowerCase() ? 'TO:' : 'FROM:'}
                          </span>
                          <span className="address-value">
                            {tx.from?.toLowerCase() === address?.toLowerCase() 
                              ? `${tx.to?.slice(0, 6)}...${tx.to?.slice(-4)}`
                              : `${tx.from?.slice(0, 6)}...${tx.from?.slice(-4)}`
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="tx-amount-container">
                      <div className={`tx-amount ${tx.from?.toLowerCase() === address?.toLowerCase() ? 'outgoing' : 'incoming'}`}>
                        <span className="amount-sign">
                          {tx.from?.toLowerCase() === address?.toLowerCase() ? '-' : '+'}
                        </span>
                        <span className="amount-value">{tx.value}</span>
                        <span className="amount-currency">ETH</span>
                      </div>
                      
                      <div className={`tx-status ${tx.status?.toLowerCase()}`}>
                        <span className="status-icon">
                          {tx.status === 'success' ? '✅' : tx.status === 'pending' ? '⏳' : '❌'}
                        </span>
                        <span className="status-text">{tx.status?.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state-studio">
                <div className="empty-icon">📜</div>
                <div className="empty-title">NO TRANSACTIONS</div>
                <div className="empty-subtitle">Transaction history will appear here once you start using your wallet</div>
                <button className="empty-action">MAKE FIRST TRANSACTION</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="error-banner-studio">
          <div className="error-icon">⚠️</div>
          <div className="error-content">
            <span className="error-title">SYSTEM ERROR</span>
            <span className="error-message">{error}</span>
          </div>
          <button className="error-dismiss" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <style jsx>{`
        .metamask-dashboard-professional {
          background: linear-gradient(135deg, #0B0E14 0%, #161B28 100%);
          color: #ffffff;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        .metamask-dashboard-professional::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            linear-gradient(rgba(137, 90, 246, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(137, 90, 246, 0.05) 1px, transparent 1px);
          background-size: 20px 20px;
          pointer-events: none;
        }

        /* Connect Prompt Styles */
        .connect-prompt-studio {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 80vh;
          padding: 2rem;
          position: relative;
          z-index: 1;
        }

        .studio-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .studio-icon {
          margin-bottom: 1.5rem;
        }

        .icon-gradient {
          font-size: 4rem;
          background: linear-gradient(135deg, #895af6 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 20px rgba(137, 90, 246, 0.3));
        }

        .studio-title {
          font-size: 2rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #ffffff 0%, #94A3B8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .studio-subtitle {
          font-size: 1rem;
          color: #94A3B8;
          font-family: 'JetBrains Mono', monospace;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .wallet-options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
          width: 100%;
          max-width: 600px;
        }

        .wallet-option-card {
          background: rgba(29, 35, 51, 0.9);
          border: 1px solid #2D3548;
          border-radius: 8px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .wallet-option-card:hover {
          border-color: #895af6;
          box-shadow: 0 0 20px rgba(137, 90, 246, 0.2);
          transform: translateY(-2px);
        }

        .wallet-option-card.metamask:hover {
          box-shadow: 0 0 20px rgba(255, 102, 51, 0.2);
        }

        .wallet-option-card.auto-wallet:hover {
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.2);
        }

        .wallet-icon {
          font-size: 2rem;
          width: 3rem;
          height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(137, 90, 246, 0.1);
          border-radius: 8px;
          border: 1px solid rgba(137, 90, 246, 0.2);
        }

        .wallet-info {
          flex: 1;
        }

        .wallet-name {
          display: block;
          font-weight: 700;
          font-size: 1.1rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }

        .wallet-desc {
          display: block;
          font-size: 0.8rem;
          color: #94A3B8;
          font-family: 'JetBrains Mono', monospace;
          text-transform: uppercase;
        }

        .connect-indicator {
          font-size: 1.5rem;
          color: #895af6;
          transition: transform 0.3s ease;
        }

        .wallet-option-card:hover .connect-indicator {
          transform: translateX(5px);
        }

        .connection-features {
          display: flex;
          gap: 2rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #94A3B8;
          font-family: 'JetBrains Mono', monospace;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .feature-icon {
          font-size: 1.2rem;
        }

        /* Loading Styles */
        .loading-studio {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 80vh;
          position: relative;
          z-index: 1;
        }

        .loading-animation {
          position: relative;
          width: 80px;
          height: 80px;
          margin-bottom: 2rem;
        }

        .loading-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 2px solid transparent;
          border-top: 2px solid #895af6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loading-ring:nth-child(2) {
          width: 60px;
          height: 60px;
          top: 10px;
          left: 10px;
          border-top-color: #06b6d4;
          animation-duration: 1.5s;
          animation-direction: reverse;
        }

        .loading-ring:nth-child(3) {
          width: 40px;
          height: 40px;
          top: 20px;
          left: 20px;
          border-top-color: #a855f7;
          animation-duration: 2s;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-text {
          text-align: center;
        }

        .loading-title {
          display: block;
          font-size: 1.5rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 0.5rem;
          color: #ffffff;
        }

        .loading-subtitle {
          display: block;
          font-size: 0.9rem;
          color: #94A3B8;
          font-family: 'JetBrains Mono', monospace;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Dashboard Header Styles */
        .dashboard-studio-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          background: rgba(29, 35, 51, 0.9);
          border-bottom: 1px solid #2D3548;
          backdrop-filter: blur(10px);
          position: relative;
          z-index: 10;
        }

        .dashboard-studio-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, #895af6 50%, transparent 100%);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .wallet-status-indicator {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          position: relative;
        }

        .status-dot.connected {
          background: #10b981;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.6);
        }

        .status-dot.connected::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border-radius: 50%;
          background: #10b981;
          opacity: 0.3;
          animation: pulse 2s infinite;
        }

        .status-dot.disconnected {
          background: #ef4444;
          box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.5); opacity: 0.1; }
        }

        .wallet-info-compact {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .wallet-type {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #895af6;
          font-family: 'JetBrains Mono', monospace;
        }

        .wallet-address {
          font-size: 0.9rem;
          color: #94A3B8;
          font-family: 'JetBrains Mono', monospace;
        }

        .live-indicators {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .live-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.75rem;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 20px;
        }

        .live-dot {
          width: 6px;
          height: 6px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .full-sync-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.75rem;
          background: rgba(6, 182, 212, 0.1);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 20px;
        }

        .sync-icon {
          font-size: 0.8rem;
          color: #06b6d4;
        }

        .sync-text {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #06b6d4;
          font-family: 'JetBrains Mono', monospace;
        }

        .action-btn.system-status {
          border-color: #06b6d4;
          color: #06b6d4;
        }

        .action-btn.system-status:hover,
        .action-btn.system-status.active {
          background: rgba(6, 182, 212, 0.1);
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.2);
        }

        .action-btn.reconnect {
          border-color: #f59e0b;
          color: #f59e0b;
        }

        .action-btn.reconnect:hover {
          background: rgba(245, 158, 11, 0.1);
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.2);
        }

        .system-status-panel {
          margin: 0 2rem 2rem 2rem;
          border-radius: 12px;
          overflow: hidden;
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .system-stats {
          display: flex;
          gap: 1.5rem;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .stat-label {
          font-size: 0.7rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #94A3B8;
          font-family: 'JetBrains Mono', monospace;
        }

        .stat-value {
          font-size: 0.8rem;
          font-weight: 700;
          color: #06b6d4;
          font-family: 'JetBrains Mono', monospace;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(29, 35, 51, 0.9);
          border: 1px solid #2D3548;
          border-radius: 6px;
          color: #ffffff;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'JetBrains Mono', monospace;
        }

        .action-btn:hover {
          border-color: #895af6;
          box-shadow: 0 0 10px rgba(137, 90, 246, 0.2);
        }

        .action-btn.warning {
          border-color: #f59e0b;
          color: #f59e0b;
        }

        .action-btn.warning:hover {
          background: rgba(245, 158, 11, 0.1);
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.2);
        }

        .action-btn.refresh:hover {
          background: rgba(6, 182, 212, 0.1);
          border-color: #06b6d4;
          color: #06b6d4;
        }

        .btn-icon {
          font-size: 1rem;
        }

        .btn-text {
          font-size: 0.7rem;
        }

        /* Tab Navigation Styles */
        .dashboard-tabs-studio {
          background: rgba(11, 14, 20, 0.9);
          border-bottom: 1px solid #2D3548;
          padding: 0 2rem;
          position: relative;
          z-index: 5;
        }

        .tabs-container {
          display: flex;
          gap: 0;
        }

        .tab-studio {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          background: transparent;
          border: none;
          color: #94A3B8;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          font-family: 'JetBrains Mono', monospace;
        }

        .tab-studio:hover {
          color: #ffffff;
          background: rgba(137, 90, 246, 0.1);
        }

        .tab-studio.active {
          color: #895af6;
          background: rgba(137, 90, 246, 0.1);
        }

        .tab-studio.active .tab-indicator {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #895af6 0%, #06b6d4 100%);
        }

        .tab-icon {
          font-size: 1.2rem;
        }

        .tab-label {
          font-size: 0.75rem;
        }

        /* Dashboard Content Styles */
        .dashboard-content-studio {
          padding: 2rem;
          position: relative;
          z-index: 1;
          min-height: calc(100vh - 200px);
        }

        /* Overview Styles */
        .overview-studio {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        .balance-card-studio {
          background: rgba(29, 35, 51, 0.9);
          border: 1px solid #2D3548;
          border-radius: 12px;
          padding: 2rem;
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }

        .balance-card-studio::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, #895af6 50%, transparent 100%);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        .header-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .card-title {
          font-size: 0.9rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #895af6;
          font-family: 'JetBrains Mono', monospace;
        }

        .card-subtitle {
          font-size: 0.8rem;
          color: #94A3B8;
          font-family: 'JetBrains Mono', monospace;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .currency-selector {
          padding: 0.5rem 1rem;
          background: rgba(137, 90, 246, 0.1);
          border: 1px solid rgba(137, 90, 246, 0.2);
          border-radius: 6px;
        }

        .currency-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: #895af6;
          font-family: 'JetBrains Mono', monospace;
        }

        .balance-display {
          margin-bottom: 2rem;
        }

        .balance-main {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .balance-amount {
          font-size: 3rem;
          font-weight: 900;
          color: #ffffff;
          font-family: 'JetBrains Mono', monospace;
        }

        .balance-currency {
          font-size: 1.2rem;
          font-weight: 700;
          color: #94A3B8;
          font-family: 'JetBrains Mono', monospace;
        }

        .balance-usd {
          display: flex;
          align-items: baseline;
          gap: 0.25rem;
        }

        .usd-symbol {
          font-size: 1rem;
          color: #94A3B8;
        }

        .usd-amount {
          font-size: 1.5rem;
          font-weight: 700;
          color: #06b6d4;
          font-family: 'JetBrains Mono', monospace;
        }

        .usd-label {
          font-size: 0.9rem;
          color: #94A3B8;
          font-family: 'JetBrains Mono', monospace;
        }

        .balance-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid #2D3548;
        }

        .price-change {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .change-indicator {
          font-size: 1rem;
        }

        .change-indicator.positive {
          color: #10b981;
        }

        .change-text {
          font-size: 0.8rem;
          font-weight: 600;
          color: #10b981;
          font-family: 'JetBrains Mono', monospace;
        }

        .last-updated {
          font-size: 0.7rem;
          color: #94A3B8;
          font-family: 'JetBrains Mono', monospace;
        }

        /* Gas Widget Styles */
        .gas-widget-studio {
          background: rgba(29, 35, 51, 0.9);
          border: 1px solid #2D3548;
          border-radius: 12px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
        }

        .widget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .widget-icon {
          font-size: 1.2rem;
          margin-right: 0.5rem;
        }

        .widget-title {
          font-size: 0.9rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #ffffff;
          font-family: 'JetBrains Mono', monospace;
        }

        .widget-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-dot.active {
          width: 6px;
          height: 6px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .status-text {
          font-size: 0.7rem;
          font-weight: 700;
          color: #10b981;
          font-family: 'JetBrains Mono', monospace;
        }

        .gas-options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
        }

        .gas-option {
          background: rgba(11, 14, 20, 0.6);
          border: 1px solid #2D3548;
          border-radius: 8px;
          padding: 1rem;
          text-align: center;
          transition: all 0.3s ease;
        }

        .gas-option:hover {
          border-color: #895af6;
          box-shadow: 0 0 10px rgba(137, 90, 246, 0.2);
        }

        .gas-option.slow:hover { border-color: #f59e0b; }
        .gas-option.standard:hover { border-color: #06b6d4; }
        .gas-option.fast:hover { border-color: #10b981; }
        .gas-option.instant:hover { border-color: #ef4444; }

        .option-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .option-icon {
          font-size: 1rem;
        }

        .option-label {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #94A3B8;
          font-family: 'JetBrains Mono', monospace;
        }

        .option-value {
          font-size: 1.2rem;
          font-weight: 900;
          color: #ffffff;
          margin-bottom: 0.25rem;
          font-family: 'JetBrains Mono', monospace;
        }

        .option-unit {
          font-size: 0.7rem;
          color: #94A3B8;
          font-family: 'JetBrains Mono', monospace;
        }

        /* Stats Grid Styles */
        .stats-grid-studio {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .stat-card {
          background: rgba(29, 35, 51, 0.9);
          border: 1px solid #2D3548;
          border-radius: 8px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          border-color: #895af6;
          box-shadow: 0 0 15px rgba(137, 90, 246, 0.2);
        }

        .stat-icon {
          font-size: 2rem;
          width: 3rem;
          height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(137, 90, 246, 0.1);
          border-radius: 8px;
          border: 1px solid rgba(137, 90, 246, 0.2);
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 900;
          color: #ffffff;
          margin-bottom: 0.25rem;
          font-family: 'JetBrains Mono', monospace;
        }

        .stat-label {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #94A3B8;
          font-family: 'JetBrains Mono', monospace;
        }

        .stat-trend {
          font-size: 1.2rem;
          color: #10b981;
        }

        /* Section Header Styles */
        .section-header-studio {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #2D3548;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .section-icon {
          font-size: 1.5rem;
        }

        .section-title {
          font-size: 1.2rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #ffffff;
          font-family: 'JetBrains Mono', monospace;
        }

        .header-right {
          display: flex;
          gap: 1rem;
        }

        .action-btn.secondary {
          background: rgba(11, 14, 20, 0.6);
          border-color: #2D3548;
        }

        .action-btn.secondary:hover {
          background: rgba(137, 90, 246, 0.1);
          border-color: #895af6;
        }

        /* Tokens Styles */
        .tokens-studio {
          position: relative;
          z-index: 1;
        }

        .tokens-grid-studio {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .token-card-studio {
          background: rgba(29, 35, 51, 0.9);
          border: 1px solid #2D3548;
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .token-card-studio:hover {
          border-color: #895af6;
          box-shadow: 0 0 20px rgba(137, 90, 246, 0.2);
          transform: translateY(-2px);
        }

        .token-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .token-icon {
          width: 3rem;
          height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(137, 90, 246, 0.1);
          border-radius: 50%;
          border: 1px solid rgba(137, 90, 246, 0.2);
        }

        .token-logo {
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
        }

        .token-placeholder {
          font-size: 1.5rem;
        }

        .token-info {
          flex: 1;
        }

        .token-symbol {
          display: block;
          font-size: 1.1rem;
          font-weight: 900;
          color: #ffffff;
          margin-bottom: 0.25rem;
          font-family: 'JetBrains Mono', monospace;
        }

        .token-name {
          display: block;
          font-size: 0.8rem;
          color: #94A3B8;
          font-family: 'JetBrains Mono', monospace;
        }

        .token-balance {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .balance-amount {
          font-size: 2rem;
          font-weight: 900;
          color: #ffffff;
          font-family: 'JetBrains Mono', monospace;
        }

        .balance-symbol {
          font-size: 0.9rem;
          color: #94A3B8;
          font-family: 'JetBrains Mono', monospace;
        }

        .token-value {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .value-usd {
          font-size: 1rem;
          font-weight: 700;
          color: #06b6d4;
          font-family: 'JetBrains Mono', monospace;
        }

        .value-change {
          font-size: 0.8rem;
          font-weight: 600;
          color: #10b981;
          font-family: 'JetBrains Mono', monospace;
        }

        .token-actions {
          display: flex;
          gap: 0.5rem;
        }

        .token-action {
          flex: 1;
          padding: 0.5rem;
          background: rgba(11, 14, 20, 0.6);
          border: 1px solid #2D3548;
          border-radius: 6px;
          color: #94A3B8;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'JetBrains Mono', monospace;
        }

        .token-action:hover {
          border-color: #895af6;
          color: #895af6;
          background: rgba(137, 90, 246, 0.1);
        }

        /* NFTs Styles */
        .nfts-studio {
          position: relative;
          z-index: 1;
        }

        .view-options {
          display: flex;
          gap: 0.5rem;
        }

        .view-btn {
          padding: 0.5rem 1rem;
          background: rgba(11, 14, 20, 0.6);
          border: 1px solid #2D3548;
          border-radius: 6px;
          color: #94A3B8;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'JetBrains Mono', monospace;
        }

        .view-btn.active,
        .view-btn:hover {
          border-color: #895af6;
          color: #895af6;
          background: rgba(137, 90, 246, 0.1);
        }

        .nfts-grid-studio {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .nft-card-studio {
          background: rgba(29, 35, 51, 0.9);
          border: 1px solid #2D3548;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .nft-card-studio:hover {
          border-color: #895af6;
          box-shadow: 0 0 20px rgba(137, 90, 246, 0.2);
          transform: translateY(-2px);
        }

        .nft-image-container {
          position: relative;
          aspect-ratio: 1;
          overflow: hidden;
        }

        .nft-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .nft-card-studio:hover .nft-image {
          transform: scale(1.05);
        }

        .nft-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(11, 14, 20, 0.6);
        }

        .placeholder-icon {
          font-size: 3rem;
          color: #94A3B8;
        }

        .nft-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .nft-card-studio:hover .nft-overlay {
          opacity: 1;
        }

        .overlay-action {
          padding: 0.5rem 1rem;
          background: rgba(137, 90, 246, 0.9);
          border: 1px solid #895af6;
          border-radius: 6px;
          color: #ffffff;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'JetBrains Mono', monospace;
        }

        .overlay-action:hover {
          background: #895af6;
          box-shadow: 0 0 10px rgba(137, 90, 246, 0.4);
        }

        .nft-details {
          padding: 1.5rem;
        }

        .nft-header {
          margin-bottom: 1rem;
        }

        .nft-name {
          display: block;
          font-size: 1rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0.25rem;
        }

        .nft-collection {
          display: block;
          font-size: 0.8rem;
          color: #94A3B8;
          font-family: 'JetBrains Mono', monospace;
        }

        .nft-price {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding: 0.5rem;
          background: rgba(11, 14, 20, 0.6);
          border-radius: 6px;
        }

        .price-label {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #94A3B8;
          font-family: 'JetBrains Mono', monospace;
        }

        .price-value {
          font-size: 0.9rem;
          font-weight: 700;
          color: #06b6d4;
          font-family: 'JetBrains Mono', monospace;
        }

        .nft-stats {
          display: flex;
          gap: 1rem;
        }

        .stat {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .stat-label {
          font-size: 0.6rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #94A3B8;
          font-family: 'JetBrains Mono', monospace;
        }

        .stat-value {
          font-size: 0.8rem;
          font-weight: 700;
          color: #a855f7;
          font-family: 'JetBrains Mono', monospace;
        }

        /* Transactions Styles */
        .transactions-studio {
          position: relative;
          z-index: 1;
        }

        .filter-options {
          display: flex;
          gap: 1rem;
        }

        .filter-select {
          padding: 0.5rem 1rem;
          background: rgba(11, 14, 20, 0.6);
          border: 1px solid #2D3548;
          border-radius: 6px;
          color: #ffffff;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-family: 'JetBrains Mono', monospace;
        }

        .filter-select:focus {
          outline: none;
          border-color: #895af6;
          box-shadow: 0 0 10px rgba(137, 90, 246, 0.2);
        }

        .transactions-list-studio {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .transaction-card-studio {
          background: rgba(29, 35, 51, 0.9);
          border: 1px solid #2D3548;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .transaction-card-studio:hover {
          border-color: #895af6;
          box-shadow: 0 0 15px rgba(137, 90, 246, 0.2);
        }

        .tx-icon-container {
          width: 3rem;
          height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 1px solid #2D3548;
        }

        .tx-icon {
          font-size: 1.5rem;
        }

        .tx-icon.outgoing {
          color: #ef4444;
        }

        .tx-icon.incoming {
          color: #10b981;
        }

        .tx-details {
          flex: 1;
        }

        .tx-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .tx-type {
          font-size: 0.9rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #ffffff;
          font-family: 'JetBrains Mono', monospace;
        }

        .tx-hash {
          font-size: 0.8rem;
          color: #94A3B8;
          font-family: 'JetBrains Mono', monospace;
        }

        .tx-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .tx-time {
          font-size: 0.7rem;
          color: #94A3B8;
          font-family: 'JetBrains Mono', monospace;
        }

        .tx-addresses {
          display: flex;
          gap: 0.5rem;
        }

        .address-label {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #94A3B8;
          font-family: 'JetBrains Mono', monospace;
        }

        .address-value {
          font-size: 0.7rem;
          color: #06b6d4;
          font-family: 'JetBrains Mono', monospace;
        }

        .tx-amount-container {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.5rem;
        }

        .tx-amount {
          display: flex;
          align-items: baseline;
          gap: 0.25rem;
        }

        .amount-sign {
          font-size: 1rem;
          font-weight: 900;
        }

        .tx-amount.outgoing .amount-sign,
        .tx-amount.outgoing .amount-value {
          color: #ef4444;
        }

        .tx-amount.incoming .amount-sign,
        .tx-amount.incoming .amount-value {
          color: #10b981;
        }

        .amount-value {
          font-size: 1.2rem;
          font-weight: 900;
          font-family: 'JetBrains Mono', monospace;
        }

        .amount-currency {
          font-size: 0.8rem;
          color: #94A3B8;
          font-family: 'JetBrains Mono', monospace;
        }

        .tx-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-family: 'JetBrains Mono', monospace;
        }

        .tx-status.confirmed {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .tx-status.pending {
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        }

        .tx-status.failed {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .status-icon {
          font-size: 0.8rem;
        }

        .status-text {
          font-size: 0.6rem;
        }

        /* Empty State Styles */
        .empty-state-studio {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
          opacity: 0.5;
        }

        .empty-title {
          font-size: 1.2rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #ffffff;
          margin-bottom: 0.5rem;
          font-family: 'JetBrains Mono', monospace;
        }

        .empty-subtitle {
          font-size: 0.9rem;
          color: #94A3B8;
          margin-bottom: 2rem;
          max-width: 400px;
        }

        .empty-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .empty-action {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'JetBrains Mono', monospace;
          border: 1px solid;
        }

        .empty-action.primary {
          background: #895af6;
          border-color: #895af6;
          color: #ffffff;
        }

        .empty-action.primary:hover {
          background: #7c3aed;
          box-shadow: 0 0 20px rgba(137, 90, 246, 0.4);
        }

        .empty-action.secondary {
          background: transparent;
          border-color: #2D3548;
          color: #94A3B8;
        }

        .empty-action.secondary:hover {
          border-color: #895af6;
          color: #895af6;
          background: rgba(137, 90, 246, 0.1);
        }

        /* Error Banner Styles */
        .error-banner-studio {
          position: fixed;
          top: 1rem;
          right: 1rem;
          background: rgba(239, 68, 68, 0.9);
          border: 1px solid #ef4444;
          border-radius: 8px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          backdrop-filter: blur(10px);
          z-index: 1000;
          max-width: 400px;
        }

        .error-icon {
          font-size: 1.5rem;
          color: #ffffff;
        }

        .error-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .error-title {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #ffffff;
          font-family: 'JetBrains Mono', monospace;
        }

        .error-message {
          font-size: 0.9rem;
          color: #ffffff;
        }

        .error-dismiss {
          background: transparent;
          border: none;
          color: #ffffff;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: background 0.3s ease;
        }

        .error-dismiss:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .dashboard-studio-header {
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
          }

          .header-left,
          .header-right {
            width: 100%;
            justify-content: space-between;
          }

          .system-stats {
            display: none;
          }

          .dashboard-content-studio {
            padding: 1rem;
          }

          .tabs-container {
            overflow-x: auto;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          .tabs-container::-webkit-scrollbar {
            display: none;
          }

          .tab-studio {
            white-space: nowrap;
            min-width: fit-content;
          }

          .balance-card-studio {
            padding: 1.5rem;
          }

          .balance-amount {
            font-size: 2rem;
          }

          .usd-amount {
            font-size: 1.2rem;
          }

          .gas-options-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .stats-grid-studio {
            grid-template-columns: repeat(2, 1fr);
          }

          .tokens-grid-studio,
          .nfts-grid-studio {
            grid-template-columns: 1fr;
          }

          .transaction-card-studio {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .tx-amount-container {
            align-items: flex-start;
            width: 100%;
          }

          .wallet-options-grid {
            grid-template-columns: 1fr;
          }

          .connection-features {
            flex-direction: column;
            gap: 1rem;
          }
        }

        @media (max-width: 480px) {
          .balance-amount {
            font-size: 1.5rem;
          }

          .usd-amount {
            font-size: 1rem;
          }

          .stats-grid-studio {
            grid-template-columns: 1fr;
          }

          .gas-options-grid {
            grid-template-columns: 1fr;
          }

          .empty-actions {
            flex-direction: column;
            width: 100%;
          }

          .empty-action {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}

export default MetaMaskDashboard
