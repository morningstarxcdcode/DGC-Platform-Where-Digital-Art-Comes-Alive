"""
Property-based tests for metadata serialization and validation.

These tests validate the correctness properties defined in the design document
using Hypothesis for property-based testing with random data generation.
"""

import pytest
from hypothesis import given, strategies as st, assume, settings, HealthCheck
from typing import Dict, Any, List
import json

from app.models import (
    Metadata, ContentType, DerivationType, Attribute, 
    Provenance, Evolution, create_metadata_from_generation
)


# Hypothesis strategies for generating test data

@st.composite
def ethereum_address(draw):
    """Generate valid Ethereum addresses."""
    # Generate 40 hex characters
    hex_chars = draw(st.text(alphabet='0123456789abcdef', min_size=40, max_size=40))
    return f"0x{hex_chars}"


@st.composite
def content_hash(draw):
    """Generate content hashes."""
    hex_chars = draw(st.text(alphabet='0123456789abcdef', min_size=64, max_size=64))
    return f"0x{hex_chars}"


@st.composite
def ipfs_url(draw):
    """Generate IPFS URLs."""
    cid = draw(st.text(alphabet='123456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz', min_size=46, max_size=46))
    return f"ipfs://{cid}"


@st.composite
def valid_attribute(draw):
    """Generate valid Attribute objects."""
    trait_type = draw(st.text(min_size=1, max_size=100).filter(lambda x: x.strip()))
    value = draw(st.text(max_size=200))
    return Attribute(trait_type=trait_type, value=value)


@st.composite
def valid_provenance(draw):
    """Generate valid Provenance objects."""
    model_version = draw(st.text(min_size=1, max_size=50).filter(lambda x: x.strip()))
    model_hash = draw(content_hash())
    prompt_hash = draw(content_hash())
    seed = draw(st.integers(min_value=0, max_value=2**31-1))
    parameters = draw(st.dictionaries(
        st.text(min_size=1, max_size=20), 
        st.one_of(st.text(), st.integers(), st.floats(allow_nan=False, allow_infinity=False), st.booleans()),
        max_size=10
    ))
    timestamp = draw(st.integers(min_value=1, max_value=2**31-1))
    creator = draw(ethereum_address())
    collaborators = draw(st.lists(ethereum_address(), max_size=5))
    
    return Provenance(
        model_version=model_version,
        model_hash=model_hash,
        prompt_hash=prompt_hash,
        seed=seed,
        parameters=parameters,
        timestamp=timestamp,
        creator=creator,
        collaborators=collaborators
    )


@st.composite
def valid_evolution(draw):
    """Generate valid Evolution objects."""
    parent_tokens = draw(st.lists(st.integers(min_value=0, max_value=1000000), max_size=5))
    derivation_type = draw(st.sampled_from(DerivationType))
    
    return Evolution(
        parent_tokens=parent_tokens,
        derivation_type=derivation_type
    )


@st.composite
def valid_metadata(draw):
    """Generate valid Metadata objects."""
    name = draw(st.text(min_size=1, max_size=200).filter(lambda x: x.strip()))
    description = draw(st.text(min_size=1, max_size=1000).filter(lambda x: x.strip()))
    image = draw(ipfs_url())
    content_type = draw(st.sampled_from(ContentType))
    content_hash_value = draw(content_hash())
    creator_address = draw(ethereum_address())
    prompt = draw(st.text(min_size=1, max_size=500).filter(lambda x: x.strip()))
    model_version = draw(st.text(min_size=1, max_size=50).filter(lambda x: x.strip()))
    timestamp = draw(st.integers(min_value=1, max_value=2**31-1))
    generation_parameters = draw(st.dictionaries(
        st.text(min_size=1, max_size=20), 
        st.one_of(st.text(), st.integers(), st.floats(allow_nan=False, allow_infinity=False), st.booleans()),
        max_size=10
    ))
    attributes = draw(st.lists(valid_attribute(), max_size=10))
    provenance = draw(st.one_of(st.none(), valid_provenance()))
    evolution = draw(st.one_of(st.none(), valid_evolution()))
    
    return Metadata(
        name=name,
        description=description,
        image=image,
        content_type=content_type,
        content_hash=content_hash_value,
        creator_address=creator_address,
        prompt=prompt,
        model_version=model_version,
        timestamp=timestamp,
        generation_parameters=generation_parameters,
        attributes=attributes,
        provenance=provenance,
        evolution=evolution
    )


class TestMetadataProperties:
    """Property-based tests for metadata functionality."""
    
    @pytest.mark.property
    @given(metadata=valid_metadata())
    @settings(suppress_health_check=[HealthCheck.function_scoped_fixture])
    def test_metadata_json_roundtrip(self, metadata: Metadata):
        """
        Feature: decentralized-generative-content-platform, Property 11: Metadata JSON Round-Trip
        Validates: Requirements 8.3
        
        For any valid Metadata object, serializing to JSON and then deserializing back
        SHALL produce an object equivalent to the original. Formally: deserialize(serialize(metadata)) == metadata.
        """
        # Serialize to JSON
        json_str = metadata.to_json()
        
        # Verify it's valid JSON
        assert isinstance(json_str, str)
        parsed = json.loads(json_str)  # Should not raise
        assert isinstance(parsed, dict)
        
        # Deserialize back to Metadata
        deserialized = Metadata.from_json(json_str)
        
        # Verify round-trip property: deserialize(serialize(metadata)) == metadata
        assert deserialized == metadata
        
        # Additional verification: serialize again should produce same JSON
        json_str2 = deserialized.to_json()
        assert json_str == json_str2
    
    @pytest.mark.property
    @given(
        name=st.text(min_size=1, max_size=100).filter(lambda x: x.strip()),
        description=st.text(min_size=1, max_size=500).filter(lambda x: x.strip()),
        content_hash=content_hash(),
        image_url=ipfs_url(),
        content_type=st.sampled_from(ContentType),
        creator_address=ethereum_address(),
        prompt=st.text(min_size=1, max_size=300).filter(lambda x: x.strip()),
        model_version=st.text(min_size=1, max_size=50).filter(lambda x: x.strip()),
        generation_parameters=st.dictionaries(
            st.text(min_size=1, max_size=20), 
            st.one_of(st.text(), st.integers(), st.floats(allow_nan=False, allow_infinity=False)),
            max_size=5
        ),
        seed=st.one_of(st.none(), st.integers(min_value=0, max_value=2**31-1)),
        collaborators=st.one_of(st.none(), st.lists(ethereum_address(), max_size=3))
    )
    @settings(suppress_health_check=[HealthCheck.function_scoped_fixture])
    def test_create_metadata_from_generation_roundtrip(
        self, name, description, content_hash, image_url, content_type,
        creator_address, prompt, model_version, generation_parameters,
        seed, collaborators
    ):
        """
        Test that metadata created from generation parameters also satisfies round-trip property.
        """
        # Create metadata using the convenience function
        metadata = create_metadata_from_generation(
            name=name,
            description=description,
            content_hash=content_hash,
            image_url=image_url,
            content_type=content_type,
            creator_address=creator_address,
            prompt=prompt,
            model_version=model_version,
            generation_parameters=generation_parameters,
            seed=seed,
            collaborators=collaborators
        )
        
        # Test round-trip property
        json_str = metadata.to_json()
        deserialized = Metadata.from_json(json_str)
        assert deserialized == metadata
    
    @pytest.mark.property
    @given(
        valid_json=valid_metadata(),
        invalid_field=st.sampled_from([
            "content_hash", "creator_address", "prompt", 
            "model_version", "timestamp", "generation_parameters"
        ])
    )
    @settings(suppress_health_check=[HealthCheck.function_scoped_fixture])
    def test_metadata_schema_validation_missing_required_fields(self, valid_json, invalid_field):
        """
        Feature: decentralized-generative-content-platform, Property 12: Metadata Schema Validation
        Validates: Requirements 8.4, 8.5
        
        For any metadata object, validation SHALL pass if and only if all required fields
        (contentHash, creatorAddress, prompt, modelVersion, timestamp, generationParameters)
        are present and correctly typed. Missing or invalid fields SHALL cause validation to fail.
        """
        # Serialize valid metadata to get a valid JSON structure
        json_str = valid_json.to_json()
        data = json.loads(json_str)
        
        # Remove a required field
        if invalid_field in data:
            del data[invalid_field]
            
            # Attempt to deserialize should fail with descriptive error
            with pytest.raises(ValueError) as exc_info:
                Metadata.from_json(json.dumps(data))
            
            # Error message should mention the missing field
            assert invalid_field in str(exc_info.value).lower() or "missing" in str(exc_info.value).lower()
    
    @pytest.mark.property
    @given(metadata=valid_metadata())
    @settings(suppress_health_check=[HealthCheck.function_scoped_fixture])
    def test_metadata_validation_passes_for_valid_data(self, metadata):
        """
        Test that validation passes for valid metadata objects.
        """
        # Should not raise any exception
        metadata.validate()
    
    @pytest.mark.property
    @given(
        metadata=valid_metadata(),
        invalid_timestamp=st.one_of(
            st.integers(max_value=0),  # Non-positive timestamps
            st.text(),  # String instead of int
            st.floats()  # Float instead of int
        )
    )
    @settings(suppress_health_check=[HealthCheck.function_scoped_fixture])
    def test_metadata_validation_fails_for_invalid_timestamp(self, metadata, invalid_timestamp):
        """
        Test that validation fails for invalid timestamp values.
        """
        # Create JSON and modify timestamp to invalid value
        json_str = metadata.to_json()
        data = json.loads(json_str)
        data["timestamp"] = invalid_timestamp
        
        # Should fail validation
        with pytest.raises(ValueError) as exc_info:
            Metadata.from_json(json.dumps(data))
        
        assert "timestamp" in str(exc_info.value).lower()
    
    @pytest.mark.property
    @given(
        metadata=valid_metadata(),
        invalid_creator=st.one_of(
            st.text().filter(lambda x: not x.startswith("0x") or len(x) != 42),  # Invalid format
            st.text(max_size=10),  # Too short
            st.integers(),  # Wrong type
        )
    )
    @settings(suppress_health_check=[HealthCheck.function_scoped_fixture])
    def test_metadata_validation_fails_for_invalid_creator_address(self, metadata, invalid_creator):
        """
        Test that validation fails for invalid creator addresses.
        """
        assume(not (isinstance(invalid_creator, str) and invalid_creator.startswith("0x") and len(invalid_creator) == 42))
        
        # Create JSON and modify creator_address to invalid value
        json_str = metadata.to_json()
        data = json.loads(json_str)
        data["creator_address"] = invalid_creator
        
        # Should fail validation
        with pytest.raises(ValueError) as exc_info:
            Metadata.from_json(json.dumps(data))
        
        error_msg = str(exc_info.value).lower()
        assert "creator_address" in error_msg or "ethereum address" in error_msg
    
    @pytest.mark.property
    @given(
        metadata=valid_metadata(),
        invalid_content_type=st.text().filter(lambda x: x not in ["IMAGE", "TEXT", "MUSIC"])
    )
    @settings(suppress_health_check=[HealthCheck.function_scoped_fixture])
    def test_metadata_validation_fails_for_invalid_content_type(self, metadata, invalid_content_type):
        """
        Test that validation fails for invalid content types.
        """
        # Create JSON and modify content_type to invalid value
        json_str = metadata.to_json()
        data = json.loads(json_str)
        data["content_type"] = invalid_content_type
        
        # Should fail validation
        with pytest.raises(ValueError) as exc_info:
            Metadata.from_json(json.dumps(data))
        
        error_msg = str(exc_info.value).lower()
        assert "content_type" in error_msg or "invalid" in error_msg


class TestMetadataEdgeCases:
    """Test edge cases and specific examples for metadata."""
    
    def test_empty_string_fields_validation(self):
        """Test that empty string fields are properly rejected."""
        base_data = {
            "name": "Test NFT",
            "description": "Test description",
            "image": "ipfs://QmTest123456789012345678901234567890123456",
            "content_type": "IMAGE",
            "content_hash": "0x1234567890123456789012345678901234567890123456789012345678901234",
            "creator_address": "0x1234567890123456789012345678901234567890",
            "prompt": "test prompt",
            "model_version": "test-model-v1",
            "timestamp": 1735380600,
            "generation_parameters": {"param1": "value1"}
        }
        
        # Test each required string field with empty value
        string_fields = ["name", "description", "image", "content_hash", "creator_address", "prompt", "model_version"]
        
        for field in string_fields:
            data = base_data.copy()
            data[field] = ""  # Empty string
            
            with pytest.raises(ValueError) as exc_info:
                Metadata.from_json(json.dumps(data))
            
            assert field in str(exc_info.value).lower()
    
    def test_minimal_valid_metadata(self):
        """Test that minimal valid metadata works correctly."""
        data = {
            "name": "Test",
            "description": "Test desc",
            "image": "ipfs://QmTest123456789012345678901234567890123456",
            "content_type": "IMAGE",
            "content_hash": "0x1234567890123456789012345678901234567890123456789012345678901234",
            "creator_address": "0x1234567890123456789012345678901234567890",
            "prompt": "test",
            "model_version": "v1",
            "timestamp": 1,
            "generation_parameters": {}
        }
        
        metadata = Metadata.from_json(json.dumps(data))
        assert metadata.name == "Test"
        assert metadata.attributes == []
        assert metadata.provenance is None
        assert metadata.evolution is None
        
        # Round-trip should work
        json_str = metadata.to_json()
        metadata2 = Metadata.from_json(json_str)
        assert metadata == metadata2