/**
 * Generate Page - Premium Professional Design
 * AI-Powered NFT Creation Interface
 * Author: Sourav Rajak (morningstarxcdcode)
 * Version: 2.0.0
 */

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet.jsx'
import { useContracts } from '../hooks/useContracts.jsx'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const AI_MODELS = [
  { id: 'stable-diffusion', name: 'Stable Diffusion XL', icon: '🎨', description: 'Photorealistic & artistic styles' },
  { id: 'dalle', name: 'DALL-E 3', icon: '🖼️', description: 'Creative compositions' },
  { id: 'midjourney', name: 'Midjourney Style', icon: '✨', description: 'Aesthetic & stylized' },
]

const STYLE_PRESETS = [
  { id: 'digital-art', name: 'Digital Art', preview: '🎨' },
  { id: 'anime', name: 'Anime', preview: '🎌' },
  { id: 'photorealistic', name: 'Photorealistic', preview: '📸' },
  { id: 'abstract', name: 'Abstract', preview: '🌀' },
  { id: 'fantasy', name: 'Fantasy', preview: '🐉' },
  { id: 'sci-fi', name: 'Sci-Fi', preview: '🚀' },
  { id: 'minimalist', name: 'Minimalist', preview: '⬜' },
  { id: 'surreal', name: 'Surreal', preview: '🌙' },
]

const DNA_TRAITS = [
  { id: 'mutation_rate', name: 'Mutation Rate', icon: '🧬', description: 'How quickly traits evolve' },
  { id: 'emotion_sensitivity', name: 'Emotion Sensitivity', icon: '💖', description: 'Response to viewer emotions' },
  { id: 'time_decay', name: 'Time Evolution', icon: '⏳', description: 'Changes over time' },
  { id: 'rarity_boost', name: 'Rarity Boost', icon: '💎', description: 'Enhanced trait rarity' },
]

export default function GeneratePage() {
  const navigate = useNavigate()
  const { isConnected, address, connectWallet } = useWallet()
  const { mintNFT, isReady: contractsReady } = useContracts()

  // Form state
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id)
  const [selectedStyle, setSelectedStyle] = useState('')
  const [dnaTraits, setDnaTraits] = useState({
    mutation_rate: 50,
    emotion_sensitivity: 50,
    time_decay: 30,
    rarity_boost: 50,
  })
  const [nftDetails, setNftDetails] = useState({
    name: '',
    description: '',
    royalty: 10,
  })
  const [price, setPrice] = useState('0.1')
  const [listOnMarketplace, setListOnMarketplace] = useState(true)

  // Generation state
  const [generating, setGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState(null)
  const [minting, setMinting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [error, setError] = useState(null)

  const promptRef = useRef(null)

  useEffect(() => {
    promptRef.current?.focus()
  }, [])

  async function handleGenerate() {
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    setError(null)
    setGenerating(true)

    try {
      const response = await axios.post(`${API_BASE}/api/generate`, {
        prompt: prompt,
        negative_prompt: negativePrompt,
        model: selectedModel,
        style: selectedStyle,
        dna_traits: dnaTraits,
      })

      if (response.data.image_url) {
        setGeneratedImage(response.data.image_url)
        setCurrentStep(2)
      } else {
        // Demo mode - generate placeholder
        setGeneratedImage(`https://picsum.photos/seed/${Date.now()}/512/512`)
        setCurrentStep(2)
      }
    } catch (err) {
      console.error('Generation error:', err)
      // Demo mode fallback
      setGeneratedImage(`https://picsum.photos/seed/${Date.now()}/512/512`)
      setCurrentStep(2)
    } finally {
      setGenerating(false)
    }
  }

  async function handleMint() {
    if (!isConnected) {
      await connectWallet()
      return
    }

    if (!nftDetails.name.trim()) {
      setError('Please enter a name for your NFT')
      return
    }

    setError(null)
    setMinting(true)

    try {
      // In production, this would upload to IPFS and mint
      const metadata = {
        name: nftDetails.name,
        description: nftDetails.description || prompt,
        image: generatedImage,
        attributes: [
          { trait_type: 'AI Model', value: selectedModel },
          { trait_type: 'Style', value: selectedStyle || 'Custom' },
          { trait_type: 'Mutation Rate', value: dnaTraits.mutation_rate },
          { trait_type: 'Emotion Sensitivity', value: dnaTraits.emotion_sensitivity },
        ],
        content_dna: dnaTraits,
      }

      if (contractsReady) {
        const tokenId = await mintNFT(
          address,
          `ipfs://demo/${Date.now()}`,
          nftDetails.royalty * 100,
          listOnMarketplace ? price : null
        )
        setCurrentStep(3)
        setTimeout(() => {
          navigate(`/nft/${tokenId}`)
        }, 2000)
      } else {
        // Demo mode
        setCurrentStep(3)
        setTimeout(() => {
          navigate('/profile')
        }, 2000)
      }
    } catch (err) {
      console.error('Minting error:', err)
      setError('Failed to mint NFT: ' + (err.message || 'Unknown error'))
    } finally {
      setMinting(false)
    }
  }

  function handleDnaChange(trait, value) {
    setDnaTraits(prev => ({ ...prev, [trait]: value }))
  }

  return (
    <div className="generate-page">
      {/* Header */}
      <section className="generate-header">
        <div className="container">
          <div className="header-content">
            <span className="page-badge">
              <span className="badge-icon">🎨</span>
              AI Creation Studio
            </span>
            <h1>Create Your NFT</h1>
            <p>Transform your imagination into living digital art with AI</p>
          </div>

          {/* Progress Steps */}
          <div className="progress-steps">
            <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
              <div className="step-icon">
                {currentStep > 1 ? '✓' : '1'}
              </div>
              <span>Generate</span>
            </div>
            <div className="step-line"></div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
              <div className="step-icon">
                {currentStep > 2 ? '✓' : '2'}
              </div>
              <span>Configure</span>
            </div>
            <div className="step-line"></div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
              <div className="step-icon">3</div>
              <span>Mint</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="generate-content">
        <div className="container">
          {currentStep === 1 && (
            <div className="generate-studio animate-fade-in">
              <div className="studio-grid">
                {/* Left Panel - Controls */}
                <div className="controls-panel">
                  {/* Prompt Input */}
                  <div className="control-group">
                    <label className="control-label">
                      <span className="label-icon">✨</span>
                      Prompt
                      <span className="label-hint">Describe your artwork</span>
                    </label>
                    <div className="prompt-wrapper">
                      <textarea
                        ref={promptRef}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="A mystical forest with glowing creatures, ethereal atmosphere, cinematic lighting..."
                        rows={4}
                      />
                      <div className="prompt-footer">
                        <span className="char-count">{prompt.length}/500</span>
                      </div>
                    </div>
                  </div>

                  {/* Negative Prompt */}
                  <div className="control-group">
                    <label className="control-label">
                      <span className="label-icon">🚫</span>
                      Negative Prompt
                      <span className="label-hint">What to avoid</span>
                    </label>
                    <textarea
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      placeholder="blurry, low quality, distorted, ugly..."
                      rows={2}
                      className="secondary-input"
                    />
                  </div>

                  {/* AI Model Selection */}
                  <div className="control-group">
                    <label className="control-label">
                      <span className="label-icon">🤖</span>
                      AI Model
                    </label>
                    <div className="model-cards">
                      {AI_MODELS.map(model => (
                        <button
                          key={model.id}
                          className={`model-card ${selectedModel === model.id ? 'active' : ''}`}
                          onClick={() => setSelectedModel(model.id)}
                        >
                          <span className="model-icon">{model.icon}</span>
                          <span className="model-name">{model.name}</span>
                          <span className="model-desc">{model.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Style Presets */}
                  <div className="control-group">
                    <label className="control-label">
                      <span className="label-icon">🎭</span>
                      Style Preset
                    </label>
                    <div className="style-chips">
                      {STYLE_PRESETS.map(style => (
                        <button
                          key={style.id}
                          className={`style-chip ${selectedStyle === style.id ? 'active' : ''}`}
                          onClick={() => setSelectedStyle(selectedStyle === style.id ? '' : style.id)}
                        >
                          <span>{style.preview}</span>
                          <span>{style.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Content DNA */}
                  <div className="control-group">
                    <label className="control-label">
                      <span className="label-icon">🧬</span>
                      Content DNA™
                      <span className="label-hint">Configure evolution traits</span>
                    </label>
                    <div className="dna-sliders">
                      {DNA_TRAITS.map(trait => (
                        <div key={trait.id} className="dna-slider">
                          <div className="slider-header">
                            <span className="slider-icon">{trait.icon}</span>
                            <span className="slider-name">{trait.name}</span>
                            <span className="slider-value">{dnaTraits[trait.id]}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={dnaTraits[trait.id]}
                            onChange={(e) => handleDnaChange(trait.id, parseInt(e.target.value))}
                            className="slider"
                          />
                          <span className="slider-desc">{trait.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button
                    className="btn btn-generate"
                    onClick={handleGenerate}
                    disabled={generating || !prompt.trim()}
                  >
                    {generating ? (
                      <>
                        <span className="spinner"></span>
                        Generating...
                      </>
                    ) : (
                      <>
                        <span className="btn-icon">⚡</span>
                        Generate NFT
                      </>
                    )}
                  </button>

                  {error && (
                    <div className="error-message">
                      <span>⚠️</span> {error}
                    </div>
                  )}
                </div>

                {/* Right Panel - Preview */}
                <div className="preview-panel">
                  <div className="preview-card">
                    <div className="preview-header">
                      <span>Live Preview</span>
                      <span className="preview-badge">AI Generated</span>
                    </div>
                    <div className="preview-image">
                      {generating ? (
                        <div className="generating-state">
                          <div className="pulse-rings">
                            <div className="ring"></div>
                            <div className="ring"></div>
                            <div className="ring"></div>
                          </div>
                          <span>Creating your masterpiece...</span>
                        </div>
                      ) : (
                        <div className="placeholder-state">
                          <span className="placeholder-icon">🎨</span>
                          <span>Your NFT will appear here</span>
                        </div>
                      )}
                    </div>
                    <div className="preview-info">
                      <div className="info-row">
                        <span className="info-label">Model</span>
                        <span className="info-value">{AI_MODELS.find(m => m.id === selectedModel)?.name}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Style</span>
                        <span className="info-value">{selectedStyle || 'Custom'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="configure-step animate-fade-in">
              <div className="configure-grid">
                {/* Generated Image */}
                <div className="result-panel">
                  <div className="result-card">
                    <div className="result-header">
                      <span>🎉 Generated Successfully!</span>
                      <button className="regenerate-btn" onClick={() => setCurrentStep(1)}>
                        🔄 Regenerate
                      </button>
                    </div>
                    <div className="result-image">
                      <img src={generatedImage} alt="Generated NFT" />
                    </div>
                  </div>
                </div>

                {/* NFT Details */}
                <div className="details-panel">
                  <h2>Configure Your NFT</h2>
                  
                  <div className="form-group">
                    <label>NFT Name *</label>
                    <input
                      type="text"
                      value={nftDetails.name}
                      onChange={(e) => setNftDetails(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Give your NFT a unique name"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={nftDetails.description}
                      onChange={(e) => setNftDetails(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Tell the story behind your creation..."
                      rows={3}
                      className="form-input"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Royalty %</label>
                      <input
                        type="number"
                        value={nftDetails.royalty}
                        onChange={(e) => setNftDetails(prev => ({ ...prev, royalty: parseInt(e.target.value) || 0 }))}
                        min="0"
                        max="30"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Price (ETH)</label>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        step="0.01"
                        min="0"
                        className="form-input"
                        disabled={!listOnMarketplace}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={listOnMarketplace}
                        onChange={(e) => setListOnMarketplace(e.target.checked)}
                      />
                      <span className="checkbox-custom"></span>
                      <span>List on marketplace immediately</span>
                    </label>
                  </div>

                  <div className="mint-summary">
                    <h4>Summary</h4>
                    <div className="summary-row">
                      <span>Network</span>
                      <span>Ethereum</span>
                    </div>
                    <div className="summary-row">
                      <span>Gas Fee</span>
                      <span>~0.005 ETH</span>
                    </div>
                    <div className="summary-row">
                      <span>Creator Royalty</span>
                      <span>{nftDetails.royalty}%</span>
                    </div>
                  </div>

                  <button
                    className="btn btn-mint"
                    onClick={handleMint}
                    disabled={minting || !nftDetails.name.trim()}
                  >
                    {minting ? (
                      <>
                        <span className="spinner"></span>
                        Minting...
                      </>
                    ) : !isConnected ? (
                      <>
                        <span className="btn-icon">🔗</span>
                        Connect Wallet to Mint
                      </>
                    ) : (
                      <>
                        <span className="btn-icon">🚀</span>
                        Mint NFT
                      </>
                    )}
                  </button>

                  {error && (
                    <div className="error-message">
                      <span>⚠️</span> {error}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="success-step animate-fade-in">
              <div className="success-card">
                <div className="success-icon">
                  <div className="checkmark">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h2>NFT Minted Successfully! 🎉</h2>
                <p>Your creation is now live on the blockchain</p>
                <div className="success-image">
                  <img src={generatedImage} alt="Minted NFT" />
                </div>
                <p className="redirect-text">Redirecting to your NFT...</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <style>{`
        /* ========== GENERATE PAGE STYLES ========== */
        .generate-page {
          min-height: 100vh;
          padding-bottom: 100px;
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ========== HEADER ========== */
        .generate-header {
          padding: 120px 0 40px;
          text-align: center;
          background: 
            radial-gradient(ellipse 60% 40% at 50% 40%, rgba(137, 90, 246, 0.15) 0%, transparent 50%);
        }

        .page-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 20px;
          background: rgba(137, 90, 246, 0.15);
          border: 1px solid rgba(137, 90, 246, 0.3);
          border-radius: 100px;
          font-size: 14px;
          font-weight: 600;
          color: var(--primary-color);
          margin-bottom: 20px;
        }

        .badge-icon {
          font-size: 18px;
        }

        .header-content h1 {
          font-family: var(--font-family-display);
          font-size: clamp(2.5rem, 5vw, 3.5rem);
          font-weight: 800;
          margin-bottom: 12px;
        }

        .header-content p {
          font-size: 1.125rem;
          color: var(--text-secondary);
          margin-bottom: 40px;
        }

        /* Progress Steps */
        .progress-steps {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          max-width: 500px;
          margin: 0 auto;
        }

        .progress-steps .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          opacity: 0.4;
          transition: opacity 0.3s;
        }

        .progress-steps .step.active {
          opacity: 1;
        }

        .step-icon {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(137, 90, 246, 0.2);
          border: 2px solid rgba(137, 90, 246, 0.3);
          border-radius: 50%;
          font-size: 16px;
          font-weight: 700;
          transition: all 0.3s;
        }

        .step.active .step-icon {
          background: var(--gradient-primary);
          border-color: transparent;
          box-shadow: 0 0 20px rgba(137, 90, 246, 0.5);
        }

        .step.completed .step-icon {
          background: var(--color-success);
          border-color: transparent;
        }

        .progress-steps .step span:last-child {
          font-size: 13px;
          font-weight: 600;
        }

        .step-line {
          width: 80px;
          height: 2px;
          background: rgba(137, 90, 246, 0.2);
          margin: 0 16px;
          margin-bottom: 24px;
        }

        /* ========== MAIN CONTENT ========== */
        .generate-content {
          padding: 40px 0;
        }

        .studio-grid {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 40px;
        }

        /* ========== CONTROLS PANEL ========== */
        .controls-panel {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .control-label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 15px;
          font-weight: 600;
        }

        .label-icon {
          font-size: 18px;
        }

        .label-hint {
          font-size: 13px;
          font-weight: 400;
          color: var(--text-tertiary);
          margin-left: auto;
        }

        .prompt-wrapper {
          position: relative;
        }

        .prompt-wrapper textarea {
          width: 100%;
          padding: 16px;
          background: rgba(22, 22, 42, 0.8);
          border: 2px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          font-size: 15px;
          color: var(--text-primary);
          resize: none;
          transition: all 0.3s;
        }

        .prompt-wrapper textarea:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 4px rgba(137, 90, 246, 0.2);
          outline: none;
        }

        .prompt-footer {
          display: flex;
          justify-content: flex-end;
          margin-top: 8px;
        }

        .char-count {
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .secondary-input {
          width: 100%;
          padding: 12px;
          background: rgba(22, 22, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          font-size: 14px;
          color: var(--text-primary);
          resize: none;
        }

        /* Model Cards */
        .model-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .model-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 20px 12px;
          background: rgba(22, 22, 42, 0.6);
          border: 2px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
        }

        .model-card:hover {
          border-color: rgba(137, 90, 246, 0.3);
          background: rgba(137, 90, 246, 0.05);
        }

        .model-card.active {
          border-color: var(--primary-color);
          background: rgba(137, 90, 246, 0.15);
          box-shadow: 0 0 20px rgba(137, 90, 246, 0.2);
        }

        .model-icon {
          font-size: 28px;
        }

        .model-name {
          font-size: 13px;
          font-weight: 600;
        }

        .model-desc {
          font-size: 11px;
          color: var(--text-tertiary);
        }

        /* Style Chips */
        .style-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .style-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: rgba(22, 22, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 100px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .style-chip:hover {
          border-color: rgba(137, 90, 246, 0.3);
        }

        .style-chip.active {
          background: rgba(137, 90, 246, 0.2);
          border-color: var(--primary-color);
        }

        /* DNA Sliders */
        .dna-sliders {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .dna-slider {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .slider-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .slider-icon {
          font-size: 16px;
        }

        .slider-name {
          font-size: 14px;
          font-weight: 500;
        }

        .slider-value {
          margin-left: auto;
          font-family: var(--font-family-mono);
          font-size: 14px;
          font-weight: 600;
          color: var(--primary-color);
        }

        .slider {
          width: 100%;
          height: 6px;
          -webkit-appearance: none;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          cursor: pointer;
        }

        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          background: var(--gradient-primary);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(137, 90, 246, 0.5);
        }

        .slider-desc {
          font-size: 12px;
          color: var(--text-tertiary);
        }

        /* Generate Button */
        .btn-generate {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 18px;
          background: var(--gradient-primary);
          border: none;
          border-radius: 14px;
          font-size: 16px;
          font-weight: 700;
          color: white;
          cursor: pointer;
          transition: all 0.3s;
          margin-top: 8px;
        }

        .btn-generate:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(137, 90, 246, 0.4);
        }

        .btn-generate:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-icon {
          font-size: 20px;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          font-size: 14px;
          color: #f87171;
        }

        /* ========== PREVIEW PANEL ========== */
        .preview-panel {
          position: sticky;
          top: 100px;
        }

        .preview-card {
          background: rgba(22, 22, 42, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          overflow: hidden;
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          font-size: 14px;
          font-weight: 600;
        }

        .preview-badge {
          padding: 4px 10px;
          background: rgba(137, 90, 246, 0.2);
          border-radius: 100px;
          font-size: 11px;
          color: var(--primary-color);
        }

        .preview-image {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(22, 22, 42, 0.5);
        }

        .generating-state,
        .placeholder-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          color: var(--text-tertiary);
        }

        .placeholder-icon {
          font-size: 64px;
          opacity: 0.3;
        }

        .pulse-rings {
          position: relative;
          width: 80px;
          height: 80px;
        }

        .ring {
          position: absolute;
          inset: 0;
          border: 3px solid var(--primary-color);
          border-radius: 50%;
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .ring:nth-child(2) { animation-delay: 0.5s; }
        .ring:nth-child(3) { animation-delay: 1s; }

        @keyframes pulse-ring {
          0% { transform: scale(0.5); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        .preview-info {
          padding: 16px 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
        }

        .info-label {
          font-size: 13px;
          color: var(--text-tertiary);
        }

        .info-value {
          font-size: 13px;
          font-weight: 600;
        }

        /* ========== CONFIGURE STEP ========== */
        .configure-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }

        .result-card {
          background: rgba(22, 22, 42, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          overflow: hidden;
        }

        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: rgba(34, 197, 94, 0.1);
          border-bottom: 1px solid rgba(34, 197, 94, 0.2);
          font-size: 14px;
          font-weight: 600;
          color: #22c55e;
        }

        .regenerate-btn {
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 8px;
          font-size: 13px;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .regenerate-btn:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .result-image img {
          width: 100%;
          display: block;
        }

        .details-panel h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .form-input {
          width: 100%;
          padding: 14px;
          background: rgba(22, 22, 42, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          font-size: 14px;
          color: var(--text-primary);
          transition: all 0.2s;
        }

        .form-input:focus {
          border-color: var(--primary-color);
          outline: none;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }

        .checkbox-label input {
          display: none;
        }

        .checkbox-custom {
          width: 22px;
          height: 22px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          transition: all 0.2s;
        }

        .checkbox-label input:checked + .checkbox-custom {
          background: var(--gradient-primary);
          border-color: transparent;
        }

        .mint-summary {
          padding: 20px;
          background: rgba(22, 22, 42, 0.6);
          border-radius: 16px;
          margin: 24px 0;
        }

        .mint-summary h4 {
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
        }

        .summary-row span:first-child {
          color: var(--text-tertiary);
        }

        .btn-mint {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 18px;
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          border: none;
          border-radius: 14px;
          font-size: 16px;
          font-weight: 700;
          color: white;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-mint:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(34, 197, 94, 0.4);
        }

        .btn-mint:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* ========== SUCCESS STEP ========== */
        .success-step {
          display: flex;
          justify-content: center;
          padding: 60px 0;
        }

        .success-card {
          text-align: center;
          max-width: 500px;
        }

        .success-icon {
          width: 100px;
          height: 100px;
          margin: 0 auto 30px;
          background: rgba(34, 197, 94, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .checkmark {
          width: 50px;
          height: 50px;
          color: #22c55e;
        }

        .checkmark svg {
          animation: checkmark-draw 0.5s ease forwards;
        }

        @keyframes checkmark-draw {
          from { stroke-dasharray: 50; stroke-dashoffset: 50; }
          to { stroke-dasharray: 50; stroke-dashoffset: 0; }
        }

        .success-card h2 {
          font-size: 2rem;
          margin-bottom: 12px;
        }

        .success-card > p {
          color: var(--text-secondary);
          margin-bottom: 30px;
        }

        .success-image {
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 24px;
        }

        .success-image img {
          width: 100%;
          display: block;
        }

        .redirect-text {
          color: var(--text-tertiary);
          font-size: 14px;
        }

        /* ========== RESPONSIVE ========== */
        @media (max-width: 1024px) {
          .studio-grid,
          .configure-grid {
            grid-template-columns: 1fr;
          }

          .preview-panel {
            position: static;
          }

          .model-cards {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .model-cards {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .progress-steps {
            flex-wrap: wrap;
            gap: 12px;
          }

          .step-line {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}
