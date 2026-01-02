# DGC Backend Service

Backend service for the Decentralized Generative Content Platform, providing AI content generation, IPFS integration, and blockchain event monitoring.

## Features

- **AI Content Generation**: Stable Diffusion for images, GPT for text, MusicGen for audio
- **IPFS Integration**: Decentralized content storage and retrieval
- **Blockchain Integration**: Event monitoring and smart contract interaction
- **RESTful API**: FastAPI-based API gateway
- **Property-Based Testing**: Comprehensive testing with Hypothesis

## Quick Start

### Prerequisites

- Python 3.9+
- CUDA-compatible GPU (recommended for AI generation)
- PostgreSQL database
- Redis server
- IPFS node

### Installation

1. Create virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Run database migrations:

   ```bash
   alembic upgrade head
   ```

### Development

Start the development server:

```bash
python main.py
```

Or with uvicorn directly:

```bash
uvicorn app.api:app --reload --host 0.0.0.0 --port 8000
```

### Testing

Run all tests:

```bash
pytest
```

Run specific test categories:

```bash
pytest -m unit          # Unit tests only
pytest -m integration   # Integration tests only
pytest -m property      # Property-based tests only
```

Run with coverage:

```bash
pytest --cov=app --cov-report=html
```

## API Documentation

When running in development mode, API documentation is available at:

- Swagger UI: <http://localhost:8000/docs>
- ReDoc: <http://localhost:8000/redoc>

## Configuration

All configuration is managed through environment variables. See `.env.example` for available options.

Key configuration areas:

- **Database**: PostgreSQL connection settings
- **AI Models**: Model paths and HuggingFace tokens
- **IPFS**: Node connection and pinning service
- **Blockchain**: Ethereum RPC and contract addresses
- **Security**: JWT tokens and rate limiting

## Architecture

```text
app/
├── api.py              # FastAPI application setup
├── config.py           # Configuration management
├── models/             # Database models
├── services/           # Business logic services
│   ├── ai/            # AI generation services
│   ├── ipfs/          # IPFS integration
│   └── blockchain/    # Blockchain services
├── routers/           # API route handlers
└── utils/             # Utility functions
```

## Development Guidelines

- Use type hints for all functions
- Follow PEP 8 style guidelines
- Write property-based tests for core logic
- Use structured logging with structlog
- Handle errors gracefully with proper HTTP status codes

## Deployment

The service can be deployed using:

- Docker containers
- Kubernetes
- Traditional server deployment

See the main project README for deployment instructions.
