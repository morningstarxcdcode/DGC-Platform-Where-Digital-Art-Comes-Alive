"""
Blockchain Search Engine for the DGC Platform.

This module provides search functionality with autocomplete for blockchain data
including transactions, addresses, tokens, NFTs, and blocks.

Validates: Requirements 15.1-15.10
"""

import asyncio
import logging
from dataclasses import dataclass, field
from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime
from enum import Enum
import re

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SearchCategory(Enum):
    """Categories of blockchain search."""
    TRANSACTION = "TRANSACTION"
    ADDRESS = "ADDRESS"
    TOKEN = "TOKEN"
    NFT = "NFT"
    BLOCK = "BLOCK"
    ALL = "ALL"


@dataclass
class SearchSuggestion:
    """Autocomplete suggestion."""
    text: str
    category: SearchCategory
    icon: str
    metadata: Dict[str, Any] = field(default_factory=dict)
    score: float = 1.0  # Relevance score

    def to_dict(self) -> Dict[str, Any]:
        return {
            "text": self.text,
            "category": self.category.value,
            "icon": self.icon,
            "metadata": self.metadata,
            "score": self.score
        }


@dataclass
class TransactionResult:
    """Transaction search result."""
    hash: str
    from_address: str
    to_address: str
    value: str
    block_number: int
    timestamp: int
    status: str
    method_name: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "type": "transaction",
            "hash": self.hash,
            "from_address": self.from_address,
            "to_address": self.to_address,
            "value": self.value,
            "block_number": self.block_number,
            "timestamp": self.timestamp,
            "status": self.status,
            "method_name": self.method_name
        }


@dataclass
class AddressResult:
    """Address search result."""
    address: str
    balance: str
    transaction_count: int
    is_contract: bool
    label: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "type": "address",
            "address": self.address,
            "balance": self.balance,
            "transaction_count": self.transaction_count,
            "is_contract": self.is_contract,
            "label": self.label
        }


@dataclass
class TokenResult:
    """Token search result."""
    contract_address: str
    name: str
    symbol: str
    decimals: int
    total_supply: str
    price_usd: Optional[float] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "type": "token",
            "contract_address": self.contract_address,
            "name": self.name,
            "symbol": self.symbol,
            "decimals": self.decimals,
            "total_supply": self.total_supply,
            "price_usd": self.price_usd
        }


@dataclass
class NFTResult:
    """NFT search result."""
    contract_address: str
    token_id: int
    name: str
    image_url: Optional[str] = None
    collection_name: Optional[str] = None
    owner: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "type": "nft",
            "contract_address": self.contract_address,
            "token_id": self.token_id,
            "name": self.name,
            "image_url": self.image_url,
            "collection_name": self.collection_name,
            "owner": self.owner
        }


@dataclass
class BlockResult:
    """Block search result."""
    number: int
    hash: str
    timestamp: int
    transaction_count: int
    gas_used: int
    miner: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "type": "block",
            "number": self.number,
            "hash": self.hash,
            "timestamp": self.timestamp,
            "transaction_count": self.transaction_count,
            "gas_used": self.gas_used,
            "miner": self.miner
        }


@dataclass
class SearchResult:
    """Complete search result."""
    query: str
    total_results: int
    transactions: List[TransactionResult] = field(default_factory=list)
    addresses: List[AddressResult] = field(default_factory=list)
    tokens: List[TokenResult] = field(default_factory=list)
    nfts: List[NFTResult] = field(default_factory=list)
    blocks: List[BlockResult] = field(default_factory=list)
    execution_time_ms: int = 0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "query": self.query,
            "total_results": self.total_results,
            "transactions": [t.to_dict() for t in self.transactions],
            "addresses": [a.to_dict() for a in self.addresses],
            "tokens": [t.to_dict() for t in self.tokens],
            "nfts": [n.to_dict() for n in self.nfts],
            "blocks": [b.to_dict() for b in self.blocks],
            "execution_time_ms": self.execution_time_ms
        }


class SuggestionEngine:
    """
    Engine for generating autocomplete suggestions.

    Validates: Requirements 15.1, 15.2, 15.3
    """

    # Category icons
    CATEGORY_ICONS = {
        SearchCategory.TRANSACTION: "🔗",
        SearchCategory.ADDRESS: "👛",
        SearchCategory.TOKEN: "🪙",
        SearchCategory.NFT: "🖼️",
        SearchCategory.BLOCK: "📦"
    }

    # Popular search terms cache
    POPULAR_TERMS = [
        "ethereum", "eth", "usdc", "usdt", "dai", "weth",
        "nft", "mint", "transfer", "swap", "approve"
    ]

    # Known tokens for suggestions
    KNOWN_TOKENS = {
        "eth": {"name": "Ethereum", "symbol": "ETH"},
        "usdc": {"name": "USD Coin", "symbol": "USDC"},
        "usdt": {"name": "Tether", "symbol": "USDT"},
        "dai": {"name": "Dai Stablecoin", "symbol": "DAI"},
        "weth": {"name": "Wrapped Ether", "symbol": "WETH"}
    }

    def __init__(self):
        self._search_history: List[str] = []
        self._popular_cache: Dict[str, int] = {}

    async def get_suggestions(
        self,
        query: str,
        limit: int = 10
    ) -> List[SearchSuggestion]:
        """
        Get autocomplete suggestions for a query.

        Must respond within 200ms per Requirements 15.1
        """
        if not query or len(query) < 1:
            return []

        query_lower = query.lower().strip()
        suggestions = []

        # Check if it's a hex string (transaction hash or address)
        if query_lower.startswith("0x"):
            suggestions.extend(self._get_hex_suggestions(query_lower))

        # Check if it's a number (block number)
        elif query_lower.isdigit():
            suggestions.append(SearchSuggestion(
                text=f"Block #{query}",
                category=SearchCategory.BLOCK,
                icon=self.CATEGORY_ICONS[SearchCategory.BLOCK],
                metadata={"block_number": int(query)}
            ))

        # Token/keyword search
        else:
            suggestions.extend(self._get_keyword_suggestions(query_lower))

        # Sort by score and limit
        suggestions.sort(key=lambda x: x.score, reverse=True)
        return suggestions[:limit]

    def _get_hex_suggestions(self, query: str) -> List[SearchSuggestion]:
        """Get suggestions for hex queries."""
        suggestions = []

        # Full transaction hash (66 chars)
        if len(query) == 66:
            suggestions.append(SearchSuggestion(
                text=f"Transaction {query[:10]}...{query[-8:]}",
                category=SearchCategory.TRANSACTION,
                icon=self.CATEGORY_ICONS[SearchCategory.TRANSACTION],
                metadata={"hash": query},
                score=1.0
            ))

        # Full address (42 chars)
        elif len(query) == 42:
            suggestions.append(SearchSuggestion(
                text=f"Address {query[:10]}...{query[-8:]}",
                category=SearchCategory.ADDRESS,
                icon=self.CATEGORY_ICONS[SearchCategory.ADDRESS],
                metadata={"address": query},
                score=1.0
            ))

        # Partial hex - could be either
        else:
            suggestions.append(SearchSuggestion(
                text=f"Search for {query}...",
                category=SearchCategory.TRANSACTION,
                icon=self.CATEGORY_ICONS[SearchCategory.TRANSACTION],
                metadata={"partial": query},
                score=0.8
            ))
            suggestions.append(SearchSuggestion(
                text=f"Address starting with {query}...",
                category=SearchCategory.ADDRESS,
                icon=self.CATEGORY_ICONS[SearchCategory.ADDRESS],
                metadata={"partial": query},
                score=0.7
            ))

        return suggestions

    def _get_keyword_suggestions(self, query: str) -> List[SearchSuggestion]:
        """Get suggestions for keyword queries."""
        suggestions = []

        # Match against known tokens
        for key, token in self.KNOWN_TOKENS.items():
            if key.startswith(query) or token["name"].lower().startswith(query):
                suggestions.append(SearchSuggestion(
                    text=f"{token['name']} ({token['symbol']})",
                    category=SearchCategory.TOKEN,
                    icon=self.CATEGORY_ICONS[SearchCategory.TOKEN],
                    metadata=token,
                    score=0.9
                ))

        # Match against popular terms
        for term in self.POPULAR_TERMS:
            if term.startswith(query) and term != query:
                suggestions.append(SearchSuggestion(
                    text=term,
                    category=SearchCategory.ALL,
                    icon="🔍",
                    score=0.6
                ))

        # NFT search
        if "nft" in query or query in ["art", "collect", "mint"]:
            suggestions.append(SearchSuggestion(
                text=f"NFTs matching '{query}'",
                category=SearchCategory.NFT,
                icon=self.CATEGORY_ICONS[SearchCategory.NFT],
                metadata={"search_term": query},
                score=0.7
            ))

        return suggestions

    def record_search(self, query: str):
        """Record a search for popularity tracking."""
        self._search_history.append(query)
        query_lower = query.lower()
        self._popular_cache[query_lower] = self._popular_cache.get(query_lower, 0) + 1


class SearchExecutor:
    """
    Executor for blockchain searches.

    Validates: Requirements 15.6
    """

    def __init__(self):
        # In production, these would be real database/API connections
        self._tx_index: Dict[str, TransactionResult] = {}
        self._address_index: Dict[str, AddressResult] = {}
        self._token_index: Dict[str, TokenResult] = {}
        self._nft_index: Dict[str, NFTResult] = {}
        self._block_index: Dict[int, BlockResult] = {}

    async def search(
        self,
        query: str,
        categories: List[SearchCategory] = None,
        filters: Dict[str, Any] = None,
        limit: int = 20,
        offset: int = 0
    ) -> SearchResult:
        """
        Execute a full search across all categories.

        Validates: Requirements 15.2, 15.6
        """
        start_time = datetime.now()

        if categories is None:
            categories = [SearchCategory.ALL]

        filters = filters or {}
        query_lower = query.lower().strip()

        result = SearchResult(query=query, total_results=0)

        # Search transactions
        if SearchCategory.ALL in categories or SearchCategory.TRANSACTION in categories:
            result.transactions = await self._search_transactions(query_lower, filters, limit)

        # Search addresses
        if SearchCategory.ALL in categories or SearchCategory.ADDRESS in categories:
            result.addresses = await self._search_addresses(query_lower, filters, limit)

        # Search tokens
        if SearchCategory.ALL in categories or SearchCategory.TOKEN in categories:
            result.tokens = await self._search_tokens(query_lower, filters, limit)

        # Search NFTs
        if SearchCategory.ALL in categories or SearchCategory.NFT in categories:
            result.nfts = await self._search_nfts(query_lower, filters, limit)

        # Search blocks
        if SearchCategory.ALL in categories or SearchCategory.BLOCK in categories:
            result.blocks = await self._search_blocks(query_lower, filters, limit)

        result.total_results = (
            len(result.transactions) +
            len(result.addresses) +
            len(result.tokens) +
            len(result.nfts) +
            len(result.blocks)
        )

        result.execution_time_ms = int((datetime.now() - start_time).total_seconds() * 1000)

        return result

    async def _search_transactions(
        self,
        query: str,
        filters: Dict[str, Any],
        limit: int
    ) -> List[TransactionResult]:
        """Search for transactions."""
        await asyncio.sleep(0)  # Yield to event loop

        # In production, query database/blockchain
        # Mock results for demonstration
        if query.startswith("0x") and len(query) >= 10:
            return [TransactionResult(
                hash=query + "0" * (66 - len(query)) if len(query) < 66 else query,
                from_address="0x1234567890123456789012345678901234567890",
                to_address="0x0987654321098765432109876543210987654321",
                value="1.0",
                block_number=12345678,
                timestamp=int(datetime.now().timestamp()),
                status="confirmed"
            )]
        return []

    async def _search_addresses(
        self,
        query: str,
        filters: Dict[str, Any],
        limit: int
    ) -> List[AddressResult]:
        """Search for addresses."""
        await asyncio.sleep(0)

        if query.startswith("0x") and len(query) >= 10:
            return [AddressResult(
                address=query + "0" * (42 - len(query)) if len(query) < 42 else query,
                balance="5.25",
                transaction_count=42,
                is_contract=False
            )]
        return []

    async def _search_tokens(
        self,
        query: str,
        filters: Dict[str, Any],
        limit: int
    ) -> List[TokenResult]:
        """Search for tokens."""
        await asyncio.sleep(0)

        # Match known tokens
        results = []
        known_tokens = {
            "eth": ("0x0", "Ethereum", "ETH", 18, "120000000"),
            "usdc": ("0xA0b8...", "USD Coin", "USDC", 6, "40000000000"),
            "dai": ("0x6B17...", "Dai Stablecoin", "DAI", 18, "5000000000")
        }

        for key, (addr, name, symbol, decimals, supply) in known_tokens.items():
            if query in key or query in name.lower():
                results.append(TokenResult(
                    contract_address=addr,
                    name=name,
                    symbol=symbol,
                    decimals=decimals,
                    total_supply=supply,
                    price_usd=1.0 if "usd" in key else 2500.0
                ))

        return results[:limit]

    async def _search_nfts(
        self,
        query: str,
        filters: Dict[str, Any],
        limit: int
    ) -> List[NFTResult]:
        """Search for NFTs."""
        await asyncio.sleep(0)

        # Mock NFT results
        if query:
            return [NFTResult(
                contract_address="0xDGC...",
                token_id=1,
                name=f"Living Art #{query[:10]}",
                image_url="https://example.com/nft.png",
                collection_name="DGC Living NFTs",
                owner="0x..."
            )]
        return []

    async def _search_blocks(
        self,
        query: str,
        filters: Dict[str, Any],
        limit: int
    ) -> List[BlockResult]:
        """Search for blocks."""
        await asyncio.sleep(0)

        # If query is a number, search for that block
        if query.isdigit():
            return [BlockResult(
                number=int(query),
                hash="0x" + "a" * 64,
                timestamp=int(datetime.now().timestamp()),
                transaction_count=150,
                gas_used=15000000,
                miner="0xMiner..."
            )]
        return []


class BlockchainSearchEngine:
    """
    Complete blockchain search engine with autocomplete.

    Validates: Requirements 15.1-15.10
    """

    def __init__(self):
        self.suggestion_engine = SuggestionEngine()
        self.search_executor = SearchExecutor()
        self._search_analytics: List[Dict[str, Any]] = []

    async def autocomplete(
        self,
        query: str,
        limit: int = 10
    ) -> List[SearchSuggestion]:
        """
        Get autocomplete suggestions.

        Validates: Requirements 15.1, 15.3
        """
        return await self.suggestion_engine.get_suggestions(query, limit)

    async def search(
        self,
        query: str,
        categories: List[SearchCategory] = None,
        filters: Dict[str, Any] = None,
        limit: int = 20,
        offset: int = 0
    ) -> SearchResult:
        """
        Execute a search.

        Validates: Requirements 15.2, 15.6
        """
        # Record search for analytics
        self.suggestion_engine.record_search(query)
        self._search_analytics.append({
            "query": query,
            "timestamp": int(datetime.now().timestamp()),
            "categories": [c.value for c in categories] if categories else ["ALL"]
        })

        return await self.search_executor.search(
            query, categories, filters, limit, offset
        )

    def get_search_analytics(self) -> Dict[str, Any]:
        """Get search analytics."""
        return {
            "total_searches": len(self._search_analytics),
            "recent_searches": self._search_analytics[-100:],
            "popular_terms": dict(sorted(
                self.suggestion_engine._popular_cache.items(),
                key=lambda x: x[1],
                reverse=True
            )[:10])
        }


# Singleton instance
_search_engine: Optional[BlockchainSearchEngine] = None


def get_search_engine() -> BlockchainSearchEngine:
    """Get the singleton search engine instance."""
    global _search_engine
    if _search_engine is None:
        _search_engine = BlockchainSearchEngine()
    return _search_engine
