"""
Property-based tests for API endpoints.

Tests Property 15: Marketplace Filter Correctness (Requirements 7.4)
"""

import pytest
from fastapi.testclient import TestClient
from hypothesis import HealthCheck, given, settings
from hypothesis import strategies as st

from app.api import NFTMetadata, _nft_index, app


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


@pytest.fixture(autouse=True)
def clear_index():
    """Clear NFT index before each test."""
    _nft_index.clear()
    yield
    _nft_index.clear()


def create_test_nft(
    token_id: int, content_type: str = "IMAGE", creator_address: str = None, **kwargs
) -> NFTMetadata:
    """Create a test NFT metadata object."""
    if creator_address is None:
        creator_address = "0x" + f"{token_id:040x}"

    return NFTMetadata(
        token_id=token_id,
        name=kwargs.get("name", f"NFT #{token_id}"),
        description=kwargs.get("description", f"Description for NFT {token_id}"),
        image=kwargs.get("image", f"ipfs://Qm{token_id:044}"),
        content_type=content_type,
        creator_address=creator_address,
        model_version=kwargs.get("model_version", "stable-diffusion-xl-1.0"),
        timestamp=kwargs.get("timestamp", 1700000000 + token_id),
        provenance_hash=kwargs.get("provenance_hash", f"0x{token_id:064x}"),
    )


class TestMarketplaceFilterCorrectness:
    """
    Property 15: Marketplace Filter Correctness

    When marketplace filters are applied, only NFTs matching ALL
    specified criteria SHALL be returned.

    Validates: Requirements 7.4
    """

    @given(
        num_nfts=st.integers(min_value=5, max_value=20),
        filter_type=st.sampled_from(["IMAGE", "TEXT", "MUSIC"]),
    )
    @settings(
        max_examples=20, deadline=5000, suppress_health_check=[HealthCheck.function_scoped_fixture]
    )
    def test_content_type_filter_returns_only_matching(self, client, num_nfts, filter_type):
        """Content type filter should return only matching NFTs."""
        content_types = ["IMAGE", "TEXT", "MUSIC"]

        # Create NFTs with mixed content types
        for i in range(1, num_nfts + 1):
            content_type = content_types[i % 3]
            nft = create_test_nft(i, content_type=content_type)
            _nft_index[i] = nft

        # Query with filter
        response = client.get(f"/api/nfts?content_type={filter_type}")
        assert response.status_code == 200

        data = response.json()

        # All returned NFTs should match the filter
        for nft in data["nfts"]:
            assert nft["content_type"] == filter_type, (
                f"NFT with content_type {nft['content_type']} "
                f"should not be returned for filter {filter_type}"
            )

        # Count expected matches
        expected_count = sum(1 for nft in _nft_index.values() if nft.content_type == filter_type)

        assert (
            data["total"] == expected_count
        ), f"Expected {expected_count} matches, got {data['total']}"

    @given(
        num_creators=st.integers(min_value=2, max_value=5),
        nfts_per_creator=st.integers(min_value=2, max_value=5),
    )
    @settings(
        max_examples=15, deadline=5000, suppress_health_check=[HealthCheck.function_scoped_fixture]
    )
    def test_creator_filter_returns_only_matching(self, client, num_creators, nfts_per_creator):
        """Creator filter should return only NFTs from that creator."""
        creators = [f"0x{i:040x}" for i in range(1, num_creators + 1)]

        # Create NFTs for each creator
        token_id = 1
        for creator in creators:
            for _ in range(nfts_per_creator):
                nft = create_test_nft(token_id, creator_address=creator)
                _nft_index[token_id] = nft
                token_id += 1

        # Query for specific creator
        target_creator = creators[0]
        response = client.get(f"/api/nfts?creator={target_creator}")
        assert response.status_code == 200

        data = response.json()

        # All returned NFTs should be from the specified creator
        for nft in data["nfts"]:
            assert nft["creator_address"].lower() == target_creator.lower(), (
                f"NFT from {nft['creator_address']} "
                f"should not be returned for creator {target_creator}"
            )

        # Should return exactly nfts_per_creator NFTs
        assert data["total"] == nfts_per_creator

    def test_pagination_works_correctly(self, client):
        """Pagination should return correct subsets."""
        # Create 25 NFTs
        for i in range(1, 26):
            _nft_index[i] = create_test_nft(i)

        # Test page 1
        response = client.get("/api/nfts?page=1&page_size=10")
        assert response.status_code == 200
        data = response.json()

        assert len(data["nfts"]) == 10
        assert data["total"] == 25
        assert data["page"] == 1
        assert data["page_size"] == 10

        # Test page 2
        response = client.get("/api/nfts?page=2&page_size=10")
        data = response.json()

        assert len(data["nfts"]) == 10
        assert data["page"] == 2

        # Test page 3 (partial)
        response = client.get("/api/nfts?page=3&page_size=10")
        data = response.json()

        assert len(data["nfts"]) == 5  # Only 5 remaining
        assert data["page"] == 3

    def test_empty_filter_returns_all(self, client):
        """No filters should return all NFTs."""
        for i in range(1, 11):
            content_type = ["IMAGE", "TEXT", "MUSIC"][i % 3]
            _nft_index[i] = create_test_nft(i, content_type=content_type)

        response = client.get("/api/nfts")
        assert response.status_code == 200

        data = response.json()
        assert data["total"] == 10


class TestAPIEndpoints:
    """Unit tests for API endpoints."""

    def test_root_endpoint(self, client):
        """Root endpoint should return status."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

    def test_health_endpoint(self, client):
        """Health endpoint should return status."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

    def test_get_nft_exists(self, client):
        """Getting existing NFT should return details."""
        nft = create_test_nft(1)
        _nft_index[1] = nft

        response = client.get("/api/nfts/1")
        assert response.status_code == 200

        data = response.json()
        assert data["token_id"] == 1
        assert data["name"] == "NFT #1"

    def test_get_nft_not_found(self, client):
        """Getting non-existent NFT should return 404."""
        response = client.get("/api/nfts/999")
        assert response.status_code == 404

    def test_get_nft_provenance(self, client):
        """Getting NFT provenance should return provenance data."""
        nft = create_test_nft(1, provenance_hash="0x123abc")
        _nft_index[1] = nft

        response = client.get("/api/nfts/1/provenance")
        assert response.status_code == 200

        data = response.json()
        assert data["token_id"] == 1
        assert "provenance_hash" in data


class TestGenerationEndpoints:
    """Tests for generation endpoints."""

    def test_generate_content(self, client):
        """Generation endpoint should start a job."""
        response = client.post(
            "/api/generate",
            json={
                "prompt": "A beautiful sunset over mountains",
                "content_type": "IMAGE",
                "creator_address": "0x" + "1" * 40,
                "seed": 12345,
            },
        )

        assert response.status_code == 200
        data = response.json()

        assert "job_id" in data
        assert data["status"] in ["COMPLETED", "IN_PROGRESS", "PENDING"]

    def test_generate_with_invalid_address(self, client):
        """Generation with invalid address should fail."""
        response = client.post(
            "/api/generate",
            json={
                "prompt": "Test prompt",
                "content_type": "IMAGE",
                "creator_address": "invalid-address",
            },
        )

        assert response.status_code == 422  # Validation error

    def test_get_generation_status(self, client):
        """Should be able to check generation status."""
        # First create a job
        create_response = client.post(
            "/api/generate",
            json={
                "prompt": "Test prompt",
                "content_type": "TEXT",
                "creator_address": "0x" + "1" * 40,
                "seed": 42,
            },
        )

        job_id = create_response.json()["job_id"]

        # Check status
        response = client.get(f"/api/generate/{job_id}")
        assert response.status_code == 200

        data = response.json()
        assert data["job_id"] == job_id


class TestIPFSEndpoints:
    """Tests for IPFS endpoints."""

    def test_upload_content(self, client):
        """Should be able to upload content."""
        response = client.post(
            "/api/upload",
            json={"content": "Test content to upload", "content_type": "text/plain", "pin": True},
        )

        assert response.status_code == 200
        data = response.json()

        assert "cid" in data
        assert data["pinned"] is True
        assert "ipfs_url" in data
        assert "gateway_url" in data

    def test_upload_and_retrieve(self, client):
        """Should be able to upload and retrieve content."""
        original_content = "Test content for round-trip"

        # Upload
        upload_response = client.post(
            "/api/upload",
            json={"content": original_content, "content_type": "text/plain", "pin": True},
        )

        assert upload_response.status_code == 200
        cid = upload_response.json()["cid"]

        # Retrieve
        retrieve_response = client.get(f"/api/content/{cid}")
        assert retrieve_response.status_code == 200

        # Content should match
        assert retrieve_response.content.decode("utf-8") == original_content
