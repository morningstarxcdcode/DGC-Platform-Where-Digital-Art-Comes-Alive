#!/bin/bash
#
# DGC Platform Startup Script
# Author: Sourav Rajak (morningstarxcdcode)
# Version: 1.0.0
#
# This script starts all services for the DGC Platform.
# Usage: ./start.sh [dev|prod|contracts-only]
#

set -e

# Terminal colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Project paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
CONTRACTS_DIR="$SCRIPT_DIR/contracts"

# Print header
print_header() {
    echo ""
    echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║  ${CYAN}DGC Platform - Decentralized Generative Content${PURPLE}             ║${NC}"
    echo -e "${PURPLE}║  ${NC}A revolutionary blockchain NFT marketplace${PURPLE}                   ║${NC}"
    echo -e "${PURPLE}║  ${NC}Author: Sourav Rajak (morningstarxcdcode)${PURPLE}                  ║${NC}"
    echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Check dependencies
check_deps() {
    echo -e "${YELLOW}[INFO]${NC} Checking dependencies..."
    
    # Load NVM if available
    export NVM_DIR="$HOME/.nvm"
    if [ -s "$NVM_DIR/nvm.sh" ]; then
        echo -e "${YELLOW}[INFO]${NC} Loading NVM..."
        \. "$NVM_DIR/nvm.sh"
        # Try to use a recent Node version
        nvm use node 2>/dev/null || nvm use default 2>/dev/null || true
    fi
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}[ERROR]${NC} Node.js not found. Please install Node.js 18+."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}[ERROR]${NC} npm not found. Please install npm."
        exit 1
    fi
    
    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}[ERROR]${NC} Python3 not found. Please install Python 3.10+."
        exit 1
    fi
    
    echo -e "${GREEN}[OK]${NC} All dependencies found. Node $(node --version), npm $(npm --version)"
}

# Start local blockchain (Hardhat node)
start_blockchain() {
    echo -e "${YELLOW}[INFO]${NC} Starting local Hardhat blockchain..."
    cd "$CONTRACTS_DIR"
    
    # Kill any existing node
    pkill -f "hardhat node" 2>/dev/null || true
    sleep 1
    
    # Start the node in background
    npx hardhat node > "$SCRIPT_DIR/logs/hardhat.log" 2>&1 &
    HARDHAT_PID=$!
    echo $HARDHAT_PID > "$SCRIPT_DIR/.hardhat.pid"
    
    sleep 5
    
    if ps -p $HARDHAT_PID > /dev/null; then
        echo -e "${GREEN}[OK]${NC} Hardhat node started on http://localhost:8545"
    else
        echo -e "${RED}[ERROR]${NC} Failed to start Hardhat node"
        exit 1
    fi
}

# Deploy contracts
deploy_contracts() {
    echo -e "${YELLOW}[INFO]${NC} Deploying smart contracts..."
    cd "$CONTRACTS_DIR"
    
    npx hardhat run scripts/deploy.js --network localhost > "$SCRIPT_DIR/logs/deploy.log" 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}[OK]${NC} Contracts deployed successfully"
    else
        echo -e "${RED}[ERROR]${NC} Contract deployment failed. Check logs/deploy.log"
        exit 1
    fi
}

# Start backend
start_backend() {
    echo -e "${YELLOW}[INFO]${NC} Starting backend server..."
    cd "$BACKEND_DIR"
    
    # Kill any existing backend
    pkill -f "uvicorn.*app.api:app" 2>/dev/null || true
    sleep 1

    # Activate virtual env if exists (check multiple locations)
    if [ -f "$SCRIPT_DIR/.venv/bin/activate" ]; then
        source "$SCRIPT_DIR/.venv/bin/activate"
        echo -e "${GREEN}[OK]${NC} Using virtual environment from project root"
    elif [ -f "$BACKEND_DIR/.venv/bin/activate" ]; then
        source "$BACKEND_DIR/.venv/bin/activate"
    elif [ -f "$BACKEND_DIR/venv/bin/activate" ]; then
        source "$BACKEND_DIR/venv/bin/activate"
    fi

    # Start backend with correct module path
    python3 -m uvicorn app.api:app --host 0.0.0.0 --port 8000 --reload > "$SCRIPT_DIR/logs/backend.log" 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > "$SCRIPT_DIR/.backend.pid"
    
    sleep 3
    
    if ps -p $BACKEND_PID > /dev/null; then
        echo -e "${GREEN}[OK]${NC} Backend started on http://localhost:8000"
        echo -e "${GREEN}[OK]${NC} API docs at http://localhost:8000/docs"
    else
        echo -e "${RED}[ERROR]${NC} Failed to start backend. Check logs/backend.log"
        exit 1
    fi
}

# Start frontend
start_frontend() {
    echo -e "${YELLOW}[INFO]${NC} Starting frontend development server..."
    cd "$FRONTEND_DIR"
    
    # Kill any existing frontend
    pkill -f "vite" 2>/dev/null || true
    sleep 1
    
    # Start frontend
    npm run dev > "$SCRIPT_DIR/logs/frontend.log" 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > "$SCRIPT_DIR/.frontend.pid"
    
    sleep 3
    
    if ps -p $FRONTEND_PID > /dev/null; then
        echo -e "${GREEN}[OK]${NC} Frontend started on http://localhost:5173"
    else
        echo -e "${RED}[ERROR]${NC} Failed to start frontend"
        exit 1
    fi
}

# Stop all services
stop_all() {
    echo -e "${YELLOW}[INFO]${NC} Stopping all services..."
    
    if [ -f "$SCRIPT_DIR/.hardhat.pid" ]; then
        kill $(cat "$SCRIPT_DIR/.hardhat.pid") 2>/dev/null || true
        rm "$SCRIPT_DIR/.hardhat.pid"
    fi
    
    if [ -f "$SCRIPT_DIR/.backend.pid" ]; then
        kill $(cat "$SCRIPT_DIR/.backend.pid") 2>/dev/null || true
        rm "$SCRIPT_DIR/.backend.pid"
    fi
    
    if [ -f "$SCRIPT_DIR/.frontend.pid" ]; then
        kill $(cat "$SCRIPT_DIR/.frontend.pid") 2>/dev/null || true
        rm "$SCRIPT_DIR/.frontend.pid"
    fi
    
    # Kill any remaining processes
    pkill -f "hardhat node" 2>/dev/null || true
    pkill -f "uvicorn.*main:app" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    
    echo -e "${GREEN}[OK]${NC} All services stopped"
}

# Print status
print_status() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}All services are running!${NC}"
    echo ""
    echo -e "  ${BLUE}Blockchain:${NC}   http://localhost:8545"
    echo -e "  ${BLUE}Backend API:${NC}  http://localhost:8000"
    echo -e "  ${BLUE}API Docs:${NC}     http://localhost:8000/docs"
    echo -e "  ${BLUE}Frontend:${NC}     http://localhost:5173"
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "Logs are available in the logs/ directory."
    echo -e "Press Ctrl+C to stop all services."
    echo ""
}

# Main execution
main() {
    print_header
    
    # Create logs directory
    mkdir -p "$SCRIPT_DIR/logs"
    
    MODE=${1:-dev}
    
    case $MODE in
        dev)
            check_deps
            start_blockchain
            deploy_contracts
            start_backend
            start_frontend
            print_status
            
            # Wait for user interrupt
            trap stop_all EXIT
            while true; do sleep 1; done
            ;;
        prod)
            check_deps
            start_backend
            start_frontend
            print_status
            
            trap stop_all EXIT
            while true; do sleep 1; done
            ;;
        contracts-only)
            check_deps
            start_blockchain
            deploy_contracts
            echo -e "${GREEN}[OK]${NC} Contracts deployed. Node running on http://localhost:8545"
            
            trap stop_all EXIT
            while true; do sleep 1; done
            ;;
        stop)
            stop_all
            ;;
        *)
            echo "Usage: $0 [dev|prod|contracts-only|stop]"
            echo ""
            echo "  dev            - Start all services (blockchain + backend + frontend)"
            echo "  prod           - Start backend and frontend only (no local blockchain)"
            echo "  contracts-only - Start blockchain and deploy contracts only"
            echo "  stop           - Stop all running services"
            exit 1
            ;;
    esac
}

main "$@"
