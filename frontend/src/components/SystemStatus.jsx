import { useState, useEffect } from 'react'
import { useRealTimeData } from '../hooks/useWebSocket.jsx'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/**
 * System Status Component - Real-Time System Monitoring
 * 
 * Features:
 * - Live system health monitoring
 * - Real-time connection status
 * - Performance metrics display
 * - Service status indicators
 * - Network latency tracking
 * 
 * Validates: Real-Time Data Integration & User Experience Enhancement
 */

function SystemStatus({ compact = false, showDetails = true }) {
  const [systemStatus, setSystemStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  
  const {
    walletConnected,
    agentsConnected,
    searchConnected,
    isFullyConnected,
    hasAnyConnection
  } = useRealTimeData()

  const fetchSystemStatus = async () => {
    try {
      const startTime = Date.now()
      const response = await axios.get(`${API_BASE}/api/system/status`)
      const latency = Date.now() - startTime
      
      setSystemStatus({
        ...response.data,
        latency: `${latency}ms`
      })
      setLastUpdate(new Date())
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch system status:', error)
      setSystemStatus({
        status: 'error',
        error: 'Failed to connect to backend'
      })
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSystemStatus()
    const interval = setInterval(fetchSystemStatus, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className={`system-status ${compact ? 'compact' : ''}`}>
        <div className="status-loading">
          <div className="loading-spinner"></div>
          <span>Checking system status...</span>
        </div>
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational': return '#10b981'
      case 'degraded': return '#f59e0b'
      case 'error': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getConnectionStatus = () => {
    if (isFullyConnected) return { status: 'All Connected', color: '#10b981' }
    if (hasAnyConnection) return { status: 'Partial', color: '#f59e0b' }
    return { status: 'Disconnected', color: '#ef4444' }
  }

  const connectionStatus = getConnectionStatus()

  if (compact) {
    return (
      <div className="system-status compact">
        <div className="status-indicator">
          <div 
            className="status-dot"
            style={{ backgroundColor: getStatusColor(systemStatus?.status) }}
          ></div>
          <span className="status-text">
            {systemStatus?.status === 'operational' ? 'ONLINE' : 'ISSUES'}
          </span>
        </div>
        
        <div className="connection-indicator">
          <div 
            className="connection-dot"
            style={{ backgroundColor: connectionStatus.color }}
          ></div>
          <span className="connection-text">{connectionStatus.status}</span>
        </div>
        
        {systemStatus?.latency && (
          <div className="latency-indicator">
            <span className="latency-value">{systemStatus.latency}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="system-status detailed">
      <div className="status-header">
        <div className="header-left">
          <div className="status-icon">
            <div 
              className="status-dot large"
              style={{ backgroundColor: getStatusColor(systemStatus?.status) }}
            ></div>
          </div>
          <div className="status-info">
            <h3 className="status-title">SYSTEM STATUS</h3>
            <p className="status-subtitle">
              {systemStatus?.status === 'operational' ? 'All systems operational' : 'System issues detected'}
            </p>
          </div>
        </div>
        
        <div className="header-right">
          <button className="refresh-btn" onClick={fetchSystemStatus}>
            <span className="refresh-icon">🔄</span>
            <span className="refresh-text">REFRESH</span>
          </button>
        </div>
      </div>

      {showDetails && (
        <>
          {/* Real-Time Connections */}
          <div className="status-section">
            <h4 className="section-title">REAL-TIME CONNECTIONS</h4>
            <div className="connections-grid">
              <div className="connection-item">
                <div className="connection-header">
                  <span className="connection-icon">💰</span>
                  <span className="connection-name">Wallet Data</span>
                </div>
                <div className="connection-status">
                  <div 
                    className="connection-dot"
                    style={{ backgroundColor: walletConnected ? '#10b981' : '#ef4444' }}
                  ></div>
                  <span className="connection-text">
                    {walletConnected ? 'CONNECTED' : 'DISCONNECTED'}
                  </span>
                </div>
              </div>
              
              <div className="connection-item">
                <div className="connection-header">
                  <span className="connection-icon">🤖</span>
                  <span className="connection-name">AI Agents</span>
                </div>
                <div className="connection-status">
                  <div 
                    className="connection-dot"
                    style={{ backgroundColor: agentsConnected ? '#10b981' : '#ef4444' }}
                  ></div>
                  <span className="connection-text">
                    {agentsConnected ? 'CONNECTED' : 'DISCONNECTED'}
                  </span>
                </div>
              </div>
              
              <div className="connection-item">
                <div className="connection-header">
                  <span className="connection-icon">🔍</span>
                  <span className="connection-name">Search Engine</span>
                </div>
                <div className="connection-status">
                  <div 
                    className="connection-dot"
                    style={{ backgroundColor: searchConnected ? '#10b981' : '#ef4444' }}
                  ></div>
                  <span className="connection-text">
                    {searchConnected ? 'CONNECTED' : 'DISCONNECTED'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Service Status */}
          {systemStatus?.services && (
            <div className="status-section">
              <h4 className="section-title">BACKEND SERVICES</h4>
              <div className="services-grid">
                {Object.entries(systemStatus.services).map(([service, status]) => (
                  <div key={service} className="service-item">
                    <div className="service-header">
                      <span className="service-name">{service.replace('_', ' ').toUpperCase()}</span>
                    </div>
                    <div className="service-status">
                      <div 
                        className="service-dot"
                        style={{ backgroundColor: getStatusColor(status) }}
                      ></div>
                      <span className="service-text">{status.toUpperCase()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Metrics */}
          {systemStatus?.performance && (
            <div className="status-section">
              <h4 className="section-title">PERFORMANCE METRICS</h4>
              <div className="metrics-grid">
                <div className="metric-item">
                  <div className="metric-label">Response Time</div>
                  <div className="metric-value">{systemStatus.latency}</div>
                </div>
                <div className="metric-item">
                  <div className="metric-label">Uptime</div>
                  <div className="metric-value">{systemStatus.performance.uptime}</div>
                </div>
                <div className="metric-item">
                  <div className="metric-label">Memory Usage</div>
                  <div className="metric-value">{systemStatus.performance.memory_usage}</div>
                </div>
                <div className="metric-item">
                  <div className="metric-label">CPU Usage</div>
                  <div className="metric-value">{systemStatus.performance.cpu_usage}</div>
                </div>
              </div>
            </div>
          )}

          {/* Connection Statistics */}
          {systemStatus?.connections && (
            <div className="status-section">
              <h4 className="section-title">CONNECTION STATISTICS</h4>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value">{systemStatus.connections.total_connections}</div>
                  <div className="stat-label">Total Connections</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{systemStatus.connections.wallet_connections}</div>
                  <div className="stat-label">Wallet Streams</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{systemStatus.connections.agent_connections}</div>
                  <div className="stat-label">Agent Streams</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{systemStatus.connections.search_connections}</div>
                  <div className="stat-label">Search Streams</div>
                </div>
              </div>
            </div>
          )}

          {/* Last Update */}
          <div className="status-footer">
            <div className="update-info">
              <span className="update-label">Last Updated:</span>
              <span className="update-time">
                {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Never'}
              </span>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .system-status {
          background: rgba(29, 35, 51, 0.9);
          border: 1px solid #2D3548;
          border-radius: 12px;
          backdrop-filter: blur(10px);
          font-family: 'JetBrains Mono', monospace;
        }

        .system-status.compact {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1rem;
        }

        .system-status.detailed {
          padding: 1.5rem;
        }

        /* Compact Mode Styles */
        .status-indicator,
        .connection-indicator,
        .latency-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          position: relative;
        }

        .status-dot.large {
          width: 12px;
          height: 12px;
        }

        .status-dot::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border-radius: 50%;
          background: inherit;
          opacity: 0.3;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.5); opacity: 0.1; }
        }

        .status-text,
        .connection-text {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #ffffff;
        }

        .connection-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .latency-value {
          font-size: 0.8rem;
          font-weight: 700;
          color: #06b6d4;
        }

        /* Detailed Mode Styles */
        .status-header {
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

        .status-icon {
          width: 3rem;
          height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(137, 90, 246, 0.1);
          border-radius: 8px;
          border: 1px solid rgba(137, 90, 246, 0.2);
        }

        .status-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .status-title {
          font-size: 1.2rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #ffffff;
          margin: 0;
        }

        .status-subtitle {
          font-size: 0.8rem;
          color: #94A3B8;
          margin: 0;
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
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

        .refresh-btn:hover {
          border-color: #895af6;
          color: #895af6;
          background: rgba(137, 90, 246, 0.1);
        }

        .refresh-icon {
          font-size: 1rem;
        }

        .status-section {
          margin-bottom: 2rem;
        }

        .section-title {
          font-size: 0.9rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #895af6;
          margin: 0 0 1rem 0;
        }

        .connections-grid,
        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .connection-item,
        .service-item {
          background: rgba(11, 14, 20, 0.6);
          border: 1px solid #2D3548;
          border-radius: 8px;
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .connection-header,
        .service-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .connection-icon {
          font-size: 1.2rem;
        }

        .connection-name,
        .service-name {
          font-size: 0.8rem;
          font-weight: 600;
          color: #ffffff;
        }

        .connection-status,
        .service-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .service-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .service-text {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #ffffff;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .metric-item {
          background: rgba(11, 14, 20, 0.6);
          border: 1px solid #2D3548;
          border-radius: 8px;
          padding: 1rem;
          text-align: center;
        }

        .metric-label {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #94A3B8;
          margin-bottom: 0.5rem;
        }

        .metric-value {
          font-size: 1.2rem;
          font-weight: 900;
          color: #06b6d4;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
        }

        .stat-item {
          background: rgba(11, 14, 20, 0.6);
          border: 1px solid #2D3548;
          border-radius: 8px;
          padding: 1rem;
          text-align: center;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 900;
          color: #ffffff;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #94A3B8;
        }

        .status-footer {
          padding-top: 1rem;
          border-top: 1px solid #2D3548;
        }

        .update-info {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.7rem;
          color: #94A3B8;
        }

        .update-label {
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .update-time {
          color: #06b6d4;
        }

        /* Loading Styles */
        .status-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 2rem;
          color: #94A3B8;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #2D3548;
          border-top: 2px solid #895af6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .system-status.compact {
            flex-wrap: wrap;
            gap: 0.5rem;
          }

          .connections-grid,
          .services-grid {
            grid-template-columns: 1fr;
          }

          .metrics-grid,
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .status-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }
        }

        @media (max-width: 480px) {
          .metrics-grid,
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

export default SystemStatus