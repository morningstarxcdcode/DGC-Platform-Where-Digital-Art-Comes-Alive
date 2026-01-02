/**
 * DGC Platform - Main Application Component
 * 
 * This is the root component that sets up routing and wallet context
 * for the entire application. The WalletProvider wraps everything to
 * give all child components access to wallet state and methods.
 * 
 * @author Sourav Rajak (morningstarxcdcode)
 * @version 1.0.0
 */

import React from 'react'
import { Routes, Route } from 'react-router-dom'

// Layout wrapper for consistent header/footer
import Layout from './components/LayoutPro.jsx'

// Page components - Professional Edition with advanced UI/UX
import HomePage from './pages/HomePage.jsx'
import GeneratePage from './pages/GeneratePagePro.jsx'
import MarketplacePage from './pages/MarketplacePagePro.jsx'
import NFTDetailPage from './pages/NFTDetailPagePro.jsx'
import ProfilePage from './pages/ProfilePagePro.jsx'
import DashboardPage from './pages/DashboardPagePro.jsx'
import LandingPage from './pages/LandingPagePro.jsx'

// Context provider for wallet connection state
import { WalletProvider } from './hooks/useWallet.jsx'

/**
 * Main App component - entry point for the React app
 * 
 * Note: We wrap everything in WalletProvider first so that
 * even the Layout can access wallet state for the header display.
 */
function App() {
  return (
    <WalletProvider>
      <Layout>
        <Routes>
          {/* Home page - landing with feature overview */}
          <Route path="/" element={<LandingPage />} />
          
          {/* NFT generation page - AI-powered creation */}
          <Route path="/generate" element={<GeneratePage />} />
          
          {/* Marketplace - browse and buy NFTs */}
          <Route path="/marketplace" element={<MarketplacePage />} />
          
          {/* Individual NFT detail view */}
          <Route path="/nft/:tokenId" element={<NFTDetailPage />} />
          
          {/* User profile with their NFTs */}
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* Dashboard with analytics and tools */}
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </Layout>
    </WalletProvider>
  )
}

export default App