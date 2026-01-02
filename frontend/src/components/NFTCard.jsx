import React from 'react'
import { Link } from 'react-router-dom'

function NFTCard({ nft, showBuyButton = false, onBuy }) {
  const formatAddress = (addr) => {
    if (!addr) return 'Unknown'
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <div className="nft-card">
      <Link to={`/nft/${nft.token_id}`}>
        <img 
          src={nft.image || '/placeholder-image.svg'} 
          alt={nft.name}
          className="nft-image"
          onError={(e) => {
            e.target.src = '/placeholder-image.svg'
          }}
        />
      </Link>
      
      <div className="nft-info">
        <Link to={`/nft/${nft.token_id}`} style={{ textDecoration: 'none' }}>
          <div className="nft-title">{nft.name}</div>
        </Link>
        
        <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          by {formatAddress(nft.creator_address)}
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '0.5rem'
        }}>
          <span style={{ color: '#888', fontSize: '0.8rem' }}>
            {nft.content_type}
          </span>
          {nft.price && (
            <span className="nft-price">
              {nft.price} ETH
            </span>
          )}
        </div>

        <div style={{ color: '#888', fontSize: '0.8rem', marginBottom: '1rem' }}>
          Model: {nft.model_version}
        </div>

        {showBuyButton && nft.is_listed && (
          <button 
            className="btn btn-primary" 
            onClick={(e) => {
              e.preventDefault()
              onBuy && onBuy(nft)
            }}
            style={{ width: '100%' }}
          >
            Buy Now
          </button>
        )}
        
        {showBuyButton && !nft.is_listed && (
          <div style={{ 
            textAlign: 'center', 
            color: '#888', 
            fontSize: '0.9rem',
            padding: '0.5rem'
          }}>
            Not for sale
          </div>
        )}
      </div>
    </div>
  )
}

export default NFTCard
