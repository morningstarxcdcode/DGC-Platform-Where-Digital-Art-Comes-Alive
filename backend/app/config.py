"""
Configuration management for the DGC backend service.
"""

import os
from typing import List, Optional
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    # Environment
    environment: str = Field(default="development", description="Environment name")
    debug: bool = Field(default=False, description="Debug mode")
    log_level: str = Field(default="INFO", description="Logging level")

    # API Configuration
    api_host: str = Field(default="0.0.0.0", description="API host")
    api_port: int = Field(default=8000, description="API port")
    api_workers: int = Field(default=1, description="Number of API workers")
    cors_origins: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:5173"],
        description="CORS allowed origins"
    )

    # Database
    database_url: str = Field(
        default="postgresql+asyncpg://user:password@localhost:5432/dgc_platform",
        description="Database connection URL"
    )
    database_pool_size: int = Field(default=10, description="Database connection pool size")
    database_max_overflow: int = Field(default=20, description="Database max overflow connections")

    # Redis
    redis_url: str = Field(default="redis://localhost:6379/0", description="Redis connection URL")

    # IPFS Configuration
    ipfs_api_url: str = Field(default="http://localhost:5001", description="IPFS API URL")
    ipfs_gateway_url: str = Field(default="http://localhost:8080", description="IPFS Gateway URL")
    ipfs_pin_service_url: Optional[str] = Field(default=None, description="IPFS pinning service URL")
    ipfs_pin_service_jwt: Optional[str] = Field(default=None, description="IPFS pinning service JWT")

    # AI Model Configuration
    ai_models_path: str = Field(default="./models", description="Path to AI models")
    huggingface_token: Optional[str] = Field(default=None, description="HuggingFace API token")
    stable_diffusion_model: str = Field(
        default="stabilityai/stable-diffusion-xl-base-1.0",
        description="Stable Diffusion model name"
    )
    gpt_model: str = Field(
        default="microsoft/DialoGPT-medium",
        description="GPT model name"
    )
    music_model: str = Field(
        default="facebook/musicgen-small",
        description="Music generation model name"
    )

    # GPU Configuration
    cuda_visible_devices: str = Field(default="0", description="CUDA visible devices")
    torch_device: str = Field(default="cuda", description="PyTorch device")
    model_cache_dir: str = Field(default="./cache", description="Model cache directory")

    # Blockchain Configuration
    ethereum_rpc_url: str = Field(
        default="http://localhost:8545",
        description="Ethereum RPC URL"
    )
    ethereum_chain_id: int = Field(default=31337, description="Ethereum chain ID")
    contract_address_dgc_token: Optional[str] = Field(
        default=None,
        description="DGC Token contract address"
    )
    contract_address_provenance_registry: Optional[str] = Field(
        default=None,
        description="Provenance Registry contract address"
    )
    contract_address_royalty_splitter: Optional[str] = Field(
        default=None,
        description="Royalty Splitter contract address"
    )
    contract_address_marketplace: Optional[str] = Field(
        default=None,
        description="Marketplace contract address"
    )

    # Security
    secret_key: str = Field(
        default="your-secret-key-here",
        description="Secret key for JWT tokens"
    )
    access_token_expire_minutes: int = Field(
        default=30,
        description="Access token expiration time in minutes"
    )
    algorithm: str = Field(default="HS256", description="JWT algorithm")

    # Rate Limiting
    rate_limit_requests_per_minute: int = Field(
        default=60,
        description="Rate limit requests per minute"
    )
    rate_limit_burst: int = Field(default=10, description="Rate limit burst size")

    # Monitoring
    prometheus_port: int = Field(default=9090, description="Prometheus metrics port")
    sentry_dsn: Optional[str] = Field(default=None, description="Sentry DSN for error tracking")

    # Content Generation Limits
    max_prompt_length: int = Field(default=1000, description="Maximum prompt length")
    max_generation_time_seconds: int = Field(
        default=60,
        description="Maximum generation time in seconds"
    )
    max_content_size_mb: int = Field(default=50, description="Maximum content size in MB")
    concurrent_generations: int = Field(
        default=4,
        description="Maximum concurrent generations"
    )

    @property
    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.environment.lower() == "development"

    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.environment.lower() == "production"

    @property
    def is_testing(self) -> bool:
        """Check if running in testing environment."""
        return self.environment.lower() == "testing"


# Global settings instance
settings = Settings()


def get_settings() -> Settings:
    """Get the global settings instance."""
    return settings