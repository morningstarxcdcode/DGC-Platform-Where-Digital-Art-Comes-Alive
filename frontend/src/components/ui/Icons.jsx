/**
 * Professional SVG Icon Library for DGC Platform
 * Clean, scalable icons for modern UI design
 * Created: December 2025
 */

import PropTypes from 'prop-types';

// Base icon wrapper with consistent styling
const IconWrapper = ({ children, size = 24, className = '', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`icon ${className}`}
    {...props}
  >
    {children}
  </svg>
);

IconWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  size: PropTypes.number,
  className: PropTypes.string,
};

// Navigation Icons
export const HomeIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </IconWrapper>
);

export const SparklesIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </IconWrapper>
);

export const GlobeIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </IconWrapper>
);

export const ChartIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </IconWrapper>
);

export const UserIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </IconWrapper>
);

// Feature Icons
export const DNAIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M4 4c0 4 2 6 6 6-4 0-6 2-6 6 0-4-2-6-6-6 4 0 6-2 6-6zM17 3c0 2 1 3 3 3-2 0-3 1-3 3 0-2-1-3-3-3 2 0 3-1 3-3zM17 15c0 2 1 3 3 3-2 0-3 1-3 3 0-2-1-3-3-3 2 0 3-1 3-3z" />
  </IconWrapper>
);

export const HeartIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </IconWrapper>
);

export const BrainIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M12 5.5a3.5 3.5 0 017 0 3.5 3.5 0 01-7 7V16a2 2 0 01-2 2 2 2 0 01-2-2v-3.5a3.5 3.5 0 01-7-7 3.5 3.5 0 017 7V5.5z" />
    <path d="M9.5 17a2.5 2.5 0 005 0" />
    <circle cx="7.5" cy="11.5" r="2.5" />
    <circle cx="16.5" cy="11.5" r="2.5" />
  </IconWrapper>
);

export const BoltIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </IconWrapper>
);

// Action Icons
export const WalletIcon = (props) => (
  <IconWrapper {...props}>
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <path d="M1 10h22" />
    <circle cx="18" cy="15" r="1" />
  </IconWrapper>
);

export const PaletteIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="13.5" cy="6.5" r="1.5" />
    <circle cx="17.5" cy="10.5" r="1.5" />
    <circle cx="8.5" cy="7.5" r="1.5" />
    <circle cx="6.5" cy="12.5" r="1.5" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.109 17.5 2 12 2z" />
  </IconWrapper>
);

export const CoinsIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="8" cy="8" r="7" />
    <path d="M15.02 8.5a7 7 0 10-6.52 6.5" />
  </IconWrapper>
);

export const LockIcon = (props) => (
  <IconWrapper {...props}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </IconWrapper>
);

export const DiamondIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M2.7 10.3a2.41 2.41 0 000 3.41l7.59 7.59a2.41 2.41 0 003.41 0l7.59-7.59a2.41 2.41 0 000-3.41L13.7 2.71a2.41 2.41 0 00-3.41 0L2.7 10.3z" />
  </IconWrapper>
);

export const ArtistIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M12 2a4 4 0 014 4c0 1.95-1.4 3.58-3.25 3.93L12 22l-.75-12.07A4.001 4.001 0 018 6a4 4 0 014-4z" />
    <path d="M9 10l3 12M15 10l-3 12" />
  </IconWrapper>
);

export const RocketIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09zM12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </IconWrapper>
);

export const CheckCircleIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </IconWrapper>
);

export const ArrowRightIcon = (props) => (
  <IconWrapper {...props}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </IconWrapper>
);

// Logo component with actual design
export const DGCLogo = ({ size = 32, className = '' }) => (
  <img
    src="/images/logo.png"
    alt="DGC"
    width={size}
    height={size}
    className={`logo-mark ${className}`}
    style={{ borderRadius: '8px' }}
  />
);

DGCLogo.propTypes = {
  size: PropTypes.number,
  className: PropTypes.string,
};

export default {
  HomeIcon,
  SparklesIcon,
  GlobeIcon,
  ChartIcon,
  UserIcon,
  DNAIcon,
  HeartIcon,
  BrainIcon,
  BoltIcon,
  WalletIcon,
  PaletteIcon,
  CoinsIcon,
  LockIcon,
  DiamondIcon,
  ArtistIcon,
  RocketIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  DGCLogo,
};
