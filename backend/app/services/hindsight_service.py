"""
Hindsight Memory Service

This service provides long-term memory capabilities for the DealMind agent using Hindsight.
It handles storing and retrieving memories about user preferences, deal observations,
and important context from conversations.
"""

from typing import Optional, List
from datetime import datetime
from app.core.config import settings


class HindsightService:
    """Service for interacting with Hindsight memory API."""

    def __init__(self):
        self._client = None
        self._enabled = False
        self._initialize_client()

    def _initialize_client(self):
        """Initialize Hindsight client if credentials are configured."""
        if not settings.HINDSIGHT_API_URL:
            return

        try:
            from hindsight_client import Hindsight

            self._client = Hindsight(
                base_url=settings.HINDSIGHT_API_URL,
                api_key=settings.HINDSIGHT_API_KEY if settings.HINDSIGHT_API_KEY else None,
                timeout=30.0,
            )
            self._enabled = True
        except ImportError:
            # hindsight-client not installed
            self._enabled = False
        except Exception:
            # Client initialization failed
            self._enabled = False

    @property
    def enabled(self) -> bool:
        """Check if Hindsight service is available."""
        return self._enabled and self._client is not None

    def ensure_bank_exists(self, bank_id: str) -> bool:
        """
        Ensure a memory bank exists, creating it if necessary.

        Args:
            bank_id: The bank identifier

        Returns:
            True if bank exists or was created, False on failure
        """
        if not self.enabled:
            return False

        try:
            # Try to get bank info to check if it exists
            try:
                self._client.get_bank(bank_id=bank_id)
                return True
            except Exception:
                # Bank doesn't exist, create it
                pass

            # Create the bank
            self._client.create_bank(
                bank_id=bank_id,
                name="DealMind Agent Memory",
                mission="Store and retrieve memories about sales deals, user preferences, and important context for the DealMind AI assistant.",
            )
            return True
        except Exception:
            return False

    def retain_memory(
        self,
        bank_id: str,
        content: str,
        context: Optional[str] = None,
        document_id: Optional[str] = None,
        metadata: Optional[dict] = None,
        timestamp: Optional[datetime] = None,
    ) -> bool:
        """
        Store a memory in Hindsight.

        Args:
            bank_id: The memory bank identifier
            content: The memory content to store
            context: Optional context for the memory
            document_id: Optional document identifier
            metadata: Optional metadata dictionary
            timestamp: Optional timestamp for the memory

        Returns:
            True if memory was stored successfully, False otherwise
        """
        if not self.enabled:
            return False

        try:
            self._client.retain(
                bank_id=bank_id,
                content=content,
                context=context,
                document_id=document_id,
                metadata=metadata or {},
                timestamp=timestamp,
                retain_async=False,
            )
            return True
        except Exception:
            return False

    def recall_memories(
        self,
        bank_id: str,
        query: str,
        types: Optional[List[str]] = None,
        max_tokens: int = 4096,
        budget: str = "mid",
    ) -> List[dict]:
        """
        Recall relevant memories from Hindsight.

        Args:
            bank_id: The memory bank identifier
            query: The search query
            types: Optional list of fact types to filter (world, experience, observation)
            max_tokens: Maximum tokens for response
            budget: Retrieval budget (low, mid, high)

        Returns:
            List of memory dictionaries with text, type, and metadata
        """
        if not self.enabled:
            return []

        try:
            results = self._client.recall(
                bank_id=bank_id,
                query=query,
                types=types,
                max_tokens=max_tokens,
                budget=budget,
            )

            return [
                {
                    "text": r.text,
                    "type": r.type,
                    "metadata": r.metadata if hasattr(r, "metadata") else {},
                }
                for r in results.results
            ]
        except Exception:
            return []

    def reflect(
        self,
        bank_id: str,
        query: str,
        context: Optional[str] = None,
        budget: str = "mid",
    ) -> Optional[str]:
        """
        Generate a contextual answer using Hindsight's reflect capability.

        Args:
            bank_id: The memory bank identifier
            query: The question to answer
            context: Optional context for the answer
            budget: Computation budget (low, mid, high)

        Returns:
            Generated answer string, or None on failure
        """
        if not self.enabled:
            return None

        try:
            answer = self._client.reflect(
                bank_id=bank_id,
                query=query,
                context=context,
                budget=budget,
            )
            return answer.text
        except Exception:
            return None


# Global instance
hindsight_service = HindsightService()
