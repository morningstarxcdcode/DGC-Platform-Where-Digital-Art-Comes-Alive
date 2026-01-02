import React from 'react'

function LoadingSpinner({ size = 'medium', message = 'Loading...' }) {
  const sizeMap = {
    small: { width: '24px', height: '24px', border: '3px' },
    medium: { width: '40px', height: '40px', border: '4px' },
    large: { width: '60px', height: '60px', border: '5px' }
  }
  
  const { width, height, border } = sizeMap[size] || sizeMap.medium

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      gap: '1rem'
    }}>
      <div style={{
        width,
        height,
        border: `${border} solid #333`,
        borderTop: `${border} solid #646cff`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      {message && (
        <div style={{ color: '#888', fontSize: '0.9rem' }}>
          {message}
        </div>
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default LoadingSpinner
