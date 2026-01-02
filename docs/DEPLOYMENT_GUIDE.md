# 🚀 DGC Platform - Complete Deployment Guide

**Author: Sourav Rajak (morningstarxcdcode)**  
**Version: 1.0.0**  
**Last Updated: January 2, 2026**

## 📋 Table of Contents

1. [Quick Deployment](#quick-deployment)
2. [Local Development](#local-development)
3. [GitHub Pages Deployment](#github-pages-deployment)
4. [Docker Deployment](#docker-deployment)
5. [Production Deployment](#production-deployment)
6. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Deployment

### One-Command Setup

```bash
# Clone and setup everything
git clone https://github.com/morningstarxcdcode/DGC-Platform-Where-Digital-Art-Comes-Alive.git
cd DGC-Platform-Where-Digital-Art-Comes-Alive
npm run install:all
./start.sh dev
```

### Access Points
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Blockchain**: http://localhost:8545

---

## 💻 Local Development

### Prerequisites

```bash
# Required software
node --version    # v18+ required
npm --version     # v9+ required  
python --version  # v3.11+ required
pip --version     # Latest version
git --version     # Latest version
```

### Step-by-Step Setup

#### 1. Clone Repository
```bash
git clone https://github.com/morningstarxcdcode/DGC-Platform-Where-Digital-Art-Comes-Alive.git
cd DGC-Platform-Where-Digital-Art-Comes-Alive
```

#### 2. Install Dependencies
```bash
# Install all dependencies at once
npm run install:all

# Or install individually
npm install                              # Root dependencies
cd contracts && npm install             # Smart contracts
cd ../frontend && npm install           # Frontend
cd ../backend && pip install -r requirements.txt  # Backend
```

#### 3. Environment Configuration
```bash
# Copy environment templates
cp .env.example .env
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
cp contracts/.env.example contracts/.env

# Edit environment files as needed
```

#### 4. Start Services

**Option A: All Services**
```bash
./start.sh dev
```

**Option B: Individual Services**
```bash
# Terminal 1: Blockchain
cd contracts && npm run node

# Terminal 2: Backend (wait 5 seconds)
cd backend && uvicorn app.api:app --reload

# Terminal 3: Frontend (wait 8 seconds)  
cd frontend && npm run dev
```

#### 5. Verify Installation
```bash
# Run comprehensive tests
./run-all-tests.sh

# Or test individual components
npm run test:frontend
npm run test:backend  
npm run test:contracts
```

---

## 🌐 GitHub Pages Deployment

### Automatic Deployment

The project includes GitHub Actions for automatic deployment to GitHub Pages.

#### Setup Steps

1. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: "GitHub Actions"
   - Save settings

2. **Configure Secrets** (if needed)
   ```
   GITHUB_TOKEN: (automatically provided)
   ```

3. **Deploy**
   ```bash
   # Push to main branch triggers deployment
   git push origin main
   ```

#### Manual Deployment

```bash
# Build frontend for production
cd frontend
npm ci
npm run build

# Deploy using GitHub CLI (optional)
gh workflow run deploy-pages.yml
```

### Custom Domain Setup

1. **Add CNAME file**
   ```bash
   echo "your-domain.com" > frontend/public/CNAME
   ```

2. **Update workflow**
   ```yaml
   # In .github/workflows/deploy-pages.yml
   - name: Deploy to GitHub Pages
     uses: peaceiris/actions-gh-pages@v3
     with:
       github_token: ${{ secrets.GITHUB_TOKEN }}
       publish_dir: ./frontend/dist
       cname: your-domain.com
   ```

---

## 🐳 Docker Deployment

### Development with Docker

```bash
# Start all services with Docker
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production with Docker

```bash
# Use production configuration
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

### Docker Configuration

#### Frontend Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

#### Backend Dockerfile
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.api:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 🏭 Production Deployment

### Infrastructure Requirements

#### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **Network**: 100 Mbps

#### Recommended Requirements
- **CPU**: 4 cores
- **RAM**: 8GB
- **Storage**: 50GB SSD
- **Network**: 1 Gbps

### Cloud Deployment Options

#### Option 1: Vercel (Frontend Only)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

#### Option 2: Railway (Full Stack)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
railway login
railway init
railway up
```

#### Option 3: AWS/GCP/Azure
```bash
# Use Docker containers
docker build -t dgc-frontend ./frontend
docker build -t dgc-backend ./backend

# Deploy to container service
# (specific commands depend on cloud provider)
```

### Environment Variables

#### Production Environment Variables
```bash
# Frontend (.env.production)
VITE_API_URL=https://api.your-domain.com
VITE_BLOCKCHAIN_RPC=https://mainnet.infura.io/v3/YOUR_KEY
VITE_ENVIRONMENT=production

# Backend (.env.production)
DATABASE_URL=postgresql://user:pass@host:5432/dgc_prod
REDIS_URL=redis://host:6379/0
IPFS_API_URL=https://ipfs.infura.io:5001
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
CORS_ORIGINS=["https://your-domain.com"]
```

### Database Setup

#### PostgreSQL Setup
```sql
-- Create database
CREATE DATABASE dgc_platform;
CREATE USER dgc_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE dgc_platform TO dgc_user;

-- Run migrations
cd backend
alembic upgrade head
```

#### Redis Setup
```bash
# Install Redis
sudo apt install redis-server

# Configure Redis
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

### SSL/TLS Configuration

#### Let's Encrypt (Free SSL)
```bash
# Install Certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Monitoring and Logging

#### Application Monitoring
```bash
# Install monitoring tools
pip install prometheus-client
npm install @prometheus/client

# Configure logging
# (see backend/app/config.py for logging configuration)
```

---

## 🔧 Troubleshooting

### Common Issues

#### Issue 1: Node.js Version Mismatch
```bash
# Check version
node --version

# Install correct version
nvm install 18
nvm use 18
```

#### Issue 2: Python Dependencies
```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# or
.venv\Scripts\activate     # Windows

# Install dependencies
pip install -r backend/requirements.txt
```

#### Issue 3: Port Already in Use
```bash
# Find process using port
lsof -i :8000  # Backend port
lsof -i :5173  # Frontend port

# Kill process
kill -9 <PID>
```

#### Issue 4: MetaMask Connection Issues
```javascript
// Check MetaMask installation
if (typeof window.ethereum !== 'undefined') {
  console.log('MetaMask is installed!');
} else {
  console.log('Please install MetaMask');
}

// Switch to correct network
await window.ethereum.request({
  method: 'wallet_switchEthereumChain',
  params: [{ chainId: '0x7A69' }], // Local network
});
```

#### Issue 5: IPFS Connection Issues
```bash
# Check IPFS daemon
ipfs daemon

# Test connection
curl http://localhost:5001/api/v0/version
```

### Performance Optimization

#### Frontend Optimization
```bash
# Analyze bundle size
cd frontend
npm run build
npx vite-bundle-analyzer dist

# Optimize images
npm install imagemin imagemin-webp
```

#### Backend Optimization
```python
# Enable async database connections
# Use connection pooling
# Implement caching with Redis
# Add request rate limiting
```

#### Smart Contract Optimization
```solidity
// Use gas-efficient patterns
// Minimize storage operations
// Batch operations when possible
// Use events for off-chain data
```

### Debugging Tools

#### Frontend Debugging
```bash
# React Developer Tools
# Redux DevTools (if using Redux)
# Browser Network tab
# Console logging
```

#### Backend Debugging
```bash
# FastAPI automatic docs: /docs
# Python debugger: pdb
# Logging configuration
# Database query logging
```

#### Smart Contract Debugging
```bash
# Hardhat console
npx hardhat console

# Foundry debugging
forge test -vvv

# Transaction tracing
# Event monitoring
```

---

## 📊 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] SSL certificates obtained
- [ ] Domain DNS configured
- [ ] Monitoring setup
- [ ] Backup strategy implemented

### Deployment
- [ ] Code deployed to production
- [ ] Database migrations applied
- [ ] Services started and healthy
- [ ] Load balancer configured
- [ ] CDN setup (if applicable)
- [ ] Monitoring alerts active

### Post-Deployment
- [ ] Smoke tests completed
- [ ] Performance metrics baseline
- [ ] Error tracking active
- [ ] User acceptance testing
- [ ] Documentation updated
- [ ] Team notified

---

## 🎯 Success Metrics

### Performance Targets
- **Frontend Load Time**: < 3 seconds
- **API Response Time**: < 200ms
- **Transaction Confirmation**: < 30 seconds
- **Uptime**: > 99.9%

### Monitoring Dashboards
- Application performance monitoring
- Infrastructure monitoring
- Business metrics tracking
- User experience monitoring

---

**🎉 Congratulations! Your DGC Platform is now deployed and ready to revolutionize the NFT space!**

For support, please check our [GitHub Issues](https://github.com/morningstarxcdcode/DGC-Platform-Where-Digital-Art-Comes-Alive/issues) or contact the maintainer.