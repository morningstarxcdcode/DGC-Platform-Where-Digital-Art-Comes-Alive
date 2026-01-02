"""
Property-based tests for IPFS Service.

Tests Property 10: IPFS Content Round-Trip (Requirements 5.5)
"""

import pytest
from hypothesis import given, strategies as st, settings, HealthCheck
import asyncio

from app.services.ipfs import IPFSService, get_ipfs_service


@pytest.fixture
def ipfs_service():
    """Create a fresh IPFS service for each test."""
    return IPFSService()


class TestIPFSContentRoundTrip:
    """
    Property 10: IPFS Content Round-Trip
    
    For any uploaded content, retrieving by CID SHALL return identical bytes.
    
    Validates: Requirements 5.5
    """
    
    @given(content=st.binary(min_size=1, max_size=10000))
    @settings(max_examples=50, deadline=5000, suppress_health_check=[HealthCheck.function_scoped_fixture])
    def test_binary_content_round_trip(self, ipfs_service, content):
        """Binary content should survive round-trip through IPFS."""
        # Upload
        result = asyncio.get_event_loop().run_until_complete(
            ipfs_service.upload_content(content)
        )
        
        assert result.cid is not None
        assert result.size == len(content)
        
        # Retrieve
        retrieved = asyncio.get_event_loop().run_until_complete(
            ipfs_service.get_content(result.cid)
        )
        
        assert retrieved.content == content, \
            "Retrieved content should be identical to uploaded content"
    
    @given(content=st.text(min_size=1, max_size=5000))
    @settings(max_examples=50, deadline=5000, suppress_health_check=[HealthCheck.function_scoped_fixture])
    def test_text_content_round_trip(self, ipfs_service, content):
        """Text content should survive round-trip through IPFS."""
        # Upload
        result = asyncio.get_event_loop().run_until_complete(
            ipfs_service.upload_content(content)
        )
        
        assert result.cid is not None
        
        # Retrieve
        retrieved = asyncio.get_event_loop().run_until_complete(
            ipfs_service.get_content(result.cid)
        )
        
        # Retrieved content should match (compare as bytes)
        expected_bytes = content.encode('utf-8')
        assert retrieved.content == expected_bytes, \
            "Retrieved text content should match uploaded content"
    
    @given(
        data=st.dictionaries(
            keys=st.text(min_size=1, max_size=50).filter(lambda x: x.strip()),
            values=st.one_of(
                st.text(max_size=100),
                st.integers(),
                st.floats(allow_nan=False, allow_infinity=False),
                st.booleans(),
                st.none()
            ),
            min_size=1,
            max_size=20
        )
    )
    @settings(max_examples=30, deadline=5000, suppress_health_check=[HealthCheck.function_scoped_fixture])
    def test_json_content_round_trip(self, ipfs_service, data):
        """JSON content should survive round-trip through IPFS."""
        # Upload as JSON
        result = asyncio.get_event_loop().run_until_complete(
            ipfs_service.upload_json(data)
        )
        
        assert result.cid is not None
        
        # Retrieve as JSON
        retrieved = asyncio.get_event_loop().run_until_complete(
            ipfs_service.get_json(result.cid)
        )
        
        assert retrieved == data, \
            "Retrieved JSON should match uploaded JSON"
    
    def test_verify_content_method(self, ipfs_service):
        """verify_content should correctly validate stored content."""
        original_content = b"Test content for verification"
        
        # Upload
        result = asyncio.get_event_loop().run_until_complete(
            ipfs_service.upload_content(original_content)
        )
        
        # Verify correct content
        is_valid = asyncio.get_event_loop().run_until_complete(
            ipfs_service.verify_content(result.cid, original_content)
        )
        assert is_valid, "Verification should pass for correct content"
        
        # Verify incorrect content
        is_invalid = asyncio.get_event_loop().run_until_complete(
            ipfs_service.verify_content(result.cid, b"Wrong content")
        )
        assert not is_invalid, "Verification should fail for incorrect content"


class TestIPFSPinning:
    """Tests for IPFS content pinning."""
    
    def test_content_is_pinned_by_default(self, ipfs_service):
        """Content should be pinned by default."""
        result = asyncio.get_event_loop().run_until_complete(
            ipfs_service.upload_content(b"Test content")
        )
        
        assert result.pinned
        assert ipfs_service.is_pinned(result.cid)
    
    def test_can_upload_without_pinning(self, ipfs_service):
        """Should be able to upload without pinning."""
        result = asyncio.get_event_loop().run_until_complete(
            ipfs_service.upload_content(b"Unpinned content", pin=False)
        )
        
        assert not result.pinned
        assert not ipfs_service.is_pinned(result.cid)
    
    def test_can_pin_and_unpin(self, ipfs_service):
        """Should be able to pin and unpin content."""
        result = asyncio.get_event_loop().run_until_complete(
            ipfs_service.upload_content(b"Content to pin/unpin", pin=False)
        )
        
        assert not ipfs_service.is_pinned(result.cid)
        
        # Pin
        asyncio.get_event_loop().run_until_complete(
            ipfs_service.pin(result.cid)
        )
        assert ipfs_service.is_pinned(result.cid)
        
        # Unpin
        asyncio.get_event_loop().run_until_complete(
            ipfs_service.unpin(result.cid)
        )
        assert not ipfs_service.is_pinned(result.cid)


class TestIPFSURLs:
    """Tests for IPFS URL generation."""
    
    def test_ipfs_url_format(self, ipfs_service):
        """IPFS URLs should have correct format."""
        result = asyncio.get_event_loop().run_until_complete(
            ipfs_service.upload_content(b"Test content")
        )
        
        ipfs_url = ipfs_service.get_ipfs_url(result.cid)
        assert ipfs_url.startswith("ipfs://")
        assert result.cid in ipfs_url
    
    def test_gateway_url_format(self, ipfs_service):
        """Gateway URLs should have correct format."""
        result = asyncio.get_event_loop().run_until_complete(
            ipfs_service.upload_content(b"Test content")
        )
        
        gateway_url = ipfs_service.get_gateway_url(result.cid)
        assert gateway_url.startswith("https://")
        assert "ipfs.io/ipfs/" in gateway_url
        assert result.cid in gateway_url


class TestIPFSErrorHandling:
    """Tests for IPFS error handling."""
    
    def test_get_nonexistent_content_raises_error(self, ipfs_service):
        """Getting non-existent content should raise ValueError."""
        with pytest.raises(ValueError, match="Content not found"):
            asyncio.get_event_loop().run_until_complete(
                ipfs_service.get_content("QmNonexistent" + "x" * 40)
            )
    
    def test_pin_nonexistent_content_raises_error(self, ipfs_service):
        """Pinning non-existent content should raise ValueError."""
        with pytest.raises(ValueError, match="Content not found"):
            asyncio.get_event_loop().run_until_complete(
                ipfs_service.pin("QmNonexistent" + "x" * 40)
            )
    
    def test_get_invalid_json_raises_error(self, ipfs_service):
        """Getting non-JSON content as JSON should raise ValueError."""
        result = asyncio.get_event_loop().run_until_complete(
            ipfs_service.upload_content(b"Not valid JSON")
        )
        
        with pytest.raises(ValueError, match="not valid JSON"):
            asyncio.get_event_loop().run_until_complete(
                ipfs_service.get_json(result.cid)
            )
