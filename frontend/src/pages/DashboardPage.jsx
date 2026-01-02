import { useState } from 'react'
import { useWallet } from '../hooks/useWallet.jsx'
import { useRealTimeData } from '../hooks/useWebSocket.jsx'
import MetaMaskDashboard from '../components/MetaMaskDashboard.jsx'
import AgentDashboard from '../components/AgentDashboard.jsx'
import BlockchainSearch from '../components/BlockchainSearch.jsx'
import SystemStatus from '../components/SystemStatus.jsx'
import PerformanceMonitor from '../components/PerformanceMonitor.jsx'

/**
 * Enhanced Dashboard Page - Real-Time Data Integration & User Experience
 * 
 * Comprehensive dashboard integrating:
 * - Real-time WebSocket data streams
 * - Live system performance monitoring
 * - Enhanced user experience with smooth transitions
 * - Systematic full enhancement across all components
 * - Professional studio design with neon accents
 * 
 * Validates: All three enhancement areas:
 * 1. Real-Time Data Integration
 * 2. User Experience Enhancement  
 * 3. Systematic Full Enhancement
 */

function DashboardPage() {
  const { isConnected, isAutoWallet, connect } = useWallet()
  const [activeSection, setActiveSection] = useState('overview')
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false)
  const [showSystemStatus, setShowSystemStatus] = useState(false)

  // Real-time data integration
  const {
    isFullyConnected,
    hasAnyConnection,
    walletConnected,
    agentsConnected,
    searchConnected
  } = useRealTimeData()

  const sections = [
    { 
      id: 'overview', 
      name: 'Overview', 
      icon: '📊', 
      description: 'Real-time wallet dashboard with live data',
      status: walletConnected ? 'live' : 'offline'
    },
    { 
      id: 'agents', 
      name: 'AI Agents', 
      icon: '🤖', 
      description: 'Multi-agent AI system with real-time execution',
      status: agentsConnected ? 'live' : 'offline'
    },
    { 
      id: 'search', 
      name: 'Search', 
      icon: '🔍', 
      description: 'Blockchain search with live updates',
      status: searchConnected ? 'live' : 'offline'
    },
    { 
      id: 'performance', 
      name: 'Performance', 
      icon: '⚡', 
      description: 'Real-time system performance monitoring',
      status: 'active'
    }
  ]

  const getConnectionStatusColor = () => {
    if (isFullyConnected) return '#10b981'
    if (hasAnyConnection) return '#f59e0b'
    return '#ef4444'
  }

  const getConnectionStatusText = () => {
    if (isFullyConnected) return 'FULL SYNC'
    if (hasAnyConnection) return 'PARTIAL SYNC'
    return 'OFFLINE'
  }

  return (
    <div className="enhanced-dashboard-page">
      {/* Enhanced Page Header */}
      <div className="page-header-enhanced">
        <div className="header-content">
          <div className="header-left">
            <div className="title-section">
              <h1 className="page-title">🌟 ADVANCED DASHBOARD</h1>
              <p className="page-subtitle">
                Real-time blockchain data integration with professional monitoring
              </p>
            </div>
            
            <div className="connection-status">
              <div 
                className="status-indicator"
                style={{ backgroundColor: getConnectionStatusColor() }}
              ></div>
              <span className="status-text">{getConnectionStatusText()}</span>
              <span className="connection-count">
                ({[walletConnected, agentsConnected, searchConnected].filter(Boolean).length}/3)
              </span>
            </div>
          </div>
          
          <div className="header-right">
            <div className="header-controls">
              <button 
                className={`control-btn ${showSystemStatus ? 'active' : ''}`}
                onClick={() => setShowSystemStatus(!showSystemStatus)}
              >
                <span className="btn-icon">🔧</span>
                <span className="btn-text">SYSTEM</span>
              </button>
              
              <button 
                className={`control-btn ${showPerformanceMonitor ? 'active' : ''}`}
                onClick={() => setShowPerformanceMonitor(!showPerformanceMonitor)}
              >
                <span className="btn-icon">📊</span>
                <span className="btn-text">PERFORMANCE</span>
              </button>
              
              {!isConnected && (
                <button className="control-btn connect" onClick={connect}>
                  <span className="btn-icon">🔗</span>
                  <span className="btn-text">CONNECT</span>
                </button>
              )}
            </div>
            
            <div className="live-indicators">
              <PerformanceMonitor compact={true} />
            </div>
          </div>
        </div>
        
        {/* System Status Panel */}
        {showSystemStatus && (
          <div className="status-panel">
            <SystemStatus compact={false} showDetails={true} />
          </div>
        )}
        
        {/* Performance Monitor Panel */}
        {showPerformanceMonitor && (
          <div className="performance-panel">
            <PerformanceMonitor compact={false} />
          </div>
        )}
      </div>

      {/* Enhanced Section Navigation */}
      <div className="section-nav-enhanced">
        <div className="nav-container">
          {sections.map(section => (
            <button
              key={section.id}
              className={`section-btn-enhanced ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <div className="btn-content">
                <div className="btn-header">
                  <span className="section-icon">{section.icon}</span>
                  <div className="section-info">
                    <span className="section-name">{section.name}</span>
                    <span className="section-desc">{section.description}</span>
                  </div>
                </div>
                
                <div className="btn-footer">
                  <div className={`section-status ${section.status}`}>
                    <div className="status-dot"></div>
                    <span className="status-label">{section.status.toUpperCase()}</span>
                  </div>
                </div>
              </div>
              
              <div className="btn-indicator"></div>
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Section Content */}
      <div className="section-content-enhanced">
        {activeSection === 'overview' && (
          <div className="content-wrapper">
            <MetaMaskDashboard />
          </div>
        )}

        {activeSection === 'agents' && (
          <div className="content-wrapper">
            <AgentDashboard />
          </div>
        )}

        {activeSection === 'search' && (
          <div className="content-wrapper">
            <BlockchainSearch 
              onResultSelect={(type, data) => {
                console.log('Selected:', type, data)
                // Handle result selection - could navigate or show modal
              }}
            />
          </div>
        )}

        {activeSection === 'performance' && (
          <div className="content-wrapper">
            <PerformanceMonitor compact={false} />
          </div>
        )}
      </div>

      {/* Enhanced Styles */}
      <style jsx>{`
        .enhanced-dashboard-page {
          background: linear-gradient(135deg, #0B0E14 0%, #161B28 100%);
          min-height: 100vh;
          color: #ffffff;
          font-family: 'Inter', sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        .enhanced-dashboard-page::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            linear-gradient(rgba(137, 90, 246, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(137, 90, 246, 0.03) 1px, transparent 1px);
          background-size: 20px 20px;
          pointer-events: none;
        }

        /* Enhanced Page Header */
        .page-header-enhanced {
          background: rgba(29, 35, 51, 0.95);
          border-bottom: 1px solid #2D3548;
          backdrop-filter: blur(20px);
          position: relative;
          z-index: 100;
        }

        .page-header-enhanced::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, #895af6 50%, transparent 100%);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .title-section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .page-title {
          font-size: 2.5rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin: 0;
          background: linear-gradient(135deg, #ffffff 0%, #895af6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 20px rgba(137, 90, 246, 0.3));
        }

        .page-subtitle {
          font-size: 1rem;
          color: #94A3B8;
          font-family: 'JetBrains Mono', monospace;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0;
        }

        .connection-status {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.25rem;
          background: rgba(11, 14, 20, 0.6);
          border: 1px solid #2D3548;
          border-radius: 25px;
          backdrop-filter: blur(10px);
        }

        .status-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          position: relative;
        }

        .status-indicator::before {
          content: '';
          position: absolute;
          top: -3px;
          left: -3px;
          right: -3px;
          bottom: -3px;
          border-radius: 50%;
          background: inherit;
          opacity: 0.3;
          animation: pulse 2s infinite;
        }

        .status-text {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #ffffff;
          font-family: 'JetBrains Mono', monospace;
        }

        .connection-count {
          font-size: 0.7rem;
          color: #94A3B8;
          font-family: 'JetBrains Mono', monospace;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .header-controls {
          display: flex;
          gap: 1rem;
        }

        .control-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: rgba(11, 14, 20, 0.6);
          border: 1px solid #2D3548;
          border-radius: 8px;
          color: #94A3B8;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'JetBrains Mono', monospace;
        }

        .control-btn:hover {
          border-color: #895af6;
          color: #895af6;
          background: rgba(137, 90, 246, 0.1);
          box-shadow: 0 0 15px rgba(137, 90, 246, 0.2);
        }

        .control-btn.active {
          border-color: #06b6d4;
          color: #06b6d4;
          background: rgba(6, 182, 212, 0.1);
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.2);
        }

        .control-btn.connect {
          border-color: #10b981;
          color: #10b981;
        }

        .control-btn.connect:hover {
          background: rgba(16, 185, 129, 0.1);
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);
        }

        .btn-icon {
          font-size: 1rem;
        }

        .btn-text {
          font-size: 0.7rem;
        }

        .live-indicators {
          display: flex;
          align-items: center;
        }

        .status-panel,
        .performance-panel {
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

        /* Enhanced Section Navigation */
        .section-nav-enhanced {
          padding: 0 2rem 2rem 2rem;
          position: relative;
          z-index: 10;
        }

        .nav-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .section-btn-enhanced {
          background: rgba(29, 35, 51, 0.9);
          border: 1px solid #2D3548;
          border-radius: 12px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(10px);
        }

        .section-btn-enhanced:hover {
          border-color: #895af6;
          box-shadow: 0 0 25px rgba(137, 90, 246, 0.2);
          transform: translateY(-2px);
        }

        .section-btn-enhanced.active {
          border-color: #895af6;
          background: rgba(137, 90, 246, 0.1);
          box-shadow: 0 0 30px rgba(137, 90, 246, 0.3);
          transform: translateY(-2px);
        }

        .section-btn-enhanced.active .btn-indicator {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #895af6 0%, #06b6d4 100%);
        }

        .btn-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .btn-header {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .section-icon {
          font-size: 2rem;
          width: 3rem;
          height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(137, 90, 246, 0.1);
          border-radius: 8px;
          border: 1px solid rgba(137, 90, 246, 0.2);
          flex-shrink: 0;
        }

        .section-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .section-name {
          font-size: 1.2rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #ffffff;
        }

        .section-desc {
          font-size: 0.85rem;
          color: #94A3B8;
          line-height: 1.4;
        }

        .btn-footer {
          display: flex;
          justify-content: flex-end;
        }

        .section-status {
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

        .section-status.live {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .section-status.offline {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .section-status.active {
          background: rgba(6, 182, 212, 0.1);
          border: 1px solid rgba(6, 182, 212, 0.2);
          color: #06b6d4;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
          animation: pulse 2s infinite;
        }

        .status-label {
          font-size: 0.6rem;
        }

        /* Enhanced Section Content */
        .section-content-enhanced {
          padding: 0 2rem 2rem 2rem;
          position: relative;
          z-index: 1;
        }

        .content-wrapper {
          max-width: 1400px;
          margin: 0 auto;
          background: rgba(11, 14, 20, 0.4);
          border-radius: 16px;
          overflow: hidden;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(45, 53, 72, 0.5);
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .header-content {
            flex-direction: column;
            gap: 1.5rem;
            align-items: flex-start;
          }

          .header-right {
            width: 100%;
            justify-content: space-between;
          }

          .nav-container {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .page-title {
            font-size: 2rem;
          }

          .header-content {
            padding: 1.5rem;
          }

          .section-nav-enhanced {
            padding: 0 1rem 1.5rem 1rem;
          }

          .section-content-enhanced {
            padding: 0 1rem 1.5rem 1rem;
          }

          .nav-container {
            grid-template-columns: 1fr;
          }

          .header-controls {
            flex-wrap: wrap;
            gap: 0.5rem;
          }

          .live-indicators {
            width: 100%;
            justify-content: center;
          }

          .status-panel,
          .performance-panel {
            margin: 0 1rem 1.5rem 1rem;
          }
        }

        @media (max-width: 480px) {
          .page-title {
            font-size: 1.5rem;
          }

          .btn-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 0.75rem;
          }

          .section-info {
            align-items: center;
          }

          .connection-status {
            flex-wrap: wrap;
            justify-content: center;
          }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
        }
      `}</style>
    </div>
  )
}

export default DashboardPage
