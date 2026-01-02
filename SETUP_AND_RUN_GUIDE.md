# 🎨 DGC Platform - Complete Setup & Running Guide

## 📋 Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Running the Project](#running-the-project)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## 🌟 Overview

The **Decentralized Generative Content (DGC) Platform** is a blockchain-backed marketplace for AI-generated digital assets with full on-chain provenance and token economics.

### Key Features
- 🤖 AI-powered content generation (images, text, music)
- 🔗 Blockchain integration with smart contracts
- 📦 IPFS decentralized storage
- 🎭 NFT minting and trading
- 💰 Royalty distribution system

## 📦 Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   ```bash
   node --version  # Should show v18.x.x or higher
   ```

2. **Python** (v3.11 or higher)
   ```bash
   python --version  # Should show 3.11.x or higher
   ```

3. **Git**
   ```bash
   git --version
   ```

4. **PostgreSQL** (v15 or higher) - For backend database
   ```bash
   psql --version
   ```

5. **Redis** (v7 or higher) - For caching and background tasks
   ```bash
   redis-server --version
   ```

### Optional (for contract development)
- **Foundry** (for advanced contract testing)
  ```bash
  curl -L https://foundry.paradigm.xyz | bash
  foundryup
  ```

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/morningstarxcdcode/DGC-Platform-Where-Digital-Art-Comes-Alive.git
cd DGC-Platform-Where-Digital-Art-Comes-Alive
```

### 2. Install Dependencies
```bash
# Install all dependencies at once
npm run install:all
```

Or install individually:
```bash
# Frontend
cd frontend && npm install && cd ..

# Backend
cd backend && pip install -r requirements.txt && cd ..

# Contracts
cd contracts && npm install && cd ..
```

### 3. Environment Setup

Create `.env` files:

**Backend (.env in backend/)**
```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dgc_dev

# Redis
REDIS_URL=redis://localhost:6379

# IPFS
IPFS_HOST=localhost
IPFS_PORT=5001

# Blockchain
ETHEREUM_RPC_URL=http://localhost:8545
PRIVATE_KEY=your_private_key_here

# API
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=true
```

**Frontend (.env in frontend/)**
```env
VITE_API_URL=http://localhost:8000
VITE_CHAIN_ID=31337
VITE_CONTRACT_ADDRESS=0x... # Will be set after deployment
```

**Contracts (.env in contracts/)**
```env
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 4. Start Services

#### Option A: Using the Start Script (Recommended)
```bash
# Start all services at once
./start.sh

# Or use npm
npm start
```

#### Option B: Manual Start (For Development)

**Terminal 1 - Start Local Blockchain**
```bash
cd contracts
npm run node
```

**Terminal 2 - Deploy Contracts**
```bash
cd contracts
# Wait for blockchain to start, then deploy
sleep 5
npm run deploy:local
# Save the contract addresses shown
```

**Terminal 3 - Start Backend**
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 4 - Start Frontend**
```bash
cd frontend
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Blockchain**: http://localhost:8545

## 🔧 Detailed Setup

### Database Setup

```bash
# Create PostgreSQL database
createdb dgc_dev

# For testing
createdb dgc_test

# Run migrations (if applicable)
cd backend
alembic upgrade head
```

### Redis Setup

```bash
# Start Redis server
redis-server

# Or with Docker
docker run -d -p 6379:6379 redis:7-alpine
```

### IPFS Setup

```bash
# Install IPFS Desktop or run with Docker
docker run -d --name ipfs_host \
  -p 4001:4001 -p 5001:5001 -p 8080:8080 \
  ipfs/kubo:latest
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Individual Test Suites

**Backend Tests**
```bash
cd backend
pytest tests/ -v --cov=app
```

**Frontend Tests**
```bash
cd frontend
npm test
```

**Contract Tests (Hardhat)**
```bash
cd contracts
npm test
```

**Contract Tests (Foundry)**
```bash
cd contracts
forge test -vv
```

### Test Coverage

```bash
# Backend coverage
cd backend
pytest --cov=app --cov-report=html
open htmlcov/index.html

# Frontend coverage
cd frontend
npm test -- --coverage
```

## 🏗️ Building for Production

### Build All
```bash
npm run build
```

### Build Individual Components

**Frontend**
```bash
cd frontend
npm run build
# Output: frontend/dist/
```

**Backend**
```bash
cd backend
python -m build
# Output: backend/dist/
```

**Contracts**
```bash
cd contracts
npm run build
# Output: contracts/artifacts/
```

## 🚢 Deployment

### Deploy to GitHub Pages

The frontend is automatically deployed to GitHub Pages on push to main:

1. Enable GitHub Pages in repository settings
2. Set source to "GitHub Actions"
3. Push to main branch
4. Access at: https://morningstarxcdcode.github.io/DGC-Platform-Where-Digital-Art-Comes-Alive/

### Deploy Contracts to Testnet

```bash
cd contracts

# Deploy to Sepolia
npm run deploy:sepolia

# Verify on Etherscan
npm run verify:sepolia
```

### Deploy Backend (Example: Railway/Render)

```bash
# Using Docker
docker build -t dgc-backend ./backend
docker run -p 8000:8000 dgc-backend
```

## 📊 Live Examples

### Example 1: Generate an Image NFT

```bash
# Using curl
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A futuristic city with flying cars",
    "content_type": "IMAGE",
    "creator_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  }'
```

### Example 2: List All NFTs

```bash
curl http://localhost:8000/api/nfts?page=1&page_size=10
```

### Example 3: Interact with Smart Contracts

```javascript
// Using ethers.js in frontend
import { ethers } from 'ethers';

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const dgcContract = new ethers.Contract(
  contractAddress,
  contractABI,
  signer
);

// Mint NFT
const tx = await dgcContract.mintNFT(metadataURI);
await tx.wait();
```

## 🛠️ Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 8000
lsof -i :8000
# Kill the process
kill -9 <PID>
```

#### Python Version Issues
```bash
# Use pyenv to manage Python versions
pyenv install 3.11.0
pyenv local 3.11.0
```

#### Node Modules Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Contract Deployment Fails
```bash
# Restart local blockchain
cd contracts
npm run node

# Redeploy contracts
npm run deploy:local
```

## 📚 Additional Resources

- [API Documentation](http://localhost:8000/docs)
- [Technical Flowcharts](DGC_TECHNICAL_FLOWCHARTS.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Security Policy](SECURITY.md)
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md)

## 🤝 Support

- **Issues**: [GitHub Issues](https://github.com/morningstarxcdcode/DGC-Platform-Where-Digital-Art-Comes-Alive/issues)
- **Discussions**: [GitHub Discussions](https://github.com/morningstarxcdcode/DGC-Platform-Where-Digital-Art-Comes-Alive/discussions)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

**Made with ❤️ by Sourav Rajak**
