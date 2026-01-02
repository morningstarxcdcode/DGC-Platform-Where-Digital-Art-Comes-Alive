/**
 * Generate Page - AI Creation Studio
 * DGC Platform - Create Living NFTs
 * Author: Sourav Rajak
 */

import { useState, useRef } from 'react'
import { useWallet } from '../hooks/useWallet.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'

export default function GeneratePage() {
  const { isConnected, connectWallet } = useWallet()
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('realistic')
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generated, setGenerated] = useState(null)
  const [history, setHistory] = useState([])

  const styles = [
    { id: 'realistic', name: 'Realistic', icon: '📷', desc: 'Photo-realistic imagery' },
    { id: 'artistic', name: 'Artistic', icon: '🎨', desc: 'Artistic interpretation' },
    { id: 'abstract', name: 'Abstract', icon: '🌀', desc: 'Abstract patterns' },
    { id: 'anime', name: 'Anime', icon: '⭐', desc: 'Anime style art' },
    { id: 'cyberpunk', name: 'Cyberpunk', icon: '🌃', desc: 'Futuristic neon' },
    { id: '3d', name: '3D Render', icon: '🎮', desc: '3D rendered style' },
  ]

  const prompts = [
    'A cosmic nebula with swirling galaxies',
    'Futuristic city with neon lights',
    'Mystical forest with glowing creatures',
    'Abstract geometric patterns',
  ]

  const handleGenerate = async () => {
    if (!prompt) return
    
    setGenerating(true)
    setProgress(0)
    
    // Simulate generation progress
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval)
          setGenerating(false)
          const newNFT = {
            id: Date.now(),
            prompt,
            style,
            image: null,
            color: ['#8B5CF6', '#EC4899', '#06B6D4', '#F59E0B'][Math.floor(Math.random() * 4)]
          }
          setGenerated(newNFT)
          setHistory(prev => [newNFT, ...prev].slice(0, 6))
          return 100
        }
        return p + 5
      })
    }, 100)
  }

  return (
    <div className="generate-studio">
      <div className="studio-container">
        {/* Header */}
        <div className="studio-header">
          <div>
            <h1 className="studio-title">
              AI Creation <span className="gradient-text">Studio</span>
            </h1>
            <p className="studio-subtitle">Transform your imagination into living NFTs</p>
          </div>
          <div className="studio-actions">
            {!isConnected && (
              <Button variant="primary" onClick={connectWallet} icon="🔐">
                Connect Wallet
              </Button>
            )}
          </div>
        </div>

        {/* Main Grid */}
        <div className="studio-grid">
          {/* Left: Controls */}
          <div className="control-panel">
            <Card variant="default" hover={false}>
              <div className="panel-section">
                <h3 className="panel-title">Describe Your Vision</h3>
                <textarea
                  className="prompt-input"
                  placeholder="Describe what you want to create..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                />
                <div className="quick-prompts">
                  {prompts.map((p, i) => (
                    <button
                      key={i}
                      className="quick-prompt"
                      onClick={() => setPrompt(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="panel-section">
                <h3 className="panel-title">Choose Style</h3>
                <div className="style-grid">
                  {styles.map((s) => (
                    <button
                      key={s.id}
                      className={`style-card ${style === s.id ? 'active' : ''}`}
                      onClick={() => setStyle(s.id)}
                    >
                      <div className="style-icon">{s.icon}</div>
                      <div className="style-name">{s.name}</div>
                      <div className="style-desc">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="panel-section">
                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  loading={generating}
                  disabled={!prompt || generating}
                  onClick={handleGenerate}
                  icon="✨"
                >
                  {generating ? 'Generating...' : 'Generate NFT'}
                </Button>
              </div>
            </Card>

            {history.length > 0 && (
              <Card variant="default" hover={false} className="history-card">
                <h3 className="panel-title">Recent Creations</h3>
                <div className="history-grid">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      className="history-item"
                      onClick={() => setGenerated(item)}
                      style={{ background: `linear-gradient(135deg, ${item.color}40 0%, ${item.color}10 100%)` }}
                    >
                      <div className="history-icon">✨</div>
                      <div className="history-label">{item.prompt.slice(0, 30)}...</div>
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right: Preview */}
          <div className="preview-panel">
            <Card variant="default" hover={false} className="preview-card">
              <div className="preview-wrapper">
                {generating ? (
                  <div className="preview-generating">
                    <div className="gen-spinner"></div>
                    <div className="gen-text">Creating your masterpiece...</div>
                    <div className="gen-progress">
                      <div className="progress-bar" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="gen-percentage">{progress}%</div>
                  </div>
                ) : generated ? (
                  <div className="preview-result">
                    <div 
                      className="result-image"
                      style={{ background: `linear-gradient(135deg, ${generated.color}40 0%, ${generated.color}10 100%)` }}
                    >
                      <div className="result-placeholder">✨</div>
                      <div className="result-glow" style={{ background: generated.color }} />
                    </div>
                    <div className="result-meta">
                      <div className="meta-row">
                        <span className="meta-label">Prompt</span>
                        <span className="meta-value">{generated.prompt}</span>
                      </div>
                      <div className="meta-row">
                        <span className="meta-label">Style</span>
                        <span className="meta-value">{generated.style}</span>
                      </div>
                      <div className="meta-row">
                        <span className="meta-label">Created</span>
                        <span className="meta-value">{new Date(generated.id).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <div className="result-actions">
                      <Button variant="primary" fullWidth icon="⚡">
                        Mint as NFT
                      </Button>
                       <div className="action-row">
                        <Button variant="outline">Download</Button>
                        <Button variant="outline">Regenerate</Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="preview-empty">
                    <div className="empty-icon">🎨</div>
                    <div className="empty-title">Ready to Create?</div>
                    <div className="empty-desc">
                      Enter a prompt and choose a style to generate your unique NFT
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <style>{styleSheet}</style>
    </div>
  )
}

const styleSheet = `
  .generate-studio {
    min-height: 100vh;
    padding: 100px 0 60px;
    background: var(--bg-primary);
  }

  .studio-container {
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 clamp(1rem, 5vw, 2rem);
  }

  .studio-header {
    margin-bottom: 48px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 24px;
    flex-wrap: wrap;
  }

  .studio-title {
    font-family: var(--font-family-display);
    font-size: clamp(2.5rem, 5vw, 3.5rem);
    font-weight: 900;
    margin: 0 0 8px;
    letter-spacing: -0.02em;
  }

  .studio-subtitle {
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .studio-grid {
    display: grid;
    grid-template-columns: 450px 1fr;
    gap: 32px;
  }

  /* Control Panel */
  .control-panel {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .panel-section {
    margin-bottom: 32px;
  }

  .panel-section:last-child {
    margin-bottom: 0;
  }

  .panel-title {
    font-size: 1.2rem;
    font-weight: 700;
    margin: 0 0 16px;
  }

  .prompt-input {
    width: 100%;
    padding: 16px;
    background: rgba(255, 255, 255, 0.03);
    border: 2px solid var(--border-color);
    border-radius: 12px;
    color: var(--text-primary);
    font-family: var(--font-family);
    font-size: 15px;
    resize: none;
    outline: none;
    transition: all 0.2s;
    margin-bottom: 12px;
  }

  .prompt-input:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(137, 90, 246, 0.1);
    background: rgba(255, 255, 255, 0.05);
  }

  .quick-prompts {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .quick-prompt {
    padding: 12px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
  }

  .quick-prompt:hover {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-primary);
    border-color: var(--primary-color);
  }

  .style-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .style-card {
    padding: 16px;
    background: rgba(255, 255, 255, 0.02);
    border: 2px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
  }

  .style-card:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: var(--border-hover);
    transform: translateY(-2px);
  }

  .style-card.active {
    background: rgba(137, 90, 246, 0.1);
    border-color: var(--primary-color);
    box-shadow: var(--glow-primary);
  }

  .style-icon {
    font-size: 28px;
    margin-bottom: 8px;
  }

  .style-name {
    font-weight: 600;
    margin-bottom: 4px;
    font-size: 14px;
  }

  .style-desc {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  /* History */
  .history-card .card-content {
    padding: var(--spacing-lg);
  }

  .history-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .history-item {
    aspect-ratio: 1;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .history-item:hover {
    transform: scale(1.05);
    border-color: var(--primary-color);
  }

  .history-icon {
    font-size: 24px;
  }

  .history-label {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.6);
    text-align: center;
    padding: 0 4px;
  }

  /* Preview Panel */
  .preview-card {
    position: sticky;
    top: 100px;
  }

  .preview-card .card-content {
    padding: 0;
  }

  .preview-wrapper {
    min-height: 700px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .preview-empty {
    text-align: center;
    padding: 60px 40px;
  }

  .empty-icon {
    font-size: 80px;
    margin-bottom: 24px;
    opacity: 0.5;
  }

  .empty-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 12px;
  }

  .empty-desc {
    color: rgba(255, 255, 255, 0.5);
    max-width: 300px;
    margin: 0 auto;
  }

  .preview-generating {
    text-align: center;
    padding: 60px 40px;
  }

  .gen-spinner {
    width: 100px;
    height: 100px;
    margin: 0 auto 32px;
    border: 4px solid rgba(137, 90, 246, 0.1);
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: rotate 1s linear infinite;
  }

  .gen-text {
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 24px;
  }

  .gen-progress {
    width: 100%;
    height: 8px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 100px;
    overflow: hidden;
    margin-bottom: 16px;
  }

  .progress-bar {
    height: 100%;
    background: var(--gradient-primary);
    transition: width 0.3s;
    border-radius: 100px;
  }

  .gen-percentage {
    font-family: var(--font-family-display);
    font-size: 2rem;
    font-weight: 800;
    color: var(--primary-color);
  }

  .preview-result {
    width: 100%;
    padding: 32px;
  }

  .result-image {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 20px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 32px;
  }

  .result-placeholder {
    font-size: 100px;
    position: relative;
    z-index: 1;
  }

  .result-glow {
    position: absolute;
    inset: -50%;
    filter: blur(80px);
    opacity: 0.3;
    animation: pulse 3s ease-in-out infinite;
  }

  .result-meta {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
  }

  .meta-row {
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .meta-row:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .meta-row:first-child {
    padding-top: 0;
  }

  .meta-label {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
  }

  .meta-value {
    font-weight: 600;
    text-align: right;
  }

  .result-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .action-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  /* Responsive */
  @media (max-width: 1200px) {
    .studio-grid {
      grid-template-columns: 1fr;
    }

    .preview-card {
      position: static;
    }
  }

  @media (max-width: 640px) {
    .style-grid {
      grid-template-columns: 1fr;
    }

    .history-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
`
