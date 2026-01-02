/**
 * Glass Card Component
 * Premium glassmorphism card with hover effects
 */

import React from 'react'

export default function Card({ 
  children, 
  variant = 'default',
  hover = true,
  glow = false,
  className = '',
  ...props 
}) {
  const baseStyles = 'card-glass'
  const variantStyles = {
    default: 'card-default',
    elevated: 'card-elevated',
    gradient: 'card-gradient',
    neon: 'card-neon',
  }

  const classes = [
    baseStyles,
    variantStyles[variant],
    hover ? 'card-hover' : '',
    glow ? 'card-glow' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={classes} {...props}>
      <div className="card-border"></div>
      <div className="card-content">
        {children}
      </div>
    </div>
  )
}
