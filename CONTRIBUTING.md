# Contributing to DGC Platform

Thank you for your interest in contributing to the Decentralized Generative Content Platform! This document provides guidelines and information for contributors.

## 🚀 Quick Start for Contributors

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+ and pip
- **Git** for version control
- **MetaMask** browser extension (for testing)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/morningstarxcdcode/DGC-Platform-Where-Digital-Art-Comes-Alive.git
   cd DGC-Platform-Where-Digital-Art-Comes-Alive
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Start development environment**
   ```bash
   ./start.sh dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs
   - Blockchain: http://localhost:8545

## 📁 Project Structure

```
DGC Platform/
├── frontend/          # React + Vite frontend
├── backend/           # Python FastAPI backend
├── contracts/         # Solidity smart contracts
├── .github/           # GitHub Actions workflows
└── docs/              # Documentation
```

## 🛠️ Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- **Frontend**: Edit files in `frontend/src/`
- **Backend**: Edit files in `backend/app/`
- **Contracts**: Edit files in `contracts/contracts/`

### 3. Test Your Changes

```bash
# Test all components
npm test

# Test individual components
npm run test:frontend
npm run test:backend
npm run test:contracts
```

### 4. Run Code Quality Checks

```bash
# Frontend build check
cd frontend && npm run build

# Backend import check
cd backend && python -c "from app.api import app"

# Contract compilation
cd contracts && npm run build
```

### 5. Commit and Push

```bash
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

### 6. Create Pull Request

- Go to GitHub and create a pull request
- Fill out the PR template
- Wait for CI/CD checks to pass
- Request review from maintainers

## 🧪 Testing Guidelines

### Frontend Testing
- Use Vitest for unit tests
- Test React components with @testing-library/react
- Place tests in `frontend/src/__tests__/`

### Backend Testing
- Use pytest for unit and integration tests
- Use Hypothesis for property-based testing
- Place tests in `backend/tests/`

### Smart Contract Testing
- Use Hardhat for JavaScript tests
- Use Foundry for Solidity tests
- Place tests in `contracts/test/`

## 📝 Code Style Guidelines

### Frontend (JavaScript/React)
- Use modern ES6+ syntax
- Follow React best practices
- Use functional components with hooks
- Implement proper error boundaries

### Backend (Python)
- Follow PEP 8 style guide
- Use type hints with Pydantic models
- Implement proper error handling
- Use async/await for I/O operations

### Smart Contracts (Solidity)
- Follow Solidity style guide
- Use OpenZeppelin contracts when possible
- Implement proper access controls
- Add comprehensive NatSpec documentation

## 🔒 Security Guidelines

### General Security
- Never commit private keys or secrets
- Use environment variables for configuration
- Validate all user inputs
- Implement proper authentication

### Smart Contract Security
- Follow security best practices
- Implement reentrancy protection
- Use safe math operations
- Add proper access controls

### API Security
- Validate all inputs with Pydantic
- Implement rate limiting
- Use HTTPS in production
- Sanitize all outputs

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment**: OS, Node.js version, Python version
2. **Steps to reproduce**: Clear step-by-step instructions
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happens
5. **Screenshots**: If applicable
6. **Logs**: Any error messages or console output

## 💡 Feature Requests

When requesting features, please include:

1. **Problem**: What problem does this solve?
2. **Solution**: Describe your proposed solution
3. **Alternatives**: Any alternative solutions considered
4. **Use cases**: How would this be used?
5. **Priority**: How important is this feature?

## 📋 Pull Request Guidelines

### PR Title Format
- `feat: add new feature`
- `fix: resolve bug in component`
- `docs: update documentation`
- `test: add missing tests`
- `refactor: improve code structure`

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added new tests for changes
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

## 🏗️ Architecture Guidelines

### Frontend Architecture
- Use React functional components
- Implement custom hooks for reusable logic
- Use context for global state management
- Implement proper error boundaries

### Backend Architecture
- Follow FastAPI best practices
- Use dependency injection
- Implement proper service layer
- Use async/await for database operations

### Smart Contract Architecture
- Use proxy patterns for upgradability
- Implement proper access controls
- Use events for off-chain monitoring
- Follow gas optimization practices

## 📚 Resources

### Documentation
- [React Documentation](https://react.dev/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Hardhat Documentation](https://hardhat.org/docs)

### Tools
- [Vite](https://vitejs.dev/) - Frontend build tool
- [Vitest](https://vitest.dev/) - Frontend testing
- [pytest](https://pytest.org/) - Backend testing
- [Foundry](https://book.getfoundry.sh/) - Smart contract testing

## 🤝 Community

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Pull Requests**: Code contributions

### Code of Conduct
- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow community guidelines

## 📄 License

By contributing to DGC Platform, you agree that your contributions will be licensed under the MIT License.

---

**Happy Contributing! 🎉**

For questions, please open an issue or start a discussion on GitHub.