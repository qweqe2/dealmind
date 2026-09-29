"""
Tests for Hindsight memory service.

These tests verify the Hindsight service integration without requiring
actual Anthropic credits or a running Hindsight server.
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime
from app.services.hindsight_service import HindsightService
import hindsight_client


class TestHindsightService:
    """Test suite for HindsightService."""

    def test_service_disabled_without_config(self):
        """Test that service is disabled when HINDSIGHT_API_URL is not set."""
        with patch("app.services.hindsight_service.settings") as mock_settings:
            mock_settings.HINDSIGHT_API_URL = ""
            service = HindsightService()
            assert not service.enabled

    def test_service_disabled_on_import_error(self):
        """Test that service is disabled when hindsight-client is not installed."""
        with patch("app.services.hindsight_service.settings") as mock_settings:
            mock_settings.HINDSIGHT_API_URL = "http://localhost:8888"
            with patch.dict("sys.modules", {"hindsight_client": None}):
                service = HindsightService()
                assert not service.enabled

    def test_service_enabled_with_valid_config(self):
        """Test that service is enabled with valid configuration."""
        with patch("app.services.hindsight_service.settings") as mock_settings:
            mock_settings.HINDSIGHT_API_URL = "http://localhost:8888"
            mock_settings.HINDSIGHT_API_KEY = "test-key"

            mock_client = Mock()
            with patch("hindsight_client.Hindsight", return_value=mock_client):
                service = HindsightService()
                assert service.enabled
                assert service._client == mock_client

    def test_ensure_bank_exists_creates_bank(self):
        """Test that ensure_bank_exists creates a bank if it doesn't exist."""
        mock_client = Mock()
        mock_client.get_bank.side_effect = Exception("Bank not found")
        mock_client.create_bank = Mock()

        with patch("app.services.hindsight_service.settings") as mock_settings:
            mock_settings.HINDSIGHT_API_URL = "http://localhost:8888"
            with patch("hindsight_client.Hindsight", return_value=mock_client):
                service = HindsightService()
                result = service.ensure_bank_exists("test-bank")

                assert result is True
                mock_client.create_bank.assert_called_once()

    def test_ensure_bank_exists_returns_true_if_exists(self):
        """Test that ensure_bank_exists returns True if bank already exists."""
        mock_client = Mock()
        mock_client.get_bank = Mock()  # Bank exists

        with patch("app.services.hindsight_service.settings") as mock_settings:
            mock_settings.HINDSIGHT_API_URL = "http://localhost:8888"
            with patch("hindsight_client.Hindsight", return_value=mock_client):
                service = HindsightService()
                result = service.ensure_bank_exists("test-bank")

                assert result is True
                mock_client.create_bank.assert_not_called()

    def test_retain_memory_returns_false_when_disabled(self):
        """Test that retain_memory returns False when service is disabled."""
        service = HindsightService()
        result = service.retain_memory(
            bank_id="test-bank",
            content="Test memory",
        )
        assert result is False

    def test_retain_memory_calls_client(self):
        """Test that retain_memory calls the Hindsight client."""
        mock_client = Mock()
        mock_client.retain = Mock()

        with patch("app.services.hindsight_service.settings") as mock_settings:
            mock_settings.HINDSIGHT_API_URL = "http://localhost:8888"
            with patch("hindsight_client.Hindsight", return_value=mock_client):
                service = HindsightService()
                result = service.retain_memory(
                    bank_id="test-bank",
                    content="Test memory",
                    context="test context",
                    document_id="doc-1",
                )

                assert result is True
                mock_client.retain.assert_called_once()

    def test_recall_memories_returns_empty_when_disabled(self):
        """Test that recall_memories returns empty list when service is disabled."""
        service = HindsightService()
        result = service.recall_memories(
            bank_id="test-bank",
            query="test query",
        )
        assert result == []

    def test_recall_memories_returns_results(self):
        """Test that recall_memories returns formatted results."""
        mock_client = Mock()
        mock_result = Mock()
        mock_result.text = "Test memory"
        mock_result.type = "world"
        mock_result.metadata = {"key": "value"}

        mock_response = Mock()
        mock_response.results = [mock_result]
        mock_client.recall = Mock(return_value=mock_response)

        with patch("app.services.hindsight_service.settings") as mock_settings:
            mock_settings.HINDSIGHT_API_URL = "http://localhost:8888"
            with patch("hindsight_client.Hindsight", return_value=mock_client):
                service = HindsightService()
                results = service.recall_memories(
                    bank_id="test-bank",
                    query="test query",
                )

                assert len(results) == 1
                assert results[0]["text"] == "Test memory"
                assert results[0]["type"] == "world"

    def test_reflect_returns_none_when_disabled(self):
        """Test that reflect returns None when service is disabled."""
        service = HindsightService()
        result = service.reflect(
            bank_id="test-bank",
            query="test query",
        )
        assert result is None

    def test_reflect_returns_answer(self):
        """Test that reflect returns the generated answer."""
        mock_client = Mock()
        mock_answer = Mock()
        mock_answer.text = "Generated answer"
        mock_client.reflect = Mock(return_value=mock_answer)

        with patch("app.services.hindsight_service.settings") as mock_settings:
            mock_settings.HINDSIGHT_API_URL = "http://localhost:8888"
            with patch("hindsight_client.Hindsight", return_value=mock_client):
                service = HindsightService()
                result = service.reflect(
                    bank_id="test-bank",
                    query="test query",
                )

                assert result == "Generated answer"

    def test_error_handling_in_retain_memory(self):
        """Test that retain_memory handles errors gracefully."""
        mock_client = Mock()
        mock_client.retain = Mock(side_effect=Exception("API error"))

        with patch("app.services.hindsight_service.settings") as mock_settings:
            mock_settings.HINDSIGHT_API_URL = "http://localhost:8888"
            with patch("hindsight_client.Hindsight", return_value=mock_client):
                service = HindsightService()
                result = service.retain_memory(
                    bank_id="test-bank",
                    content="Test memory",
                )

                assert result is False

    def test_error_handling_in_recall_memories(self):
        """Test that recall_memories handles errors gracefully."""
        mock_client = Mock()
        mock_client.recall = Mock(side_effect=Exception("API error"))

        with patch("app.services.hindsight_service.settings") as mock_settings:
            mock_settings.HINDSIGHT_API_URL = "http://localhost:8888"
            with patch("hindsight_client.Hindsight", return_value=mock_client):
                service = HindsightService()
                result = service.recall_memories(
                    bank_id="test-bank",
                    query="test query",
                )

                assert result == []

    def test_error_handling_in_reflect(self):
        """Test that reflect handles errors gracefully."""
        mock_client = Mock()
        mock_client.reflect = Mock(side_effect=Exception("API error"))

        with patch("app.services.hindsight_service.settings") as mock_settings:
            mock_settings.HINDSIGHT_API_URL = "http://localhost:8888"
            with patch("hindsight_client.Hindsight", return_value=mock_client):
                service = HindsightService()
                result = service.reflect(
                    bank_id="test-bank",
                    query="test query",
                )

                assert result is None
