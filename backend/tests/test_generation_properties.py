"""
Property-based tests for AI Generation Service.

Tests Property 1: Generation Result Completeness (Requirements 1.3)
Tests Property 2: Seed Reproducibility (Requirements 1.5)
"""

import asyncio

import pytest
from hypothesis import HealthCheck, assume, given, settings
from hypothesis import strategies as st

from app.services.generation import (
    ContentType,
    GenerationRequest,
    GenerationResult,
    GenerationService,
    GenerationStatus,
)


@pytest.fixture
def generation_service():
    """Create a fresh generation service for each test."""
    return GenerationService()


class TestGenerationResultCompleteness:
    """
    Property 1: Generation Result Completeness

    For any successful generation, the result SHALL include:
    content, content_hash, model_version, prompt, seed, parameters, and timestamp.

    Validates: Requirements 1.3
    """

    @given(
        prompt=st.text(min_size=1, max_size=100).filter(lambda x: x.strip()),
        content_type=st.sampled_from(list(ContentType)),
        seed=st.integers(min_value=0, max_value=2**32 - 1),
    )
    @settings(
        max_examples=20, deadline=10000, suppress_health_check=[HealthCheck.function_scoped_fixture]
    )
    def test_generation_result_has_all_required_fields(
        self, generation_service, prompt, content_type, seed
    ):
        """Every successful generation should have all required fields."""
        assume(prompt.strip())  # Ensure non-empty after strip

        request = GenerationRequest(
            prompt=prompt, content_type=content_type, creator_address="0x" + "1" * 40, seed=seed
        )

        result = asyncio.get_event_loop().run_until_complete(generation_service.generate(request))

        # If generation succeeded, verify all fields are present
        if result.status == GenerationStatus.COMPLETED:
            assert result.is_complete(), "Completed result should have all required fields"
            assert result.content is not None, "Content should be present"
            assert result.content_hash is not None, "Content hash should be present"
            assert result.content_hash.startswith("0x"), "Content hash should be hex"
            assert result.model_version is not None, "Model version should be present"
            assert result.prompt is not None, "Prompt should be present"
            assert result.seed is not None, "Seed should be present"
            assert result.parameters is not None, "Parameters should be present"
            assert result.timestamp is not None, "Timestamp should be present"
            assert result.timestamp > 0, "Timestamp should be positive"

    @pytest.mark.parametrize("content_type", list(ContentType))
    def test_each_content_type_returns_complete_result(self, generation_service, content_type):
        """Each content type should return a complete result."""
        request = GenerationRequest(
            prompt="Test generation prompt",
            content_type=content_type,
            creator_address="0x" + "a" * 40,
            seed=12345,
        )

        result = asyncio.get_event_loop().run_until_complete(generation_service.generate(request))

        assert result.status == GenerationStatus.COMPLETED
        assert result.is_complete()

    def test_failed_generation_has_error_message(self, generation_service):
        """Failed generations should include an error message."""
        # This would test timeout or error scenarios
        # For now, test that the error field exists when status is FAILED
        result = GenerationResult(job_id="test", status=GenerationStatus.FAILED, error="Test error")

        assert result.error is not None
        assert not result.is_complete()


class TestSeedReproducibility:
    """
    Property 2: Seed Reproducibility

    Given identical (seed, prompt) pairs, generate() SHALL produce
    identical content within the same model version.

    Validates: Requirements 1.5
    """

    @given(
        prompt=st.text(min_size=1, max_size=100).filter(lambda x: x.strip()),
        seed=st.integers(min_value=0, max_value=2**32 - 1),
    )
    @settings(
        max_examples=10, deadline=15000, suppress_health_check=[HealthCheck.function_scoped_fixture]
    )
    def test_same_seed_produces_same_content(self, generation_service, prompt, seed):
        """Same seed and prompt should produce identical content."""
        assume(prompt.strip())

        request = GenerationRequest(
            prompt=prompt,
            content_type=ContentType.TEXT,  # Text is fastest to test
            creator_address="0x" + "1" * 40,
            seed=seed,
        )

        # Generate twice with same seed
        result1 = asyncio.get_event_loop().run_until_complete(generation_service.generate(request))

        # Use new service instance to ensure no caching
        service2 = GenerationService()
        result2 = asyncio.get_event_loop().run_until_complete(service2.generate(request))

        # Both should complete successfully
        assert result1.status == GenerationStatus.COMPLETED
        assert result2.status == GenerationStatus.COMPLETED

        # Content should be identical
        assert result1.content == result2.content, "Same seed should produce identical content"

        # Content hash should match
        assert (
            result1.content_hash == result2.content_hash
        ), "Same seed should produce identical content hash"

    @given(
        prompt=st.text(min_size=1, max_size=50).filter(lambda x: x.strip()),
        seed1=st.integers(min_value=0, max_value=2**31 - 1),
        seed2=st.integers(min_value=0, max_value=2**31 - 1),
    )
    @settings(
        max_examples=10, deadline=15000, suppress_health_check=[HealthCheck.function_scoped_fixture]
    )
    def test_different_seeds_produce_different_content(
        self, generation_service, prompt, seed1, seed2
    ):
        """Different seeds should produce different content."""
        assume(prompt.strip())
        assume(seed1 != seed2)

        request1 = GenerationRequest(
            prompt=prompt,
            content_type=ContentType.TEXT,
            creator_address="0x" + "1" * 40,
            seed=seed1,
        )

        request2 = GenerationRequest(
            prompt=prompt,
            content_type=ContentType.TEXT,
            creator_address="0x" + "1" * 40,
            seed=seed2,
        )

        result1 = asyncio.get_event_loop().run_until_complete(generation_service.generate(request1))

        result2 = asyncio.get_event_loop().run_until_complete(generation_service.generate(request2))

        assert result1.status == GenerationStatus.COMPLETED
        assert result2.status == GenerationStatus.COMPLETED

        # Different seeds should produce different content
        assert (
            result1.content != result2.content
        ), "Different seeds should produce different content"

    @pytest.mark.parametrize("content_type", list(ContentType))
    def test_reproducibility_across_content_types(self, content_type):
        """Reproducibility should work for all content types."""
        service1 = GenerationService()
        service2 = GenerationService()

        seed = 42
        prompt = "Test reproducibility"

        request = GenerationRequest(
            prompt=prompt, content_type=content_type, creator_address="0x" + "a" * 40, seed=seed
        )

        result1 = asyncio.get_event_loop().run_until_complete(service1.generate(request))

        result2 = asyncio.get_event_loop().run_until_complete(service2.generate(request))

        assert result1.content == result2.content
        assert result1.content_hash == result2.content_hash


class TestGenerationService:
    """Unit tests for GenerationService."""

    def test_job_tracking(self, generation_service):
        """Generation jobs should be trackable by ID."""
        request = GenerationRequest(
            prompt="Test tracking",
            content_type=ContentType.TEXT,
            creator_address="0x" + "1" * 40,
            seed=123,
        )

        result = asyncio.get_event_loop().run_until_complete(generation_service.generate(request))

        # Should be able to retrieve the job
        retrieved = generation_service.get_job(result.job_id)
        assert retrieved is not None
        assert retrieved.job_id == result.job_id
        assert retrieved.status == result.status

    def test_nonexistent_job_returns_none(self, generation_service):
        """Non-existent job ID should return None."""
        result = generation_service.get_job("nonexistent-job-id")
        assert result is None

    def test_model_version_is_set(self, generation_service):
        """Model version should be set based on content type."""
        for content_type in ContentType:
            request = GenerationRequest(
                prompt="Test model version",
                content_type=content_type,
                creator_address="0x" + "1" * 40,
                seed=123,
            )

            result = asyncio.get_event_loop().run_until_complete(
                generation_service.generate(request)
            )

            assert result.model_version is not None
            assert len(result.model_version) > 0
