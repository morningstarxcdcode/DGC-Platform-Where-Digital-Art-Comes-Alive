#!/bin/bash

# DGC Platform - Final Validation Script
# Validates project structure and readiness for GitHub deployment

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 DGC Platform - Final Validation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $2"
        ((PASSED++))
    else
        echo -e "${RED}❌${NC} $2"
        ((FAILED++))
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅${NC} $2"
        ((PASSED++))
    else
        echo -e "${RED}❌${NC} $2"
        ((FAILED++))
    fi
}

# Root Structure
echo "📁 Root Structure:"
check_file "README.md" "README.md exists"
check_file "LICENSE" "LICENSE file exists"
check_file "package.json" "Root package.json exists"
check_file ".gitignore" ".gitignore configured"
check_file "SETUP_AND_RUN_GUIDE.md" "Setup guide exists"
check_file "start.sh" "Start script exists"
echo ""

# Frontend
echo "🎨 Frontend:"
check_dir "frontend" "Frontend directory exists"
check_file "frontend/package.json" "Frontend package.json exists"
check_file "frontend/vite.config.js" "Vite config exists"
check_file "frontend/index.html" "HTML entry point exists"
check_dir "frontend/src" "Frontend source directory exists"
echo ""

# Backend
echo "🔧 Backend:"
check_dir "backend" "Backend directory exists"
check_file "backend/requirements.txt" "Backend requirements.txt exists"
check_file "backend/main.py" "Backend main.py exists"
check_file "backend/pytest.ini" "Pytest config exists"
check_dir "backend/app" "Backend app directory exists"
check_dir "backend/tests" "Backend tests directory exists"
echo ""

# Contracts
echo "⛓️  Smart Contracts:"
check_dir "contracts" "Contracts directory exists"
check_file "contracts/package.json" "Contracts package.json exists"
check_file "contracts/hardhat.config.js" "Hardhat config exists"
check_file "contracts/foundry.toml" "Foundry config exists"
check_dir "contracts/contracts" "Contract source directory exists"
check_file "contracts/contracts/DGCToken.sol" "DGCToken contract exists"
check_file "contracts/contracts/Marketplace.sol" "Marketplace contract exists"
echo ""

# GitHub Workflows
echo "🔄 GitHub Workflows:"
check_dir ".github/workflows" "Workflows directory exists"
check_file ".github/workflows/ci-complete.yml" "Complete CI/CD workflow exists"
check_file ".github/workflows/deploy-github-pages.yml" "GitHub Pages deployment workflow exists"
check_file ".github/workflows/release.yml" "Release workflow exists"
echo ""

# Documentation
echo "📚 Documentation:"
check_file "CONTRIBUTING.md" "Contributing guide exists"
check_file "SECURITY.md" "Security policy exists"
check_file "CHANGELOG.md" "Changelog exists"
echo ""

# Check for unwanted files
echo "🧹 Checking for unwanted files:"
UNWANTED_COUNT=0

if [ -f "cleanup-project.py" ]; then
    echo -e "${YELLOW}⚠️${NC}  cleanup-project.py should be removed"
    ((UNWANTED_COUNT++))
fi

if [ -f "simple-validation.py" ]; then
    echo -e "${YELLOW}⚠️${NC}  simple-validation.py should be removed"
    ((UNWANTED_COUNT++))
fi

if [ -f "final-validation.py" ]; then
    echo -e "${YELLOW}⚠️${NC}  final-validation.py should be removed"
    ((UNWANTED_COUNT++))
fi

if [ $UNWANTED_COUNT -eq 0 ]; then
    echo -e "${GREEN}✅${NC} No unwanted files found"
    ((PASSED++))
else
    ((FAILED++))
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Validation Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "✅ Passed: ${GREEN}$PASSED${NC}"
echo -e "❌ Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! Project is ready for GitHub deployment.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Review your changes: git status"
    echo "2. Commit changes: git add . && git commit -m 'Final updates'"
    echo "3. Push to GitHub: git push origin main"
    exit 0
else
    echo -e "${RED}⚠️  Some checks failed. Please fix the issues before deployment.${NC}"
    exit 1
fi
