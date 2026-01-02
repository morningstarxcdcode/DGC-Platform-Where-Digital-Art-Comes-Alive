"""
IPFS Integration Service for the DGC Platform.

This module provides functionality for uploading and retrieving content
from IPFS, including metadata JSON and generated content.
"""

import asyncio
from dataclasses import dataclass
from typing import Optional, Dict, Any, Union
import hashlib
import json
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class IPFSUploadResult:
    """Result of an IPFS upload operation."""
    cid: str
    size: int
    pinned: bool
    timestamp: int


@dataclass
class IPFSContent:
    """Content retrieved from IPFS."""
    cid: str
    content: Union[bytes, str]
    content_type: str
    size: int


class IPFSService:
    """
    Service for interacting with IPFS.

    Provides functionality for uploading content, retrieving content by CID,
    and managing pinned content for persistence.

    Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
    """

    def __init__(self, gateway_url: str = "http://localhost:5001"):
        """
        Initialize IPFS service.

        Args:
            gateway_url: URL of the IPFS gateway/API
        """
        self._gateway_url = gateway_url
        self._storage: Dict[str, bytes] = {}  # In-memory storage for testing
        self._pins: set = set()  # Set of pinned CIDs
        self._metadata: Dict[str, Dict[str, Any]] = {}  # CID metadata

    def _compute_cid(self, content: bytes) -> str:
        """
        Compute CID for content.

        In production, this would use actual IPFS CID computation.
        For now, uses SHA-256 hash with Qm prefix to simulate CIDv0.
        """
        # Simulate CIDv0 format (Qm prefix + base58 encoded hash)
        # In production, use actual multihash encoding
        return "Qm" + hashlib.sha256(content).hexdigest()[:44]

    async def upload_content(
        self,
        content: Union[bytes, str],
        pin: bool = True
    ) -> IPFSUploadResult:
        """
        Upload content to IPFS.

        Args:
            content: Content to upload (bytes or string)
            pin: Whether to pin the content for persistence

        Returns:
            IPFSUploadResult with CID and metadata

        Validates: Requirements 5.1, 5.3, 5.6
        """
        # Yield to event loop (placeholder for actual IPFS async upload)
        await asyncio.sleep(0)

        # Convert string to bytes if needed
        if isinstance(content, str):
            content_bytes = content.encode('utf-8')
        else:
            content_bytes = content

        # Compute CID
        cid = self._compute_cid(content_bytes)

        # Store content
        self._storage[cid] = content_bytes

        # Pin if requested
        if pin:
            self._pins.add(cid)

        # Store metadata
        self._metadata[cid] = {
            "size": len(content_bytes),
            "uploaded_at": int(datetime.now().timestamp()),
            "pinned": pin
        }

        logger.info(
            f"Uploaded to IPFS: CID={cid}, size={len(content_bytes)}"
        )

        return IPFSUploadResult(
            cid=cid,
            size=len(content_bytes),
            pinned=pin,
            timestamp=int(datetime.now().timestamp())
        )

    async def upload_json(
        self,
        data: Dict[str, Any],
        pin: bool = True
    ) -> IPFSUploadResult:
        """
        Upload JSON metadata to IPFS.

        Args:
            data: Dictionary to serialize and upload
            pin: Whether to pin the content

        Returns:
            IPFSUploadResult with CID

        Validates: Requirements 5.2
        """
        json_str = json.dumps(data, indent=2, sort_keys=True)
        return await self.upload_content(json_str, pin=pin)

    async def get_content(self, cid: str) -> IPFSContent:
        """
        Retrieve content from IPFS by CID.

        Args:
            cid: Content identifier

        Returns:
            IPFSContent with the retrieved data

        Raises:
            ValueError: If content not found

        Validates: Requirements 5.4, 5.5
        """
        # Yield to event loop (placeholder for actual IPFS async retrieval)
        await asyncio.sleep(0)

        if cid not in self._storage:
            raise ValueError(f"Content not found for CID: {cid}")

        content_bytes = self._storage[cid]

        # Try to detect content type
        content_type = "application/octet-stream"
        try:
            content_bytes.decode('utf-8')
            content_type = "text/plain"
            # Check if it's JSON
            try:
                json.loads(content_bytes.decode('utf-8'))
                content_type = "application/json"
            except json.JSONDecodeError:
                pass
        except UnicodeDecodeError:
            # Binary content
            if content_bytes.startswith(b'\x89PNG'):
                content_type = "image/png"
            elif content_bytes.startswith(b'\xff\xd8\xff'):
                content_type = "image/jpeg"
            elif content_bytes.startswith(b'DGC_IMAGE'):
                content_type = "image/png"
            elif content_bytes.startswith(b'DGC_MUSIC'):
                content_type = "audio/wav"

        logger.info(f"Retrieved from IPFS: CID={cid}")

        return IPFSContent(
            cid=cid,
            content=content_bytes,
            content_type=content_type,
            size=len(content_bytes)
        )

    async def get_json(self, cid: str) -> Dict[str, Any]:
        """
        Retrieve and parse JSON content from IPFS.

        Args:
            cid: Content identifier

        Returns:
            Parsed JSON as dictionary

        Raises:
            ValueError: If content not found or not valid JSON
        """
        content = await self.get_content(cid)

        if isinstance(content.content, bytes):
            json_str = content.content.decode('utf-8')
        else:
            json_str = content.content

        try:
            return json.loads(json_str)
        except json.JSONDecodeError as e:
            raise ValueError(f"Content at CID {cid} is not valid JSON: {e}")

    async def pin(self, cid: str) -> bool:
        """
        Pin content to ensure persistence.

        Args:
            cid: Content identifier to pin

        Returns:
            True if successfully pinned

        Validates: Requirements 5.6
        """
        # Yield to event loop (placeholder for actual IPFS async pin)
        await asyncio.sleep(0)

        if cid not in self._storage:
            raise ValueError(f"Content not found for CID: {cid}")

        self._pins.add(cid)

        if cid in self._metadata:
            self._metadata[cid]["pinned"] = True

        logger.info(f"Pinned content: CID={cid}")
        return True

    async def unpin(self, cid: str) -> bool:
        """
        Unpin content.

        Args:
            cid: Content identifier to unpin

        Returns:
            True if successfully unpinned
        """
        # Yield to event loop (placeholder for actual IPFS async unpin)
        await asyncio.sleep(0)

        self._pins.discard(cid)

        if cid in self._metadata:
            self._metadata[cid]["pinned"] = False

        logger.info(f"Unpinned content: CID={cid}")
        return True

    def is_pinned(self, cid: str) -> bool:
        """Check if content is pinned."""
        return cid in self._pins

    def get_ipfs_url(self, cid: str) -> str:
        """
        Get IPFS URL for a CID.

        Args:
            cid: Content identifier

        Returns:
            IPFS URL string
        """
        return f"ipfs://{cid}"

    def get_gateway_url(self, cid: str) -> str:
        """
        Get HTTP gateway URL for a CID.

        Args:
            cid: Content identifier

        Returns:
            HTTP gateway URL string
        """
        return f"https://ipfs.io/ipfs/{cid}"

    async def verify_content(
        self, cid: str, expected_content: Union[bytes, str]
    ) -> bool:
        """
        Verify that stored content matches expected content.

        This validates the IPFS round-trip property (Property 10).

        Args:
            cid: Content identifier
            expected_content: Expected content to verify against

        Returns:
            True if content matches

        Validates: Requirements 5.5 (Property 10: IPFS Content Round-Trip)
        """
        try:
            stored = await self.get_content(cid)

            if isinstance(expected_content, str):
                expected_bytes = expected_content.encode('utf-8')
            else:
                expected_bytes = expected_content

            return stored.content == expected_bytes
        except ValueError:
            return False


# Singleton instance
_ipfs_service: Optional[IPFSService] = None


def get_ipfs_service() -> IPFSService:
    """Get the singleton IPFS service instance."""
    global _ipfs_service
    if _ipfs_service is None:
        _ipfs_service = IPFSService()
    return _ipfs_service
