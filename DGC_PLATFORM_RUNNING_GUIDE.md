# 🚀 DGC Platform - Complete Running Services Guide

**Author: Sourav Rajak (morningstarxcdcode)**  
**Version: 1.0.0**

## 🌟 Current Status: ALL SERVICES RUNNING ✅

The DGC Platform is a revolutionary blockchain-based NFT marketplace with AI-powered generative content. Here's everything that's currently running and how to interact with it.

---

## 📊 Service Status Dashboard

| Service | Status | URL | Port | Description |
| --------- | -------- | ----- | ------ | ------------- |
| 🔗 **Blockchain** | ✅ Running | <http://localhost:8545> | 8545 | Local Hardhat Ethereum node |
| 🐍 **Backend API** | ✅ Running | <http://localhost:8000> | 8000 | FastAPI server with AI services |
| ⚛️ **Frontend** | ✅ Running | <http://localhost:3000> | 3000 | React web application |
| 📜 **Smart Contracts** | ✅ Deployed | - | - | All contracts deployed to local blockchain |

---

## 🔧 Command Reference Guide

### 🎯 Quick Start Commands

```bash
# Start everything at once
./start.sh dev

# Start individual services
./start.sh contracts-only  # Just blockchain
./start.sh prod           # Backend + frontend only
./start.sh stop          # Stop all services
```

### 📦 Installation Commands

```bash
# Install all dependencies
npm run install:all

# Install individual components
npm install                              # Root dependencies
cd contracts && npm install             # Smart contracts
cd frontend && npm install              # Frontend React app
cd backend && pip install -r requirements.txt  # Python backend
```

### 🏗️ Build Commands

```bash
# Build everything
npm run build

# Build individual components
npm run build:contracts   # Compile smart contracts
npm run build:backend     # Build Python backend
npm run build:frontend    # Build React frontend for production
```

### 🧪 Testing Commands

```bash
# Run all tests
npm test

# Test individual components
npm run test:contracts    # Smart contract tests (Hardhat + Foundry)
npm run test:backend      # Python backend tests (pytest)
npm run test:frontend     # React frontend tests (Vitest)

# Backend specific tests
cd backend && python simple_test.py      # Basic functionality test
cd backend && pytest                     # Full test suite
cd backend && python test_manual.py      # Manual integration tests
```

### 🔄 Development Commands

```bash
# Start development servers individually
npm run dev:contracts     # Start Hardhat node
npm run dev:backend       # Start FastAPI with hot reload
npm run dev:frontend      # Start Vite dev server

# Alternative backend startup
cd backend && python run_server.py       # Custom server runner
cd backend && uvicorn app.api:app --reload  # Direct uvicorn
```

---

## 🌐 Access Points & URLs

### 🎨 Frontend Application

- **Main App**: <http://localhost:3000>
- **Features**:
  - MetaMask Real-Time Dashboard
  - 7-Block Multi-Agent AI System
  - Blockchain Search with Autocomplete
  - NFT Generation & Marketplace
  - Emotional AI Integration

### 🔌 Backend API

- **API Base**: <http://localhost:8000>
- **Documentation**: <http://localhost:8000/docs> (Interactive Swagger UI)
- **Health Check**: <http://localhost:8000/health>
- **WebSocket**: `ws://localhost:8000/ws/`

#### 🛠️ API Endpoints

| Endpoint | Method | Description |
| ---------- | -------- | ------------- |
| `/health` | GET | Service health status |
| `/docs` | GET | Interactive API documentation |
| `/api/generate` | POST | Generate AI content (images, text, music) |
| `/api/nfts` | GET | List NFTs by owner |
| `/api/nfts/{id}` | GET | Get specific NFT details |
| `/api/wallet/{address}` | GET | Get wallet information |
| `/api/agents/execute` | POST | Execute AI agents |
| `/api/search` | GET | Blockchain search |
| `/ws/` | WebSocket | Real-time updates |

### ⛓️ Blockchain Network

- **RPC URL**: <http://localhost:8545>
- **Chain ID**: 31337 (Hardhat default)
- **Network**: localhost

#### 💰 Test Accounts (Pre-funded with 10,000 ETH each)

| Account | Address | Private Key |
| --------- | --------- | ------------- |
| Account #0 | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` |
| Account #1 | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` |
| Account #2 | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a` |

*Note: These are test accounts only. Never use these on mainnet!*

### 📜 Smart Contract Addresses

| Contract | Address | Description |
| ---------- | --------- | ------------- |
| **ProvenanceRegistry** | `0x5FbDB2315678afecb367f032d93F642f64180aa3` | Tracks NFT creation and evolution history |
| **DGCToken** | `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512` | Main NFT contract with living content |
| **RoyaltySplitter** | `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0` | Automatic royalty distribution |
| **Marketplace** | `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9` | NFT trading and auction platform |

---

## 🤖 AI Agent System

### 7-Block Multi-Agent Architecture

The platform runs 7 specialized AI agents that can work individually or together:

| Agent Block | Function | Command | Description |
| ------------- | ---------- | --------- | ------------- |
| 🎨 **Block 1** | Image Generation | `POST /api/agents/execute` | Creates images from text prompts |
| 📝 **Block 2** | Text Generation | `POST /api/agents/execute` | Generates stories and descriptions |
| 🎵 **Block 3** | Music Generation | `POST /api/agents/execute` | Composes music for NFTs |
| 🧬 **Block 4** | DNA Evolution | `POST /api/agents/execute` | Evolves content over time |
| 💖 **Block 5** | Emotional AI | `POST /api/agents/execute` | Responds to user emotions |
| 🔍 **Block 6** | Blockchain Search | `GET /api/search` | Searches blockchain data |
| 📊 **Block 7** | Analytics | `GET /api/analytics` | Tracks performance metrics |

### Agent Execution Modes

```bash
# Single agent execution
curl -X POST http://localhost:8000/api/agents/execute \
  -H "Content-Type: application/json" \
  -d '{"agent_type": "IMAGE_GENERATOR", "prompt": "magical forest"}'

# Multi-agent execution
curl -X POST http://localhost:8000/api/agents/execute \
  -H "Content-Type: application/json" \
  -d '{"mode": "ALL_AGENTS", "prompt": "create living NFT"}'
```

---

## 🔍 Blockchain Search System

### Search Categories

| Category | Example Query | What You Find |
| ---------- | --------------- | --------------- |
| **Transactions** | `0x1234...` | Transaction details and status |
| **Addresses** | `0xf39F...` | Wallet balance and NFTs |
| **Tokens** | `DGC` | Token information and holders |
| **NFTs** | `living art` | NFT collections and metadata |
| **Blocks** | `block 12345` | Block information and transactions |
| **Contracts** | `marketplace` | Smart contract details |

### Search API Usage

```bash
# Search for anything
curl "http://localhost:8000/api/search?q=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

# Search with category filter
curl "http://localhost:8000/api/search?q=DGC&category=tokens"

# Autocomplete search
curl "http://localhost:8000/api/search/autocomplete?q=hel"
```

---

## 💖 MetaMask Integration

### Real-Time Dashboard Features

| Feature | Update Frequency | API Endpoint |
| --------- | ------------------ | -------------- |
| **ETH Balance** | Every block (~12s) | `GET /api/wallet/{address}/balance` |
| **Token Holdings** | Real-time | `GET /api/wallet/{address}/tokens` |
| **NFT Portfolio** | On transfer | `GET /api/nfts?owner={address}` |
| **Transaction History** | Instant | `GET /api/wallet/{address}/transactions` |
| **Gas Prices** | Every 15s | `GET /api/gas-prices` |

### WebSocket Real-Time Updates

```javascript
// Connect to real-time updates
const ws = new WebSocket('ws://localhost:8000/ws/');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Real-time update:', data);
};

// Subscribe to wallet updates
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'wallet',
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
}));
```

---

## 🧬 Content DNA System

### Genetic Code Features

| Feature | Description | API Endpoint |
| --------- | ------------- | -------------- |
| **DNA Generation** | Create unique genetic code | `POST /api/dna/generate` |
| **Breeding** | Combine two NFTs | `POST /api/dna/breed` |
| **Evolution** | Evolve over time | `POST /api/dna/evolve` |
| **Traits** | Get genetic traits | `GET /api/dna/{id}/traits` |

### DNA API Usage

```bash
# Generate DNA for new NFT
curl -X POST http://localhost:8000/api/dna/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "magical creature", "rarity": "legendary"}'

# Breed two NFTs
curl -X POST http://localhost:8000/api/dna/breed \
  -H "Content-Type: application/json" \
  -d '{"parent1": "dna_hash_1", "parent2": "dna_hash_2"}'
```

---

## 🛠️ Development Workflow

### 1. Making Changes

```bash
# Frontend changes (auto-reload)
# Edit files in frontend/src/
# Changes appear instantly at http://localhost:3000

# Backend changes (auto-reload)
# Edit files in backend/app/
# Server automatically restarts

# Smart contract changes
cd contracts
npx hardhat compile                    # Compile contracts
npx hardhat run scripts/deploy.js --network localhost  # Redeploy
```

### 2. Testing Changes

```bash
# Test backend changes
cd backend
python simple_test.py                 # Quick test
pytest                               # Full test suite

# Test frontend changes
cd frontend
npm test                             # Run tests

# Test smart contracts
cd contracts
npx hardhat test                     # Run all tests
npx hardhat test --grep "specific"   # Run specific tests
```

### 3. Debugging

```bash
# View logs
tail -f logs/backend.log             # Backend logs
tail -f logs/frontend.log            # Frontend logs
tail -f logs/hardhat.log             # Blockchain logs

# Check service status
ps aux | grep -E "(hardhat|uvicorn|vite)"

# Restart individual services
# Kill process and restart using controlBashProcess or start.sh
```

---

## 🔧 Troubleshooting

### Common Issues & Solutions

| Issue | Solution |
| ------- | ---------- |
| **Port already in use** | `./start.sh stop` then `./start.sh dev` |
| **Backend not responding** | Check `logs/backend.log` for errors |
| **Frontend not loading** | Clear browser cache, check `logs/frontend.log` |
| **MetaMask not connecting** | Add localhost:8545 network to MetaMask |
| **Contracts not deployed** | Run `npx hardhat run scripts/deploy.js --network localhost` |

### Service Health Checks

```bash
# Check if services are running
curl http://localhost:8000/health      # Backend health
curl http://localhost:3000             # Frontend health
curl -X POST http://localhost:8545 \   # Blockchain health
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```

---

## 🎯 Quick Usage Examples

### 1. Generate an NFT

```bash
# Step 1: Generate content
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A magical forest with glowing trees",
    "content_type": "image",
    "style": "fantasy"
  }'

# Step 2: Mint NFT (via frontend or direct contract call)
# Visit http://localhost:3000 and use the Generate page
```

### 2. Search Blockchain Data

```bash
# Search for a wallet
curl "http://localhost:8000/api/search?q=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

# Search for NFTs
curl "http://localhost:8000/api/search?q=magical&category=nfts"
```

### 3. Execute AI Agents

```bash
# Run single agent
curl -X POST http://localhost:8000/api/agents/execute \
  -H "Content-Type: application/json" \
  -d '{
    "agent_type": "IMAGE_GENERATOR",
    "prompt": "cyberpunk city",
    "parameters": {"style": "neon", "quality": "high"}
  }'

# Run all agents
curl -X POST http://localhost:8000/api/agents/execute \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "ALL_AGENTS",
    "prompt": "create a living digital pet"
  }'
```

---

## 📁 Project Structure

```text
DGC Platform/
├── 🔗 contracts/          # Smart contracts (Solidity)
│   ├── contracts/         # Contract source files
│   ├── scripts/          # Deployment scripts
│   ├── test/             # Contract tests
│   └── deployments/      # Deployed contract addresses
├── 🐍 backend/           # Python FastAPI backend
│   ├── app/              # Application code
│   │   ├── services/     # AI and blockchain services
│   │   ├── models.py     # Data models
│   │   └── api.py        # API routes
│   └── tests/            # Backend tests
├── ⚛️ frontend/          # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   └── hooks/        # Custom React hooks
│   └── public/           # Static assets
└── 📊 logs/              # Service logs
    ├── backend.log       # Backend service logs
    ├── frontend.log      # Frontend service logs
    ├── hardhat.log       # Blockchain logs
    └── deploy.log        # Contract deployment logs
```

---

## 🚀 Next Steps

1. **Visit the Frontend**: <http://localhost:3000>
2. **Explore the API**: <http://localhost:8000/docs>
3. **Connect MetaMask**: Add localhost:8545 network
4. **Generate Your First NFT**: Use the Generate page
5. **Explore AI Agents**: Try the 7-Block Agent Dashboard

---

## 📞 Support & Resources

- **Documentation**: All endpoints documented at <http://localhost:8000/docs>
- **Logs**: Check `logs/` directory for debugging
- **Test Accounts**: Use provided test accounts for development
- **Smart Contracts**: Deployed and ready for interaction

The DGC Platform is now fully operational! 🎉

Created by Sourav Rajak (morningstarxcdcode)
