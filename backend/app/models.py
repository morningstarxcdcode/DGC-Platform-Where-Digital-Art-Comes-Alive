"""
Data models for the Decentralized Generative Content Platform.

This module contains the core data structures for metadata, provenance,
and content representation used throughout the DGC platform.
"""

import json
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional


class ContentType(Enum):
    """Supported content types for AI generation."""

    IMAGE = "IMAGE"
    TEXT = "TEXT"
    MUSIC = "MUSIC"


class DerivationType(Enum):
    """Types of content derivation."""

    ORIGINAL = "ORIGINAL"
    REMIX = "REMIX"
    EVOLUTION = "EVOLUTION"


@dataclass
class Attribute:
    """NFT attribute following OpenSea standard."""

    trait_type: str
    value: str


@dataclass
class Provenance:
    """Provenance information for AI-generated content."""

    model_version: str
    model_hash: str
    prompt_hash: str
    seed: int
    parameters: Dict[str, Any]
    timestamp: int
    creator: str
    collaborators: List[str] = field(default_factory=list)


@dataclass
class Evolution:
    """Evolution/derivation information for content."""

    parent_tokens: List[int] = field(default_factory=list)
    derivation_type: DerivationType = DerivationType.ORIGINAL


@dataclass
class Metadata:
    """
    Complete metadata structure for DGC platform content.

    This represents the JSON metadata stored on IPFS and linked to NFTs.
    Includes all required fields per Requirements 8.4: contentHash, creatorAddress,
    prompt, modelVersion, timestamp, and generationParameters.
    """

    # Core NFT metadata (ERC-721 standard)
    name: str
    description: str
    image: str  # IPFS URL
    content_type: ContentType

    # Required fields per Requirements 8.4
    content_hash: str  # Hash of the actual content
    creator_address: str  # Ethereum address of creator
    prompt: str  # Original generation prompt
    model_version: str  # AI model version used
    timestamp: int  # Unix timestamp of generation
    generation_parameters: Dict[str, Any]  # Parameters used for generation

    # Additional metadata
    attributes: List[Attribute] = field(default_factory=list)
    provenance: Optional[Provenance] = None
    evolution: Optional[Evolution] = None

    def to_json(self) -> str:
        """
        Serialize metadata to JSON string.

        Returns:
            JSON string representation of the metadata

        Raises:
            ValueError: If serialization fails due to invalid data
        """
        try:
            # Convert dataclass to dict, handling enums and nested objects
            data = self._to_dict()
            return json.dumps(data, indent=2, sort_keys=True)
        except (TypeError, ValueError) as e:
            raise ValueError(f"Failed to serialize metadata to JSON: {e}")

    @classmethod
    def from_json(cls, json_str: str) -> "Metadata":
        """
        Deserialize metadata from JSON string.

        Args:
            json_str: JSON string to deserialize

        Returns:
            Metadata instance

        Raises:
            ValueError: If deserialization fails or validation fails
        """
        try:
            data = json.loads(json_str)
            return cls._from_dict(data)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON format: {e}")
        except (KeyError, TypeError, ValueError) as e:
            raise ValueError(f"Failed to deserialize metadata from JSON: {e}")

    def _to_dict(self) -> Dict[str, Any]:
        """Convert metadata to dictionary for JSON serialization."""
        result = {
            "name": self.name,
            "description": self.description,
            "image": self.image,
            "content_type": self.content_type.value,
            "content_hash": self.content_hash,
            "creator_address": self.creator_address,
            "prompt": self.prompt,
            "model_version": self.model_version,
            "timestamp": self.timestamp,
            "generation_parameters": self.generation_parameters,
            "attributes": [
                {"trait_type": attr.trait_type, "value": attr.value} for attr in self.attributes
            ],
        }

        if self.provenance:
            result["provenance"] = {
                "model_version": self.provenance.model_version,
                "model_hash": self.provenance.model_hash,
                "prompt_hash": self.provenance.prompt_hash,
                "seed": self.provenance.seed,
                "parameters": self.provenance.parameters,
                "timestamp": self.provenance.timestamp,
                "creator": self.provenance.creator,
                "collaborators": self.provenance.collaborators,
            }

        if self.evolution:
            result["evolution"] = {
                "parent_tokens": self.evolution.parent_tokens,
                "derivation_type": self.evolution.derivation_type.value,
            }

        return result

    @classmethod
    def _from_dict(cls, data: Dict[str, Any]) -> "Metadata":
        """Create metadata from dictionary (from JSON deserialization)."""
        # Validate required fields per Requirements 8.4
        required_fields = [
            "content_hash",
            "creator_address",
            "prompt",
            "model_version",
            "timestamp",
            "generation_parameters",
        ]

        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            raise ValueError(f"Missing required fields: {missing_fields}")

        # Validate additional required fields
        if "name" not in data:
            raise ValueError("Missing required field: name")
        if "description" not in data:
            raise ValueError("Missing required field: description")
        if "image" not in data:
            raise ValueError("Missing required field: image")
        if "content_type" not in data:
            raise ValueError("Missing required field: content_type")

        # Parse content type
        try:
            content_type = ContentType(data["content_type"])
        except ValueError:
            raise ValueError(
                f"Invalid content_type: {data['content_type']}. Must be one of: {[ct.value for ct in ContentType]}"
            )

        # Parse attributes
        attributes = []
        for attr_data in data.get("attributes", []):
            if (
                not isinstance(attr_data, dict)
                or "trait_type" not in attr_data
                or "value" not in attr_data
            ):
                raise ValueError(
                    "Invalid attribute format. Must have 'trait_type' and 'value' fields"
                )
            attributes.append(
                Attribute(trait_type=attr_data["trait_type"], value=str(attr_data["value"]))
            )

        # Parse provenance if present
        provenance = None
        if "provenance" in data:
            prov_data = data["provenance"]
            provenance = Provenance(
                model_version=prov_data["model_version"],
                model_hash=prov_data["model_hash"],
                prompt_hash=prov_data["prompt_hash"],
                seed=prov_data["seed"],
                parameters=prov_data["parameters"],
                timestamp=prov_data["timestamp"],
                creator=prov_data["creator"],
                collaborators=prov_data.get("collaborators", []),
            )

        # Parse evolution if present
        evolution = None
        if "evolution" in data:
            evo_data = data["evolution"]
            try:
                derivation_type = DerivationType(evo_data["derivation_type"])
            except ValueError:
                raise ValueError(f"Invalid derivation_type: {evo_data['derivation_type']}")

            evolution = Evolution(
                parent_tokens=evo_data.get("parent_tokens", []), derivation_type=derivation_type
            )

        # Validate types for required fields
        if not isinstance(data["timestamp"], int):
            raise ValueError("timestamp must be an integer")
        if not isinstance(data["generation_parameters"], dict):
            raise ValueError("generation_parameters must be a dictionary")

        metadata = cls(
            name=data["name"],
            description=data["description"],
            image=data["image"],
            content_type=content_type,
            content_hash=data["content_hash"],
            creator_address=data["creator_address"],
            prompt=data["prompt"],
            model_version=data["model_version"],
            timestamp=data["timestamp"],
            generation_parameters=data["generation_parameters"],
            attributes=attributes,
            provenance=provenance,
            evolution=evolution,
        )

        # Validate the created metadata
        metadata.validate()

        return metadata

    def validate(self) -> None:
        """
        Validate metadata fields and raise descriptive errors for invalid data.

        Raises:
            ValueError: If any field is invalid with descriptive error message
        """
        # Validate required string fields are not empty
        string_fields = {
            "name": self.name,
            "description": self.description,
            "image": self.image,
            "content_hash": self.content_hash,
            "creator_address": self.creator_address,
            "prompt": self.prompt,
            "model_version": self.model_version,
        }

        for field_name, value in string_fields.items():
            if not isinstance(value, str) or not value.strip():
                raise ValueError(f"{field_name} must be a non-empty string")

        # Validate creator_address format (basic Ethereum address check)
        if not self.creator_address.startswith("0x") or len(self.creator_address) != 42:
            raise ValueError(
                "creator_address must be a valid Ethereum address (0x followed by 40 hex characters)"
            )

        # Validate timestamp is positive
        if self.timestamp <= 0:
            raise ValueError("timestamp must be a positive integer")

        # Validate generation_parameters is a dict
        if not isinstance(self.generation_parameters, dict):
            raise ValueError("generation_parameters must be a dictionary")

        # Validate attributes
        for i, attr in enumerate(self.attributes):
            if not isinstance(attr.trait_type, str) or not attr.trait_type.strip():
                raise ValueError(f"Attribute {i}: trait_type must be a non-empty string")
            if not isinstance(attr.value, str):
                raise ValueError(f"Attribute {i}: value must be a string")

        # Validate provenance if present
        if self.provenance:
            if (
                not isinstance(self.provenance.model_hash, str)
                or not self.provenance.model_hash.strip()
            ):
                raise ValueError("provenance.model_hash must be a non-empty string")
            if (
                not isinstance(self.provenance.prompt_hash, str)
                or not self.provenance.prompt_hash.strip()
            ):
                raise ValueError("provenance.prompt_hash must be a non-empty string")
            if not isinstance(self.provenance.seed, int):
                raise ValueError("provenance.seed must be an integer")
            if self.provenance.timestamp <= 0:
                raise ValueError("provenance.timestamp must be a positive integer")
            if not isinstance(self.provenance.creator, str) or not self.provenance.creator.strip():
                raise ValueError("provenance.creator must be a non-empty string")
            if not isinstance(self.provenance.collaborators, list):
                raise ValueError("provenance.collaborators must be a list")

        # Validate evolution if present
        if self.evolution:
            if not isinstance(self.evolution.parent_tokens, list):
                raise ValueError("evolution.parent_tokens must be a list")
            for token_id in self.evolution.parent_tokens:
                if not isinstance(token_id, int) or token_id < 0:
                    raise ValueError("evolution.parent_tokens must contain non-negative integers")


def create_metadata_from_generation(
    name: str,
    description: str,
    content_hash: str,
    image_url: str,
    content_type: ContentType,
    creator_address: str,
    prompt: str,
    model_version: str,
    generation_parameters: Dict[str, Any],
    seed: Optional[int] = None,
    collaborators: Optional[List[str]] = None,
) -> Metadata:
    """
    Create metadata from AI generation results.

    This is a convenience function to create properly formatted metadata
    from generation results, ensuring all required fields are present.

    Args:
        name: Human-readable name for the content
        description: Description of the content
        content_hash: Hash of the generated content
        image_url: IPFS URL to the content
        content_type: Type of generated content
        creator_address: Ethereum address of the creator
        prompt: Original generation prompt
        model_version: Version of the AI model used
        generation_parameters: Parameters used for generation
        seed: Optional seed for reproducibility
        collaborators: Optional list of collaborator addresses

    Returns:
        Validated Metadata instance

    Raises:
        ValueError: If any validation fails
    """
    timestamp = int(datetime.now().timestamp())

    # Create basic attributes
    attributes = [
        Attribute("AI Model", model_version),
        Attribute("Generation Date", datetime.fromtimestamp(timestamp).isoformat() + "Z"),
        Attribute("Content Type", content_type.value),
    ]

    if seed is not None:
        attributes.append(Attribute("Seed", str(seed)))

    # Create provenance record
    provenance = Provenance(
        model_version=model_version,
        model_hash=f"0x{hash(model_version) & 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff:064x}",
        prompt_hash=f"0x{hash(prompt) & 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff:064x}",
        seed=seed or 0,
        parameters=generation_parameters,
        timestamp=timestamp,
        creator=creator_address,
        collaborators=collaborators or [],
    )

    metadata = Metadata(
        name=name,
        description=description,
        image=image_url,
        content_type=content_type,
        content_hash=content_hash,
        creator_address=creator_address,
        prompt=prompt,
        model_version=model_version,
        timestamp=timestamp,
        generation_parameters=generation_parameters,
        attributes=attributes,
        provenance=provenance,
        evolution=Evolution(),  # Default to ORIGINAL
    )

    # Validate before returning
    metadata.validate()
    return metadata
