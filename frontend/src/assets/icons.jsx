// Professional SVG Icon Library for DGC Platform
// Author: Sourav Rajak (morningstarxcdcode)
// Version: 1.0.0

import React from 'react'

export const DGCLogo = ({ size = 40, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#667eea" />
        <stop offset="50%" stopColor="#764ba2" />
        <stop offset="100%" stopColor="#f093fb" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge> 
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="45" fill="url(#logoGradient)" filter="url(#glow)" />
    <path d="M25 35 L50 25 L75 35 L75 65 L50 75 L25 65 Z" fill="white" opacity="0.9" />
    <circle cx="50" cy="50" r="8" fill="url(#logoGradient)" />
    <circle cx="35" cy="40" r="3" fill="url(#logoGradient)" opacity="0.7" />
    <circle cx="65" cy="40" r="3" fill="url(#logoGradient)" opacity="0.7" />
    <circle cx="35" cy="60" r="3" fill="url(#logoGradient)" opacity="0.7" />
    <circle cx="65" cy="60" r="3" fill="url(#logoGradient)" opacity="0.7" />
  </svg>
)

export const DNAIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="dnaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e74c3c" />
        <stop offset="100%" stopColor="#c0392b" />
      </linearGradient>
    </defs>
    <path d="M4 2 Q12 8 20 2 Q12 16 4 22 Q12 16 20 22 Q12 8 4 2" 
          fill="none" stroke="url(#dnaGradient)" strokeWidth="2" />
    <circle cx="6" cy="6" r="2" fill="url(#dnaGradient)" />
    <circle cx="18" cy="6" r="2" fill="url(#dnaGradient)" />
    <circle cx="6" cy="18" r="2" fill="url(#dnaGradient)" />
    <circle cx="18" cy="18" r="2" fill="url(#dnaGradient)" />
  </svg>
)

export const HeartIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e91e63" />
        <stop offset="100%" stopColor="#ad1457" />
      </linearGradient>
    </defs>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
          fill="url(#heartGradient)" />
  </svg>
)

export const BrainIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#9c27b0" />
        <stop offset="100%" stopColor="#673ab7" />
      </linearGradient>
    </defs>
    <path d="M12 2C8.69 2 6 4.69 6 8c0 1.5.5 2.87 1.34 3.97C6.54 12.5 6 13.2 6 14c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2 0-.8-.54-1.5-1.34-2.03C17.5 10.87 18 9.5 18 8c0-3.31-2.69-6-6-6z" 
          fill="url(#brainGradient)" />
    <circle cx="9" cy="8" r="1" fill="white" opacity="0.8" />
    <circle cx="15" cy="8" r="1" fill="white" opacity="0.8" />
  </svg>
)

export const LightningIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="lightningGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ff9800" />
        <stop offset="100%" stopColor="#f57c00" />
      </linearGradient>
    </defs>
    <path d="M7 2v11h3v9l7-12h-4l4-8z" fill="url(#lightningGradient)" />
  </svg>
)

export const GlobeIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="globeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2196f3" />
        <stop offset="100%" stopColor="#1976d2" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" fill="none" stroke="url(#globeGradient)" strokeWidth="2" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" 
          fill="none" stroke="url(#globeGradient)" strokeWidth="2" />
  </svg>
)

export const QuantumIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="quantumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4caf50" />
        <stop offset="100%" stopColor="#388e3c" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="3" fill="url(#quantumGradient)" />
    <circle cx="12" cy="12" r="8" fill="none" stroke="url(#quantumGradient)" strokeWidth="1" opacity="0.5" />
    <circle cx="12" cy="12" r="12" fill="none" stroke="url(#quantumGradient)" strokeWidth="1" opacity="0.3" />
    <circle cx="6" cy="6" r="1" fill="url(#quantumGradient)" />
    <circle cx="18" cy="6" r="1" fill="url(#quantumGradient)" />
    <circle cx="6" cy="18" r="1" fill="url(#quantumGradient)" />
    <circle cx="18" cy="18" r="1" fill="url(#quantumGradient)" />
  </svg>
)

export const SearchIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" />
  </svg>
)

export const WalletIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path d="M19 7H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" 
          fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M3 7V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2" 
          fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="17" cy="12" r="1" fill="currentColor" />
  </svg>
)

export const RobotIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <rect x="4" y="8" width="16" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="9" cy="13" r="1" fill="currentColor" />
    <circle cx="15" cy="13" r="1" fill="currentColor" />
    <path d="M9 17h6" stroke="currentColor" strokeWidth="2" />
  </svg>
)

export const SparkleIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" 
          fill="currentColor" />
    <path d="M8 4l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" fill="currentColor" opacity="0.6" />
  </svg>
)

export const TrendingIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" fill="none" stroke="currentColor" strokeWidth="2" />
    <polyline points="17,6 23,6 23,12" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
)

export const ShieldIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" 
          fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" />
  </svg>
)

export const ZapIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" fill="currentColor" />
  </svg>
)

export const EyeIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" 
          fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
)

export const LayersIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <polygon points="12,2 2,7 12,12 22,7 12,2" fill="none" stroke="currentColor" strokeWidth="2" />
    <polyline points="2,17 12,22 22,17" fill="none" stroke="currentColor" strokeWidth="2" />
    <polyline points="2,12 12,17 22,12" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
)