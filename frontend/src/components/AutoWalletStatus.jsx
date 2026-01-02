import React, { useState } from 'react'
import { useWallet } from '../hooks/useWallet.jsx'

export default function AutoWalletStatus() {
  const { 
    isConnected, 
    address, 
    balance, 
    isAutoWallet, 
    autoWalletCreated,
    exportWallet,
    connect,
    error 
  } = useWallet()
  
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportData, setExportData] = useState(null)

  const handleExportWallet = async () => {
    try {
      const walletData = await exportWallet()
      setExportData(walletData)
      setShowExportModal(true)
    } catch (error) {
      console.error('Failed to export wallet:', error)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  if (!isConnected) {
    return (
      <div className="auto-wallet-status connecting">
        <div className="status-icon">⚡</div>
        <div className="status-text">
          <h3>Setting up your magical wallet...</h3>
          <p>No downloads, no complexity - just pure creativity!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="auto-wallet-status connected">
      <div className="wallet-info">
        <div className="status-header">
          <div className="status-icon">
            {isAutoWallet ? '🪄' : '🦊'}
          </div>
          <div className="wallet-type">
            {isAutoWallet ? 'Magic Wallet' : 'MetaMask Wallet'}
          </div>
        </div>
        
        <div className="wallet-details">
          <div className="address">
            <span className="label">Address:</span>
            <span className="value">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
            <button 
              className="copy-btn"
              onClick={() => copyToClipboard(address)}
              title="Copy address"
            >
              📋
            </button>
          </div>
          
          <div className="balance">
            <span className="label">Balance:</span>
            <span className="value">{parseFloat(balance || 0).toFixed(4)} ETH</span>
          </div>
        </div>

        {isAutoWallet && (
          <div className="auto-wallet-features">
            <div className="feature">
              <span className="feature-icon">🆓</span>
              <span className="feature-text">Free minting (we pay gas fees)</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🔒</span>
              <span className="feature-text">Secure & encrypted storage</span>
            </div>
            <div className="feature">
              <span className="feature-icon">📱</span>
              <span className="feature-text">Works on all devices</span>
            </div>
          </div>
        )}

        <div className="wallet-actions">
          {isAutoWallet && (
            <button 
              className="export-btn"
              onClick={handleExportWallet}
            >
              🔑 Export Wallet (Advanced)
            </button>
          )}
          
          {!isAutoWallet && (
            <button 
              className="switch-btn"
              onClick={() => window.location.reload()}
            >
              🪄 Switch to Magic Wallet
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="wallet-error">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{error}</span>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && exportData && (
        <div className="export-modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="export-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🔑 Export Your Wallet</h3>
              <button 
                className="close-btn"
                onClick={() => setShowExportModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-content">
              <div className="warning">
                <span className="warning-icon">⚠️</span>
                <p>Keep this information secure! Anyone with access can control your wallet.</p>
              </div>
              
              <div className="export-field">
                <label>Address:</label>
                <div className="field-value">
                  <span>{exportData.address}</span>
                  <button onClick={() => copyToClipboard(exportData.address)}>📋</button>
                </div>
              </div>
              
              <div className="export-field">
                <label>Private Key:</label>
                <div className="field-value">
                  <span className="private-key">{exportData.privateKey}</span>
                  <button onClick={() => copyToClipboard(exportData.privateKey)}>📋</button>
                </div>
              </div>
              
              {exportData.mnemonic && (
                <div className="export-field">
                  <label>Recovery Phrase:</label>
                  <div className="field-value">
                    <span className="mnemonic">{exportData.mnemonic}</span>
                    <button onClick={() => copyToClipboard(exportData.mnemonic)}>📋</button>
                  </div>
                </div>
              )}
              
              <div className="import-instructions">
                <h4>How to import into MetaMask:</h4>
                <ol>
                  <li>Open MetaMask</li>
                  <li>Click "Import Account"</li>
                  <li>Paste your private key</li>
                  <li>Your DGC wallet will be available in MetaMask</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .auto-wallet-status {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          padding: 20px;
          color: white;
          margin-bottom: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .auto-wallet-status.connecting {
          background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%);
          color: #2d3436;
          text-align: center;
        }

        .status-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .status-icon {
          font-size: 24px;
        }

        .wallet-type {
          font-size: 18px;
          font-weight: 600;
        }

        .wallet-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }

        .address, .balance {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .label {
          font-weight: 500;
          opacity: 0.8;
        }

        .value {
          font-family: 'Monaco', 'Menlo', monospace;
          background: rgba(255, 255, 255, 0.1);
          padding: 4px 8px;
          border-radius: 6px;
        }

        .copy-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          opacity: 0.7;
          transition: opacity 0.2s;
        }

        .copy-btn:hover {
          opacity: 1;
        }

        .auto-wallet-features {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }

        .feature {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .feature-icon {
          font-size: 16px;
        }

        .wallet-actions {
          display: flex;
          gap: 12px;
        }

        .export-btn, .switch-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .export-btn:hover, .switch-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        .wallet-error {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
          padding: 8px 12px;
          background: rgba(255, 0, 0, 0.1);
          border: 1px solid rgba(255, 0, 0, 0.3);
          border-radius: 6px;
          font-size: 14px;
        }

        .export-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .export-modal {
          background: white;
          border-radius: 16px;
          padding: 24px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          color: #2d3436;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid #ddd;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #666;
        }

        .warning {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .warning-icon {
          font-size: 20px;
        }

        .export-field {
          margin-bottom: 16px;
        }

        .export-field label {
          display: block;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .field-value {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f8f9fa;
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid #dee2e6;
        }

        .field-value span {
          flex: 1;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 12px;
          word-break: break-all;
        }

        .private-key, .mnemonic {
          color: #e74c3c;
          font-weight: 600;
        }

        .import-instructions {
          margin-top: 20px;
          padding: 16px;
          background: #e3f2fd;
          border-radius: 8px;
        }

        .import-instructions h4 {
          margin-bottom: 8px;
          color: #1976d2;
        }

        .import-instructions ol {
          margin: 0;
          padding-left: 20px;
        }

        .import-instructions li {
          margin-bottom: 4px;
        }

        @media (max-width: 768px) {
          .wallet-details {
            font-size: 14px;
          }
          
          .wallet-actions {
            flex-direction: column;
          }
          
          .export-modal {
            margin: 20px;
            width: calc(100% - 40px);
          }
        }
      `}</style>
    </div>
  )
}