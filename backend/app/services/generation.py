"""
AI Generation Service for the DGC Platform.

This module provides the core AI generation functionality including
image generation with Stable Diffusion and text generation with GPT-like models.
"""

from dataclasses import dataclass, field
from typing import Dict, Any, Optional, List, Union
from enum import Enum
import hashlib
import time
import asyncio
import uuid
from datetime import datetime
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class GenerationStatus(Enum):
    """Status of a generation job."""
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    TIMEOUT = "TIMEOUT"


class ContentType(Enum):
    """Supported content types for generation."""
    IMAGE = "IMAGE"
    TEXT = "TEXT"
    MUSIC = "MUSIC"


@dataclass
class GenerationRequest:
    """
    Request for AI content generation.

    Attributes:
        prompt: The text prompt for generation
        content_type: Type of content to generate (IMAGE, TEXT, MUSIC)
        seed: Optional seed for reproducible generation
        parameters: Additional parameters for generation
        creator_address: Ethereum address of the creator
        timeout: Maximum time allowed for generation in seconds (default 60)
    """
    prompt: str
    content_type: ContentType
    creator_address: str
    seed: Optional[int] = None
    parameters: Dict[str, Any] = field(default_factory=dict)
    timeout: int = 60

    def __post_init__(self):
        """Validate request parameters."""
        if not self.prompt or not self.prompt.strip():
            raise ValueError("Prompt cannot be empty")
        if not self.creator_address or not self.creator_address.startswith("0x"):
            raise ValueError("Invalid creator address")
        if self.timeout <= 0 or self.timeout > 300:
            raise ValueError("Timeout must be between 1 and 300 seconds")


@dataclass
class GenerationResult:
    """
    Result of AI content generation.

    Attributes:
        job_id: Unique identifier for the generation job
        status: Current status of the generation
        content: Generated content (bytes for images, string for text)
        content_hash: SHA-256 hash of the generated content
        model_version: Version of the AI model used
        prompt: Original prompt used for generation
        seed: Seed used for generation (for reproducibility)
        parameters: Parameters used for generation
        timestamp: Unix timestamp of generation completion
        generation_time_ms: Time taken for generation in milliseconds
        error: Error message if generation failed
    """
    job_id: str
    status: GenerationStatus
    content: Optional[Union[bytes, str]] = None
    content_hash: Optional[str] = None
    model_version: Optional[str] = None
    prompt: Optional[str] = None
    seed: Optional[int] = None
    parameters: Optional[Dict[str, Any]] = None
    timestamp: Optional[int] = None
    generation_time_ms: Optional[int] = None
    error: Optional[str] = None

    def is_complete(self) -> bool:
        """Check if generation result has all required fields (Property 1)."""
        if self.status != GenerationStatus.COMPLETED:
            return False

        required_fields = [
            self.content is not None,
            self.content_hash is not None,
            self.model_version is not None,
            self.prompt is not None,
            self.seed is not None,
            self.parameters is not None,
            self.timestamp is not None
        ]
        return all(required_fields)

    def to_dict(self) -> Dict[str, Any]:
        """Convert result to dictionary for JSON serialization."""
        return {
            "job_id": self.job_id,
            "status": self.status.value,
            "content_hash": self.content_hash,
            "model_version": self.model_version,
            "prompt": self.prompt,
            "seed": self.seed,
            "parameters": self.parameters,
            "timestamp": self.timestamp,
            "generation_time_ms": self.generation_time_ms,
            "error": self.error
        }


class GenerationService:
    """
    Core service for AI content generation.

    This service handles generation requests, manages jobs, and returns results.
    It supports image generation with Stable Diffusion and text generation with GPT.
    """

    # Model versions (simulated for now)
    IMAGE_MODEL_VERSION = "stable-diffusion-xl-1.0"
    TEXT_MODEL_VERSION = "gpt-4-turbo"
    MUSIC_MODEL_VERSION = "musicgen-large"

    def __init__(self):
        """Initialize the generation service."""
        self._jobs: Dict[str, GenerationResult] = {}
        self._image_model = None
        self._text_model = None
        self._music_model = None

    def _get_model_version(self, content_type: ContentType) -> str:
        """Get the model version for a content type."""
        if content_type == ContentType.IMAGE:
            return self.IMAGE_MODEL_VERSION
        elif content_type == ContentType.TEXT:
            return self.TEXT_MODEL_VERSION
        elif content_type == ContentType.MUSIC:
            return self.MUSIC_MODEL_VERSION
        else:
            raise ValueError(f"Unsupported content type: {content_type}")

    def _generate_seed(self) -> int:
        """Generate a random seed if not provided."""
        return int(time.time() * 1000) % (2**32)

    def _compute_content_hash(self, content: Union[bytes, str]) -> str:
        """Compute SHA-256 hash of content."""
        if isinstance(content, str):
            content = content.encode('utf-8')
        return "0x" + hashlib.sha256(content).hexdigest()

    async def generate(self, request: GenerationRequest) -> GenerationResult:
        """
        Generate content based on the request.

        Args:
            request: The generation request

        Returns:
            GenerationResult with the generated content

        Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
        """
        job_id = str(uuid.uuid4())
        start_time = time.time()

        # Create initial result
        result = GenerationResult(
            job_id=job_id,
            status=GenerationStatus.IN_PROGRESS,
            prompt=request.prompt,
            seed=request.seed if request.seed is not None else self._generate_seed(),
            parameters=request.parameters,
            model_version=self._get_model_version(request.content_type)
        )

        self._jobs[job_id] = result

        try:
            # Apply timeout (Requirement 1.4: 60 second limit)
            # Use asyncio.wait_for for compatibility with Python 3.9+
            async def generate_with_timeout():
                seed = result.seed if result.seed is not None else self._generate_seed()
                if request.content_type == ContentType.IMAGE:
                    return await self._generate_image(request.prompt, seed, request.parameters)
                elif request.content_type == ContentType.TEXT:
                    return await self._generate_text(request.prompt, seed, request.parameters)
                elif request.content_type == ContentType.MUSIC:
                    return await self._generate_music(request.prompt, seed, request.parameters)
                else:
                    raise ValueError(f"Unsupported content type: {request.content_type}")

            content = await asyncio.wait_for(generate_with_timeout(), timeout=request.timeout)

            # Calculate generation time
            generation_time_ms = int((time.time() - start_time) * 1000)

            # Update result with success
            result.status = GenerationStatus.COMPLETED
            result.content = content
            result.content_hash = self._compute_content_hash(content)
            result.timestamp = int(time.time())
            result.generation_time_ms = generation_time_ms

            logger.info(f"Generation completed: job_id={job_id}, time={generation_time_ms}ms")

        except asyncio.TimeoutError:
            result.status = GenerationStatus.TIMEOUT
            result.error = f"Generation timed out after {request.timeout} seconds"
            logger.error(f"Generation timeout: job_id={job_id}")

        except Exception as e:
            result.status = GenerationStatus.FAILED
            result.error = str(e)
            logger.error(f"Generation failed: job_id={job_id}, error={e}")

        self._jobs[job_id] = result
        return result

    async def _generate_image(
        self,
        prompt: str,
        seed: int,
        parameters: Dict[str, Any]
    ) -> bytes:
        """
        Generate an image using Stable Diffusion.

        In production, this would use actual Stable Diffusion model.
        For now, returns a placeholder image based on the seed for reproducibility testing.

        Validates: Requirements 1.2, 1.5 (Seed Reproducibility)
        """
        # Default parameters
        width = parameters.get("width", 1024)
        height = parameters.get("height", 1024)
        steps = parameters.get("steps", 30)
        guidance_scale = parameters.get("guidance_scale", 7.5)

        logger.info(f"Generating image: prompt='{prompt[:50]}...', seed={seed}, size={width}x{height}")

        # Simulate generation time
        await asyncio.sleep(0.5)

        # Generate deterministic placeholder based on seed (for reproducibility testing)
        # In production, this would use actual model with the seed
        import random
        rng = random.Random(seed)

        # Create a simple deterministic byte pattern
        content = bytes([
            rng.randint(0, 255) for _ in range(100)
        ])

        # Add header to make it identifiable
        header = f"DGC_IMAGE:{seed}:{prompt[:20]}:".encode('utf-8')
        return header + content

    async def _generate_text(
        self,
        prompt: str,
        seed: int,
        parameters: Dict[str, Any]
    ) -> str:
        """
        Generate text using GPT-like model.

        In production, this would use actual GPT model.
        For now, returns deterministic text based on seed.

        Validates: Requirements 1.2, 1.5 (Seed Reproducibility)
        """
        max_tokens = parameters.get("max_tokens", 1000)
        temperature = parameters.get("temperature", 0.7)

        logger.info(f"Generating text: prompt='{prompt[:50]}...', seed={seed}, max_tokens={max_tokens}")

        # Simulate generation time
        await asyncio.sleep(0.3)

        # Generate deterministic text based on seed (for reproducibility testing)
        import random
        rng = random.Random(seed)

        # In production, use actual model with seed
        words = ["creative", "innovative", "artistic", "digital", "unique",
                 "generated", "AI", "content", "beautiful", "fascinating"]

        generated_words = [rng.choice(words) for _ in range(min(max_tokens // 5, 50))]

        return f"Generated from prompt: '{prompt}'\n\n" + " ".join(generated_words)

    async def _generate_music(
        self,
        prompt: str,
        seed: int,
        parameters: Dict[str, Any]
    ) -> bytes:
        """
        Generate music using MusicGen-like model.

        In production, this would use actual music generation model.
        For now, returns placeholder audio data.
        """
        duration = parameters.get("duration", 10)  # seconds
        sample_rate = parameters.get("sample_rate", 44100)

        logger.info(f"Generating music: prompt='{prompt[:50]}...', seed={seed}, duration={duration}s")

        # Simulate generation time
        await asyncio.sleep(0.5)

        # Generate deterministic placeholder based on seed
        import random
        rng = random.Random(seed)

        # Create deterministic byte pattern
        content = bytes([
            rng.randint(0, 255) for _ in range(100)
        ])

        header = f"DGC_MUSIC:{seed}:{prompt[:20]}:".encode('utf-8')
        return header + content

    def get_job(self, job_id: str) -> Optional[GenerationResult]:
        """Get the result for a generation job."""
        return self._jobs.get(job_id)

    def list_jobs(self, creator_address: Optional[str] = None) -> List[GenerationResult]:
        """List all generation jobs, optionally filtered by creator."""
        return list(self._jobs.values())


# Singleton instance
_generation_service: Optional[GenerationService] = None


def get_generation_service() -> GenerationService:
    """Get the singleton generation service instance."""
    global _generation_service
    if _generation_service is None:
        _generation_service = GenerationService()
    return _generation_service
