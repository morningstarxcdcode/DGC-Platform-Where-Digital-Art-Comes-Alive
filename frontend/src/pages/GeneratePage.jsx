import { useState } from 'react'
import { useWallet } from '../hooks/useWallet.jsx'
import { useContracts } from '../hooks/useContracts.jsx'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const CONTENT_TYPES = [
  { value: 'IMAGE', label: 'Image', icon: '🎨' },
  { value: 'TEXT', label: 'Text', icon: '📝' },
  { value: 'MUSIC', label: 'Music', icon: '🎵' }
]

function GeneratePage() {
  const { address, isConnected, getSigner } = useWallet()
  const { mintNFT, isReady: contractsReady, loading: contractsLoading, error: contractsError } = useContracts()
  const [formData, setFormData] = useState({
    prompt: '',
    contentType: 'IMAGE',
    seed: '',
    collaborators: [],
    royaltyPercent: 10
  })
  const [generationResult, setGenerationResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [minting, setMinting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [mintedTokenId, setMintedTokenId] = useState(null)

  function handleInputChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  function addCollaborator() {
    setFormData(prev => ({
      ...prev,
      collaborators: [...prev.collaborators, { address: '', share: 10 }]
    }))
  }

  function removeCollaborator(index) {
    setFormData(prev => ({
      ...prev,
      collaborators: prev.collaborators.filter((_, i) => i !== index)
    }))
  }

  function updateCollaborator(index, field, value) {
    setFormData(prev => {
      const updated = [...prev.collaborators]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, collaborators: updated }
    })
  }

  async function handleGenerate(e) {
    e.preventDefault()
    
    if (!isConnected) {
      setError('Please connect your wallet first')
      return
    }

    if (!formData.prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const requestData = {
        prompt: formData.prompt,
        content_type: formData.contentType,
        creator_address: address,
        ...(formData.seed && { seed: parseInt(formData.seed) }),
        ...(formData.collaborators.length > 0 && { collaborators: formData.collaborators })
      }

      const response = await axios.post(`${API_BASE}/api/generate`, requestData)
      setGenerationResult(response.data)
      setSuccess('Content generated successfully!')
    } catch (err) {
      console.error('Generation error:', err)
      setError(err.response?.data?.error?.message || 'Failed to generate content')
    } finally {
      setLoading(false)
    }
  }

  async function handleMint() {
    if (!generationResult) return

    setMinting(true)
    setError(null)

    try {
      // First upload metadata to IPFS
      const metadata = {
        name: `DGC #${Date.now()}`,
        description: formData.prompt,
        image: generationResult.content_url || '',
        content_type: formData.contentType,
        attributes: [
          { trait_type: 'Model', value: generationResult.model_version },
          { trait_type: 'Seed', value: generationResult.seed?.toString() || 'random' },
          { trait_type: 'Content Type', value: formData.contentType }
        ],
        provenance: {
          model_hash: generationResult.model_hash || '',
          prompt_hash: generationResult.prompt_hash || '',
          content_hash: generationResult.content_hash || '',
          timestamp: generationResult.timestamp
        }
      }

      // Upload metadata to IPFS
      const uploadResponse = await axios.post(`${API_BASE}/api/upload`, {
        content: JSON.stringify(metadata),
        content_type: 'application/json',
        pin: true
      })

      const tokenURI = uploadResponse.data.gateway_url || `ipfs://${uploadResponse.data.cid}`

      // Mint the NFT using the contract
      if (contractsReady) {
        const result = await mintNFT(tokenURI, metadata.provenance)
        setMintedTokenId(result.tokenId.toString())
        setSuccess(`NFT minted successfully! Token ID: ${result.tokenId}`)
      } else {
        // Fallback: just show success with mock token ID
        setMintedTokenId('pending')
        setSuccess('NFT metadata uploaded! Connect to a network with deployed contracts to complete minting.')
      }
    } catch (err) {
      console.error('Minting error:', err)
      setError('Failed to mint NFT: ' + (err.message || 'Unknown error'))
    } finally {
      setMinting(false)
    }
  }

  if (!isConnected) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h2>Connect Your Wallet</h2>
        <p>Please connect your wallet to start generating AI content.</p>
      </div>
    )
  }

  return (
    <div>
      <h1>Generate AI Content</h1>
      <p style={{ color: '#888', marginBottom: '2rem' }}>
        Create unique digital assets using AI and mint them as NFTs with full provenance tracking.
      </p>

      <div className="grid grid-2">
        {/* Generation Form */}
        <div className="card">
          <h2>Content Generation</h2>
          
          <form onSubmit={handleGenerate}>
            <div className="form-group">
              <label htmlFor="prompt">Prompt *</label>
              <textarea
                id="prompt"
                name="prompt"
                value={formData.prompt}
                onChange={handleInputChange}
                placeholder="Describe what you want to generate..."
                rows={4}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="contentType">Content Type</label>
              <select
                id="contentType"
                name="contentType"
                value={formData.contentType}
                onChange={handleInputChange}
              >
                {CONTENT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="seed">Seed (optional)</label>
              <input
                type="number"
                id="seed"
                name="seed"
                value={formData.seed}
                onChange={handleInputChange}
                placeholder="Enter a number for reproducible results"
              />
            </div>

            {/* Collaborators Section */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Collaborators</label>
                <button type="button" className="btn" onClick={addCollaborator}>
                  Add Collaborator
                </button>
              </div>
              
              {formData.collaborators.map((collaborator, index) => (
                <div key={index} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <input
                    type="text"
                    placeholder="Wallet address"
                    value={collaborator.address}
                    onChange={(e) => updateCollaborator(index, 'address', e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <input
                    type="number"
                    placeholder="Share %"
                    value={collaborator.share}
                    onChange={(e) => updateCollaborator(index, 'share', parseInt(e.target.value))}
                    style={{ width: '100px' }}
                    min="1"
                    max="100"
                  />
                  <button 
                    type="button" 
                    className="btn" 
                    onClick={() => removeCollaborator(index)}
                    style={{ backgroundColor: '#ff6b6b' }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ width: '100%', marginTop: '1rem' }}
            >
              {loading ? 'Generating...' : 'Generate Content'}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="card">
          <h2>Generation Result</h2>
          
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
          
          {loading && (
            <div className="loading">
              <div>Generating content...</div>
            </div>
          )}

          {generationResult && (
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Status:</strong> {generationResult.status}
              </div>
              
              {generationResult.status === 'COMPLETED' && (
                <div>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Content Type:</strong> {generationResult.content_type}
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Model Version:</strong> {generationResult.model_version}
                  </div>
                  
                  {generationResult.seed && (
                    <div style={{ marginBottom: '1rem' }}>
                      <strong>Seed:</strong> {generationResult.seed}
                    </div>
                  )}
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Job ID:</strong> {generationResult.job_id}
                  </div>

                  {generationResult.content_url && (
                    <div style={{ marginBottom: '1rem' }}>
                      <strong>Preview:</strong>
                      <div style={{ marginTop: '0.5rem' }}>
                        {generationResult.content_type === 'IMAGE' ? (
                          <img 
                            src={generationResult.content_url} 
                            alt="Generated content"
                            style={{ maxWidth: '100%', borderRadius: '4px' }}
                          />
                        ) : (
                          <div style={{ 
                            background: '#2a2a2a', 
                            padding: '1rem', 
                            borderRadius: '4px',
                            fontFamily: 'monospace'
                          }}>
                            Content available at: {generationResult.content_url}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Royalty Settings */}
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                      Royalty Percentage: {formData.royaltyPercent}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="25"
                      value={formData.royaltyPercent}
                      onChange={(e) => setFormData(prev => ({ ...prev, royaltyPercent: parseInt(e.target.value) }))}
                      style={{ width: '100%' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#888' }}>
                      <span>0%</span>
                      <span>25% max</span>
                    </div>
                  </div>

                  <button 
                    className="btn btn-primary" 
                    onClick={handleMint}
                    disabled={minting}
                    style={{ width: '100%' }}
                  >
                    {minting ? '⏳ Minting...' : '🎨 Mint as NFT'}
                  </button>

                  {mintedTokenId && (
                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                      <a href={`/nft/${mintedTokenId}`} className="btn btn-secondary">
                        View Your NFT →
                      </a>
                    </div>
                  )}
                </div>
              )}
              
              {generationResult.status === 'FAILED' && (
                <div className="error">
                  Generation failed: {generationResult.error}
                </div>
              )}
            </div>
          )}

          {!generationResult && !loading && (
            <div style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>
              Enter a prompt and click "Generate Content" to create AI-generated assets.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GeneratePage