import React from 'react'

function ErrorMessage({ message, onRetry }) {
  return (
    <div style={{
      backgroundColor: 'rgba(255, 107, 107, 0.1)',
      border: '1px solid #ff6b6b',
      borderRadius: '8px',
      padding: '1.5rem',
      margin: '1rem 0',
      textAlign: 'center'
    }}>
      <div style={{ color: '#ff6b6b', marginBottom: '1rem' }}>
        {message}
      </div>
      {onRetry && (
        <button 
          className="btn" 
          onClick={onRetry}
          style={{ borderColor: '#ff6b6b', color: '#ff6b6b' }}
        >
          Try Again
        </button>
      )}
    </div>
  )
}

function SuccessMessage({ message, onDismiss }) {
  return (
    <div style={{
      backgroundColor: 'rgba(81, 207, 102, 0.1)',
      border: '1px solid #51cf66',
      borderRadius: '8px',
      padding: '1.5rem',
      margin: '1rem 0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div style={{ color: '#51cf66' }}>
        ✓ {message}
      </div>
      {onDismiss && (
        <button 
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: '#51cf66',
            cursor: 'pointer',
            fontSize: '1.2rem'
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}

function InfoMessage({ message }) {
  return (
    <div style={{
      backgroundColor: 'rgba(100, 108, 255, 0.1)',
      border: '1px solid #646cff',
      borderRadius: '8px',
      padding: '1.5rem',
      margin: '1rem 0',
      color: '#646cff'
    }}>
      ℹ {message}
    </div>
  )
}

export { ErrorMessage, SuccessMessage, InfoMessage }
