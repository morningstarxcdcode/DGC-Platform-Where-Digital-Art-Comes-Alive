"""
Blockchain Event Listener Service for the DGC Platform.

This module provides functionality for listening to smart contract events
and indexing NFT data for the marketplace and API.
"""

import asyncio
import logging
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Callable, Dict, List, Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class ContractEvent:
    """Represents a blockchain contract event."""

    contract_address: str
    event_name: str
    block_number: int
    transaction_hash: str
    log_index: int
    args: Dict[str, Any]
    timestamp: int


@dataclass
class NFTMintEvent:
    """Parsed NFT mint event data."""

    token_id: int
    creator: str
    metadata_cid: str
    provenance_hash: str
    block_number: int
    transaction_hash: str
    timestamp: int


class BlockchainEventListener:
    """
    Service for listening to blockchain events and indexing NFT data.

    Subscribes to contract events, processes them, and updates the NFT index
    for marketplace functionality.

    Validates: Requirements 7.5
    """

    def __init__(self, rpc_url: str = "http://localhost:8545"):
        """
        Initialize the blockchain event listener.

        Args:
            rpc_url: Ethereum RPC endpoint URL
        """
        self._rpc_url = rpc_url
        self._contracts: Dict[str, Dict[str, Any]] = {}
        self._event_handlers: Dict[str, Callable] = {}
        self._running = False
        self._last_processed_block = 0

        # In-memory event storage (in production, use database)
        self._processed_events: List[ContractEvent] = []

    def add_contract(self, address: str, abi: List[Dict[str, Any]], start_block: int = 0) -> None:
        """
        Add a contract to monitor for events.

        Args:
            address: Contract address to monitor
            abi: Contract ABI for event parsing
            start_block: Block number to start monitoring from
        """
        self._contracts[address.lower()] = {
            "abi": abi,
            "start_block": start_block,
            "events": self._extract_events_from_abi(abi),
        }

        logger.info(f"Added contract for monitoring: {address}")

    def _extract_events_from_abi(self, abi: List[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
        """Extract event definitions from contract ABI."""
        events = {}
        for item in abi:
            if item.get("type") == "event":
                events[item["name"]] = item
        return events

    def register_event_handler(self, event_name: str, handler: Callable) -> None:
        """
        Register a handler function for a specific event.

        Args:
            event_name: Name of the event to handle
            handler: Function to call when event is received
        """
        self._event_handlers[event_name] = handler
        logger.info(f"Registered handler for event: {event_name}")

    async def start_listening(self) -> None:
        """
        Start listening for blockchain events.

        This method runs continuously, polling for new events and processing them.
        """
        self._running = True
        logger.info("Starting blockchain event listener")

        while self._running:
            try:
                await self._poll_events()
                await asyncio.sleep(5)  # Poll every 5 seconds
            except Exception as e:
                logger.error(f"Error in event listener: {e}")
                await asyncio.sleep(10)  # Wait longer on error

    def stop_listening(self) -> None:
        """Stop the event listener."""
        self._running = False
        logger.info("Stopping blockchain event listener")

    async def _poll_events(self) -> None:
        """
        Poll for new events from monitored contracts.

        In production, this would use web3.py or similar library to connect
        to Ethereum and filter events. For now, simulates event processing.
        """
        # Simulate getting latest block number
        latest_block = self._get_latest_block_number()

        if latest_block <= self._last_processed_block:
            return

        # Process events from each contract
        for contract_address, contract_info in self._contracts.items():
            await self._process_contract_events(contract_address, contract_info, latest_block)

        self._last_processed_block = latest_block

    def _get_latest_block_number(self) -> int:
        """
        Get the latest block number from the blockchain.

        In production, this would query the actual blockchain.
        For testing, simulates block progression.
        """
        # Simulate block progression
        import time

        return int(time.time()) // 15  # New block every 15 seconds

    async def _process_contract_events(
        self, contract_address: str, contract_info: Dict[str, Any], to_block: int
    ) -> None:
        """
        Process events for a specific contract in a block range.

        Args:
            contract_address: Address of the contract
            contract_info: Contract ABI and metadata
            to_block: Ending block number
        """
        # In production, this would use web3 event filtering
        # For now, simulate processing some events

        # Simulate finding a Minted event
        if "Minted" in contract_info["events"]:
            # Create a simulated mint event
            event = ContractEvent(
                contract_address=contract_address,
                event_name="Minted",
                block_number=to_block,
                transaction_hash=(f"0x{hash(f'{contract_address}{to_block}'):064x}"),
                log_index=0,
                args={
                    "tokenId": to_block % 1000 + 1,  # Simulate token ID
                    "creator": f"0x{hash(f'creator{to_block}'):040x}",
                    "metadataCID": f"Qm{hash(f'metadata{to_block}'):044x}",
                    "provenanceHash": (f"0x{hash(f'provenance{to_block}'):064x}"),
                },
                timestamp=int(datetime.now().timestamp()),
            )

            await self._handle_event(event)

    async def _handle_event(self, event: ContractEvent) -> None:
        """
        Handle a blockchain event by calling registered handlers.

        Args:
            event: The contract event to handle
        """
        self._processed_events.append(event)

        # Call registered handler if exists
        if event.event_name in self._event_handlers:
            try:
                await self._event_handlers[event.event_name](event)
                logger.info(f"Processed {event.event_name} event: {event.args}")
            except Exception as e:
                logger.error(f"Error handling {event.event_name} event: {e}")
        else:
            logger.debug(f"No handler registered for event: {event.event_name}")

    def get_processed_events(self, event_name: Optional[str] = None) -> List[ContractEvent]:
        """
        Get list of processed events, optionally filtered by event name.

        Args:
            event_name: Optional event name to filter by

        Returns:
            List of processed events
        """
        if event_name:
            return [e for e in self._processed_events if e.event_name == event_name]
        return self._processed_events.copy()


class NFTIndexer:
    """
    Service for indexing NFT data from blockchain events.

    Processes mint events and updates the NFT index for API queries.
    """

    def __init__(self):
        """Initialize the NFT indexer."""
        self._indexed_tokens: Dict[int, Dict[str, Any]] = {}

    async def handle_mint_event(self, event: ContractEvent) -> None:
        """
        Handle an NFT mint event by indexing the token data.

        Args:
            event: The mint event to process

        Validates: Requirements 7.5
        """
        if event.event_name != "Minted":
            return

        # Parse mint event data
        mint_data = NFTMintEvent(
            token_id=event.args["tokenId"],
            creator=event.args["creator"],
            metadata_cid=event.args["metadataCID"],
            provenance_hash=event.args["provenanceHash"],
            block_number=event.block_number,
            transaction_hash=event.transaction_hash,
            timestamp=event.timestamp,
        )

        # Index the NFT
        self._index_nft(mint_data)

        logger.info(f"Indexed NFT: token_id={mint_data.token_id}, " f"creator={mint_data.creator}")

    def _index_nft(self, mint_data: NFTMintEvent) -> None:
        """
        Index NFT data for API queries.

        In production, this would update a database and call the API
        indexing endpoint.
        """
        # Store indexed data
        self._indexed_tokens[mint_data.token_id] = {
            "token_id": mint_data.token_id,
            "creator": mint_data.creator,
            "metadata_cid": mint_data.metadata_cid,
            "provenance_hash": mint_data.provenance_hash,
            "block_number": mint_data.block_number,
            "transaction_hash": mint_data.transaction_hash,
            "timestamp": mint_data.timestamp,
            "indexed_at": int(datetime.now().timestamp()),
        }

        # In production, would make HTTP request to API indexing endpoint
        # POST /api/internal/index-nft with NFT metadata

    def get_indexed_token(self, token_id: int) -> Optional[Dict[str, Any]]:
        """Get indexed data for a token."""
        return self._indexed_tokens.get(token_id)

    def get_all_indexed_tokens(self) -> List[Dict[str, Any]]:
        """Get all indexed tokens."""
        return list(self._indexed_tokens.values())


# Singleton instances
_event_listener: Optional[BlockchainEventListener] = None
_nft_indexer: Optional[NFTIndexer] = None


def get_event_listener() -> BlockchainEventListener:
    """Get the singleton event listener instance."""
    global _event_listener
    if _event_listener is None:
        _event_listener = BlockchainEventListener()
    return _event_listener


def get_nft_indexer() -> NFTIndexer:
    """Get the singleton NFT indexer instance."""
    global _nft_indexer
    if _nft_indexer is None:
        _nft_indexer = NFTIndexer()
    return _nft_indexer


def setup_blockchain_monitoring(
    dgc_token_address: str, dgc_token_abi: List[Dict[str, Any]], start_block: int = 0
) -> None:
    """
    Set up blockchain monitoring for DGC contracts.

    Args:
        dgc_token_address: Address of the DGCToken contract
        dgc_token_abi: ABI of the DGCToken contract
        start_block: Block number to start monitoring from
    """
    listener = get_event_listener()
    indexer = get_nft_indexer()

    # Add DGC Token contract
    listener.add_contract(dgc_token_address, dgc_token_abi, start_block)

    # Register event handlers
    listener.register_event_handler("Minted", indexer.handle_mint_event)

    logger.info("Blockchain monitoring setup complete")


async def start_monitoring() -> None:
    """Start the blockchain event monitoring service."""
    listener = get_event_listener()
    await listener.start_listening()


def stop_monitoring() -> None:
    """Stop the blockchain event monitoring service."""
    listener = get_event_listener()
    listener.stop_listening()
