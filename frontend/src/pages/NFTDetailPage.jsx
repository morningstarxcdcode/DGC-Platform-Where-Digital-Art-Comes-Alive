import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet.jsx'
import { useContracts } from '../hooks/useContracts.jsx'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function NFTDetailPage() {
  const { tokenId } = useParams()
  const navigate = useNavigate()
  const { address, isConnected } = useWallet()
  const { buyNFT, listForSale, cancelListing, isReady: contractsReady } = useContracts()
  const [nft, setNft] = useState(null)
  const [provenance, setProvenance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [listingPrice, setListingPrice] = useState('')
  const [showListingForm, setShowListingForm] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    if (tokenId) {
      fetchNFTDetails()
      fetchProvenance()
    }
  }, [tokenId])

  async function fetchNFTDetails() {
    try {
      const response = await axios.get(`${API_BASE}/api/nfts/${tokenId}`)
      setNft(response.data)
    } catch (err) {
      console.error('Error fetching NFT details:', err)
      setError('Failed to load NFT details')
    }
  }

  async function fetchProvenance() {
    try {
      const response = await axios.get(`${API_BASE}/api/nfts/${tokenId}/provenance`)
      setProvenance(response.data)
    } catch (err) {
      console.error('Error fetching provenance:', err)
      // Don't set error for provenance as it's optional
    } finally {
      setLoading(false)
    }
  }

  async function handlePurchase() {
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }

    setActionLoading('purchase')

    try {
      if (contractsReady) {
        await buyNFT(tokenId, nft.listing_price)
        alert(`Successfully purchased NFT #${tokenId}!`)
        fetchNFTDetails() // Refresh
      } else {
        alert('Please connect to a network with deployed contracts')
      }
    } catch (err) {
      console.error('Purchase error:', err)
      alert('Failed to purchase NFT: ' + (err.message || 'Unknown error'))
    } finally {
      setActionLoading(null)
    }
  }

  async function handleListForSale() {
    if (!listingPrice || parseFloat(listingPrice) <= 0) {
      alert('Please enter a valid price')
      return
    }

    setActionLoading('listing')

    try {
      if (contractsReady) {
        await listForSale(tokenId, listingPrice)
        alert(`NFT #${tokenId} listed for ${listingPrice} ETH!`)
        setShowListingForm(false)
        setListingPrice('')
        fetchNFTDetails() // Refresh
      } else {
        alert('Please connect to a network with deployed contracts')
      }
    } catch (err) {
      console.error('Listing error:', err)
      alert('Failed to list NFT: ' + (err.message || 'Unknown error'))
    } finally {
      setActionLoading(null)
    }
  }

  async function handleCancelListing() {
    setActionLoading('cancel')

    try {
      if (contractsReady) {
        await cancelListing(tokenId)
        alert('Listing cancelled!')
        fetchNFTDetails() // Refresh
      } else {
        alert('Please connect to a network with deployed contracts')
      }
    } catch (err) {
      console.error('Cancel listing error:', err)
      alert('Failed to cancel listing: ' + (err.message || 'Unknown error'))
    } finally {
      setActionLoading(null)
    }
  }

  async function handleCreateDerivative() {
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }

    // Navigate to generate page with parent token info
    navigate(`/generate?parent=${tokenId}`)
  }

  if (loading) {
    return (
      <div className="loading">
        <div>Loading NFT details...</div>
      </div>
    )
  }

  if (error || !nft) {
    return (
      <div className="error">
        {error || 'NFT not found'}
      </div>
    )
  }

  const isOwner = address && nft.current_owner?.toLowerCase() === address.toLowerCase()
  const isCreator = address && nft.creator_address?.toLowerCase() === address.toLowerCase()

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '2rem', color: '#888' }}>
        <Link to="/marketplace">Marketplace</Link> / NFT #{tokenId}
      </div>

      <div className="grid grid-2">
        {/* NFT Display */}
        <div className="card">
          <div style={{ textAlign: 'center' }}>
            {nft.content_type === 'IMAGE' ? (
              <img 
                src={nft.image || '/placeholder-image.svg'} 
                alt={nft.name}
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '500px',
                  borderRadius: '8px',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  e.target.src = '/placeholder-image.svg'
                }}
              />
            ) : (
              <div style={{
                background: '#2a2a2a',
                padding: '2rem',
                borderRadius: '8px',
                minHeight: '300px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                  {nft.content_type === 'TEXT' ? '📝' : '🎵'}
                </div>
                <div style={{ color: '#888' }}>
                  {nft.content_type} Content
                </div>
                {nft.image && (
                  <a 
                    href={nft.image} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn"
                    style={{ marginTop: '1rem' }}
                  >
                    View Content
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* NFT Information */}
        <div className="card">
          <h1 style={{ marginBottom: '1rem' }}>{nft.name}</h1>
          
          <div style={{ marginBottom: '2rem' }}>
            <p style={{ color: '#888', lineHeight: 1.6 }}>
              {nft.description || 'No description provided.'}
            </p>
          </div>

          {/* Price and Actions */}
          {nft.is_listed && nft.listing_price && (
            <div style={{ 
              background: '#2a2a2a', 
              padding: '1rem', 
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.5rem' }}>
                Current Price
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#646cff' }}>
                {nft.listing_price} ETH
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {nft.is_listed && !isOwner && (
              <button 
                className="btn btn-primary" 
                onClick={handlePurchase}
                disabled={actionLoading === 'purchase'}
                style={{ fontSize: '1.1rem', padding: '1rem' }}
              >
                {actionLoading === 'purchase' ? '⏳ Processing...' : `Buy Now for ${nft.listing_price} ETH`}
              </button>
            )}

            {isOwner && !nft.is_listed && (
              <>
                {!showListingForm ? (
                  <button 
                    className="btn btn-primary" 
                    onClick={() => setShowListingForm(true)}
                  >
                    📋 List for Sale
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="Price in ETH"
                      value={listingPrice}
                      onChange={(e) => setListingPrice(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button 
                      className="btn btn-primary" 
                      onClick={handleListForSale}
                      disabled={actionLoading === 'listing'}
                    >
                      {actionLoading === 'listing' ? '⏳' : '✓'} List
                    </button>
                    <button 
                      className="btn" 
                      onClick={() => {
                        setShowListingForm(false)
                        setListingPrice('')
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </>
            )}

            {isOwner && nft.is_listed && (
              <button 
                className="btn" 
                onClick={handleCancelListing}
                disabled={actionLoading === 'cancel'}
              >
                {actionLoading === 'cancel' ? '⏳ Cancelling...' : '✖ Cancel Listing'}
              </button>
            )}

            <button className="btn btn-secondary" onClick={handleCreateDerivative}>
              🧬 Create Derivative Work
            </button>
          </div>

          {/* NFT Details */}
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Details</h3>
            
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Token ID:</span>
                <span>#{nft.token_id}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Content Type:</span>
                <span>{nft.content_type}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Creator:</span>
                <span>
                  <Link to={`/profile?address=${nft.creator_address}`}>
                    {nft.creator_address?.slice(0, 6)}...{nft.creator_address?.slice(-4)}
                  </Link>
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Current Owner:</span>
                <span>
                  {nft.current_owner ? (
                    <Link to={`/profile?address=${nft.current_owner}`}>
                      {nft.current_owner?.slice(0, 6)}...{nft.current_owner?.slice(-4)}
                    </Link>
                  ) : (
                    'Unknown'
                  )}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Model Version:</span>
                <span>{nft.model_version}</span>
              </div>
              
              {nft.minted_at && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#888' }}>Minted:</span>
                  <span>{new Date(nft.minted_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Attributes */}
          {nft.attributes && nft.attributes.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Attributes</h3>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {nft.attributes.map((attr, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>{attr.trait_type}:</span>
                    <span>{attr.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Provenance Section */}
      {provenance && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Provenance Chain</h2>
          
          <div style={{ color: '#888', marginBottom: '1rem' }}>
            This NFT's complete creation and ownership history is recorded on the blockchain.
          </div>

          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#888' }}>Provenance Hash:</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                {provenance.provenance_hash}
              </span>
            </div>
            
            {provenance.model_hash && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Model Hash:</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                  {provenance.model_hash}
                </span>
              </div>
            )}
            
            {provenance.prompt_hash && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Prompt Hash:</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                  {provenance.prompt_hash}
                </span>
              </div>
            )}

            {provenance.parent_tokens && provenance.parent_tokens.length > 0 && (
              <div>
                <div style={{ color: '#888', marginBottom: '0.5rem' }}>Parent Tokens:</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {provenance.parent_tokens.map((parentId) => (
                    <Link 
                      key={parentId}
                      to={`/nft/${parentId}`}
                      className="btn"
                      style={{ fontSize: '0.9rem' }}
                    >
                      #{parentId}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NFTDetailPage