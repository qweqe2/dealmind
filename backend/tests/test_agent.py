"""
Tests for the DealMind agent, focusing on preference memory handling.

These tests verify that preference questions are correctly filtered
and that unrelated deal memories cannot override user preferences.
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from sqlalchemy.orm import Session
from app.agent.agent import (
    _is_preference_question,
    _is_relevant_preference_memory,
    _build_preference_context,
    _memory_text,
)


class TestPreferenceDetection:
    """Test suite for preference question detection."""

    def test_dashboard_color_questions(self):
        """Test that dashboard color questions are detected as preferences."""
        assert _is_preference_question("What is my dashboard color?")
        assert _is_preference_question("My favorite dashboard color")
        assert _is_preference_question("What do I prefer for dashboard color?")
        assert _is_preference_question("favorite dashboard color")

    def test_deal_order_questions(self):
        """Test that deal discussion order questions are detected as preferences."""
        assert _is_preference_question("What is my deal discussion order?")
        assert _is_preference_question("My preferred deal order")
        assert _is_preference_question("priority order for deals")
        assert _is_preference_question("discussion order")

    def test_non_preference_questions(self):
        """Test that non-preference questions are not detected as preferences."""
        assert not _is_preference_question("What deals need attention?")
        assert not _is_preference_question("Tell me about Orion Health")
        assert not _is_preference_question("What is the status of Fieldstone Bank?")
        assert not _is_preference_question("How many deals do I have?")


class TestPreferenceMemoryFiltering:
    """Test suite for preference memory filtering."""

    def test_dashboard_color_memory_relevance(self):
        """Test that dashboard color memories are correctly identified as relevant."""
        question = "What is my favorite dashboard color?"
        
        # Relevant memories
        assert _is_relevant_preference_memory(
            question,
            {"text": "My favorite dashboard color is orange."}
        )
        assert _is_relevant_preference_memory(
            question,
            {"text": "The user prefers orange for their dashboard color."}
        )
        assert _is_relevant_preference_memory(
            question,
            {"text": "User's favorite dashboard color: orange"}
        )
        
        # Irrelevant memories
        assert not _is_relevant_preference_memory(
            question,
            {"text": "Orion Health deal needs attention"}
        )
        assert not _is_relevant_preference_memory(
            question,
            {"text": "Discuss Fieldstone Bank first"}
        )

    def test_deal_order_memory_relevance(self):
        """Test that deal order memories are correctly identified as relevant."""
        question = "What is my deal discussion order?"
        
        # Relevant memories
        assert _is_relevant_preference_memory(
            question,
            {"text": "Discuss Orion Health first, then Fieldstone Bank."}
        )
        assert _is_relevant_preference_memory(
            question,
            {"text": "Orion Health first in deal discussions"}
        )
        assert _is_relevant_preference_memory(
            question,
            {"text": "Fieldstone Bank second"}
        )
        assert _is_relevant_preference_memory(
            question,
            {"text": "User's deal discussion order: Orion Health, Fieldstone Bank"}
        )
        
        # Irrelevant memories
        assert not _is_relevant_preference_memory(
            question,
            {"text": "My favorite dashboard color is orange."}
        )
        assert not _is_relevant_preference_memory(
            question,
            {"text": "Orion Health blocker: pricing issue"}
        )

    def test_generic_preference_memory_relevance(self):
        """Test that generic preference keywords are detected."""
        question = "What do I prefer?"
        
        # Relevant memories with preference keywords
        assert _is_relevant_preference_memory(
            question,
            {"text": "The user prefers morning meetings."}
        )
        assert _is_relevant_preference_memory(
            question,
            {"text": "User's favorite color is blue."}
        )
        assert _is_relevant_preference_memory(
            question,
            {"text": "User preference: concise emails"}
        )
        
        # Irrelevant memories without preference keywords
        assert not _is_relevant_preference_memory(
            question,
            {"text": "Orion Health deal status"}
        )

    def test_empty_memory_handling(self):
        """Test that empty or malformed memories are handled gracefully."""
        question = "What is my dashboard color?"
        
        assert not _is_relevant_preference_memory(question, {})
        assert not _is_relevant_preference_memory(question, {"text": ""})
        assert not _is_relevant_preference_memory(question, {"text": "   "})
        assert not _is_relevant_preference_memory(question, None)
        assert not _is_relevant_preference_memory(question, "not a dict")


class TestPreferenceContextBuilding:
    """Test suite for building preference context."""

    def test_build_context_with_relevant_memories(self):
        """Test building context with relevant preference memories."""
        question = "What is my favorite dashboard color?"
        memories = [
            {"text": "My favorite dashboard color is orange."},
            {"text": "Orion Health deal needs attention"},  # Irrelevant
            {"text": "The user prefers orange for dashboard color."},  # Relevant
            {"text": "Fieldstone Bank is in negotiation"},  # Irrelevant
        ]
        
        context = _build_preference_context(question, memories)
        
        assert "NO_RELEVANT_PREFERENCE_MEMORY_FOUND" not in context
        assert "My favorite dashboard color is orange." in context
        assert "The user prefers orange for dashboard color." in context
        assert "Orion Health" not in context  # Unrelated memories excluded
        assert "Fieldstone Bank" not in context

    def test_build_context_with_no_relevant_memories(self):
        """Test building context when no relevant memories exist."""
        question = "What is my favorite dashboard color?"
        memories = [
            {"text": "Orion Health deal needs attention"},
            {"text": "Fieldstone Bank is in negotiation"},
        ]
        
        context = _build_preference_context(question, memories)
        
        assert context == "NO_RELEVANT_PREFERENCE_MEMORY_FOUND"

    def test_build_context_removes_duplicates(self):
        """Test that duplicate memory texts are removed."""
        question = "What is my favorite dashboard color?"
        memories = [
            {"text": "My favorite dashboard color is orange."},
            {"text": "My favorite dashboard color is orange."},  # Duplicate
            {"text": "The user prefers orange for dashboard color."},
        ]
        
        context = _build_preference_context(question, memories)
        
        # Count occurrences of the duplicate text
        assert context.count("My favorite dashboard color is orange.") == 1

    def test_build_context_with_different_color(self):
        """Test that the fix works for any color, not just orange."""
        question = "What is my favorite dashboard color?"
        memories = [
            {"text": "My favorite dashboard color is blue."},
        ]
        
        context = _build_preference_context(question, memories)
        
        assert "blue" in context
        assert "NO_RELEVANT_PREFERENCE_MEMORY_FOUND" not in context

    def test_build_context_with_deal_order(self):
        """Test building context for deal discussion order."""
        question = "What is my deal discussion order?"
        memories = [
            {"text": "Discuss Orion Health first, then Fieldstone Bank."},
            {"text": "Orion Health blocker: pricing issue"},  # Irrelevant
            {"text": "My favorite dashboard color is orange"},  # Irrelevant
        ]
        
        context = _build_preference_context(question, memories)
        
        assert "Orion Health first" in context
        assert "Fieldstone Bank" in context
        assert "pricing issue" not in context  # Unrelated deal memory excluded
        assert "dashboard color" not in context  # Unrelated preference excluded

    def test_unrelated_deal_memories_cannot_override_preferences(self):
        """
        Test that unrelated deal memories cannot override matching user preferences.
        
        This is the core bug fix: when asking about dashboard color, even if there
        are many deal memories about Orion Health, Fieldstone Bank, etc., they should
        not cause the AI to say no preference is recorded when a matching preference
        memory exists.
        """
        question = "What is my favorite dashboard color?"
        
        # Mix of preference and deal memories
        memories = [
            {"text": "My favorite dashboard color is orange."},  # Matching preference
            {"text": "Orion Health deal needs attention - pricing blocker"},  # Unrelated deal
            {"text": "Fieldstone Bank negotiation stalled"},  # Unrelated deal
            {"text": "TechCorp demo scheduled for next week"},  # Unrelated deal
            {"text": "Orion Health first in deal discussions"},  # Different preference
            {"text": "User prefers morning meetings"},  # Different preference
        ]
        
        context = _build_preference_context(question, memories)
        
        # Only dashboard color preference should be included
        assert "My favorite dashboard color is orange." in context
        # Unrelated deal memories must be excluded
        assert "Orion Health deal needs attention" not in context
        assert "Fieldstone Bank negotiation" not in context
        assert "TechCorp demo" not in context
        # Different preferences should be excluded
        assert "Orion Health first" not in context
        assert "morning meetings" not in context


class TestMemoryTextExtraction:
    """Test suite for memory text extraction."""

    def test_extract_text_from_memory(self):
        """Test extracting text from various memory formats."""
        assert _memory_text({"text": "test"}) == "test"
        assert _memory_text({"content": "test"}) == "test"
        assert _memory_text({"memory": "test"}) == "test"
        assert _memory_text({"text": "test "}) == "test"  # Strips whitespace
        assert _memory_text({}) == ""
        assert _memory_text(None) == ""
        assert _memory_text("not a dict") == ""


class TestSystemPromptConstruction:
    """Test suite for system prompt construction with preference handling."""

    @patch('app.agent.agent.genai.Client')
    @patch('app.agent.agent.hindsight_service')
    @patch('app.agent.agent.settings')
    @patch('app.agent.agent.get_deals_needing_attention')
    def test_preference_question_excludes_full_memory_list(
        self, mock_get_deals, mock_settings, mock_hindsight, mock_client
    ):
        """Test that preference questions don't include the full memory list."""
        from app.agent.agent import run_agent
        
        # Setup mocks
        mock_settings.LLM_API_KEY = "test-key"
        mock_hindsight.enabled = True
        mock_hindsight.ensure_bank_exists = Mock()
        mock_hindsight.recall_memories = Mock(return_value=[
            {"text": "My favorite dashboard color is orange."},
            {"text": "Orion Health deal needs attention"},
        ])
        mock_get_deals.return_value = []  # No deals needing attention
        
        mock_db = Mock(spec=Session)
        mock_response = Mock()
        mock_response.text = "Your favorite dashboard color is orange."
        mock_client.return_value.models.generate_content.return_value = mock_response
        
        # Run with preference question
        result = run_agent("What is my dashboard color?", mock_db)
        
        # Get the system prompt that was passed to Gemini
        call_args = mock_client.return_value.models.generate_content.call_args
        system_prompt = call_args[1]['contents'][0]
        
        # Verify that for preference questions, full memory list is NOT included
        assert "RELEVANT LONG-TERM MEMORY" not in system_prompt
        # But the filtered preference context IS included
        assert "Relevant preference memories" in system_prompt
        assert "My favorite dashboard color is orange." in system_prompt

    @patch('app.agent.agent.genai.Client')
    @patch('app.agent.agent.hindsight_service')
    @patch('app.agent.agent.settings')
    @patch('app.agent.agent.get_deals_needing_attention')
    def test_non_preference_question_includes_full_memory_list(
        self, mock_get_deals, mock_settings, mock_hindsight, mock_client
    ):
        """Test that non-preference questions include the full memory list."""
        from app.agent.agent import run_agent
        
        # Setup mocks
        mock_settings.LLM_API_KEY = "test-key"
        mock_hindsight.enabled = True
        mock_hindsight.ensure_bank_exists = Mock()
        mock_hindsight.recall_memories = Mock(return_value=[
            {"text": "Orion Health deal needs attention"},
            {"text": "Fieldstone Bank is in negotiation"},
        ])
        mock_get_deals.return_value = []  # No deals needing attention
        
        mock_db = Mock(spec=Session)
        mock_response = Mock()
        mock_response.text = "Orion Health needs attention."
        mock_client.return_value.models.generate_content.return_value = mock_response
        
        # Run with non-preference question
        result = run_agent("What deals need attention?", mock_db)
        
        # Get the system prompt that was passed to Gemini
        call_args = mock_client.return_value.models.generate_content.call_args
        system_prompt = call_args[1]['contents'][0]
        
        # Verify that for non-preference questions, full memory list IS included
        assert "RELEVANT LONG-TERM MEMORY" in system_prompt


class TestExplicitPreferenceAcknowledgment:
    """Test suite for immediate acknowledgment of explicit preference statements."""

    @patch('app.agent.agent.genai.Client')
    @patch('app.agent.agent.hindsight_service')
    @patch('app.agent.agent.settings')
    @patch('app.agent.agent.get_deals_needing_attention')
    def test_explicit_preference_immediate_acknowledgment(
        self, mock_get_deals, mock_settings, mock_hindsight, mock_client
    ):
        """
        Regression test for the flow: user states preference → immediate confirmation → subsequent query retrieves preference.
        
        When a user explicitly states a preference like "my favorite dashboard color is blue",
        the agent should immediately acknowledge it in the response instead of saying
        "preference not recorded", even though the preference is being saved for the first time.
        """
        from app.agent.agent import run_agent
        
        # Setup mocks
        mock_settings.LLM_API_KEY = "test-key"
        mock_hindsight.enabled = True
        mock_hindsight.ensure_bank_exists = Mock()
        # Hindsight returns no existing memories (first time stating this preference)
        mock_hindsight.recall_memories = Mock(return_value=[])
        mock_hindsight.retain_memory = Mock()
        mock_get_deals.return_value = []  # No deals needing attention
        
        mock_db = Mock(spec=Session)
        
        # User states explicit preference
        question = "My favorite dashboard color is blue."
        
        # Mock Gemini response that acknowledges the preference
        mock_response = Mock()
        mock_response.text = "Understood. Your favorite dashboard color is blue."
        mock_client.return_value.models.generate_content.return_value = mock_response
        
        # Run the agent
        result = run_agent(question, mock_db)
        
        # Verify the response acknowledges the preference
        assert "Understood" in result["answer"]
        assert "blue" in result["answer"]
        
        # Verify the preference was saved to Hindsight
        mock_hindsight.retain_memory.assert_called()
        # Check that one of the retain_memory calls was for the explicit preference
        retain_calls = mock_hindsight.retain_memory.call_args_list
        explicit_preference_call = None
        for call in retain_calls:
            if call[1].get('context') == "explicit user preference / memory":
                explicit_preference_call = call
                break
        
        assert explicit_preference_call is not None, "Explicit preference was not saved"
        assert explicit_preference_call[1]['content'] == question
        
        # Verify the new preference was added to memory context before response generation
        call_args = mock_client.return_value.models.generate_content.call_args
        system_prompt = call_args[1]['contents'][0]
        # The new preference should be in the context
        assert "My favorite dashboard color is blue." in system_prompt

    @patch('app.agent.agent.genai.Client')
    @patch('app.agent.agent.hindsight_service')
    @patch('app.agent.agent.settings')
    @patch('app.agent.agent.get_deals_needing_attention')
    def test_explicit_preference_deal_order(
        self, mock_get_deals, mock_settings, mock_hindsight, mock_client
    ):
        """Test that explicit deal order preferences are immediately acknowledged."""
        from app.agent.agent import run_agent
        
        # Setup mocks
        mock_settings.LLM_API_KEY = "test-key"
        mock_hindsight.enabled = True
        mock_hindsight.ensure_bank_exists = Mock()
        mock_hindsight.recall_memories = Mock(return_value=[])
        mock_hindsight.retain_memory = Mock()
        mock_get_deals.return_value = []
        
        mock_db = Mock(spec=Session)
        
        # User states explicit deal order preference
        question = "I prefer to discuss Orion Health first, then Fieldstone Bank."
        
        mock_response = Mock()
        mock_response.text = "Understood. You prefer to discuss Orion Health first, then Fieldstone Bank."
        mock_client.return_value.models.generate_content.return_value = mock_response
        
        result = run_agent(question, mock_db)
        
        # Verify acknowledgment
        assert "Understood" in result["answer"]
        assert "Orion Health" in result["answer"]
        assert "Fieldstone Bank" in result["answer"]
        
        # Verify the preference was saved
        mock_hindsight.retain_memory.assert_called()

    @patch('app.agent.agent.genai.Client')
    @patch('app.agent.agent.hindsight_service')
    @patch('app.agent.agent.settings')
    @patch('app.agent.agent.get_deals_needing_attention')
    def test_existing_preference_still_works(
        self, mock_get_deals, mock_settings, mock_hindsight, mock_client
    ):
        """Test that previously saved preferences still work correctly."""
        from app.agent.agent import run_agent
        
        # Setup mocks
        mock_settings.LLM_API_KEY = "test-key"
        mock_hindsight.enabled = True
        mock_hindsight.ensure_bank_exists = Mock()
        # Hindsight returns existing preference
        mock_hindsight.recall_memories = Mock(return_value=[
            {"text": "My favorite dashboard color is orange."}
        ])
        mock_hindsight.retain_memory = Mock()
        mock_get_deals.return_value = []
        
        mock_db = Mock(spec=Session)
        
        # User asks about existing preference (not stating a new one)
        question = "What is my favorite dashboard color?"
        
        mock_response = Mock()
        mock_response.text = "Your favorite dashboard color is orange."
        mock_client.return_value.models.generate_content.return_value = mock_response
        
        result = run_agent(question, mock_db)
        
        # Verify the existing preference is retrieved correctly
        assert "orange" in result["answer"]
        
        # Verify it was NOT saved as an explicit preference (user didn't state it)
        # The interaction should be saved as a regular user interaction, not as an explicit preference
        retain_calls = mock_hindsight.retain_memory.call_args_list
        explicit_preference_calls = [
            call for call in retain_calls 
            if call[1].get('context') == "explicit user preference / memory"
        ]
        assert len(explicit_preference_calls) == 0, "Question should not be saved as explicit preference"

    @patch('app.agent.agent.genai.Client')
    @patch('app.agent.agent.hindsight_service')
    @patch('app.agent.agent.settings')
    @patch('app.agent.agent.get_deals_needing_attention')
    def test_deal_specific_questions_unaffected(
        self, mock_get_deals, mock_settings, mock_hindsight, mock_client
    ):
        """Test that deal-specific questions are not affected by the preference fix."""
        from app.agent.agent import run_agent
        
        # Setup mocks
        mock_settings.LLM_API_KEY = "test-key"
        mock_hindsight.enabled = True
        mock_hindsight.ensure_bank_exists = Mock()
        mock_hindsight.recall_memories = Mock(return_value=[
            {"text": "Orion Health deal needs attention"}
        ])
        mock_hindsight.retain_memory = Mock()
        mock_get_deals.return_value = []
        
        mock_db = Mock(spec=Session)
        
        # User asks a deal-specific question (not a preference)
        question = "What is the status of the Orion Health deal?"
        
        mock_response = Mock()
        mock_response.text = "The Orion Health deal needs attention."
        mock_client.return_value.models.generate_content.return_value = mock_response
        
        result = run_agent(question, mock_db)
        
        # Verify deal question is handled normally
        assert "Orion Health" in result["answer"]
        
        # Verify it was NOT treated as an explicit preference
        retain_calls = mock_hindsight.retain_memory.call_args_list
        explicit_preference_calls = [
            call for call in retain_calls 
            if call[1].get('context') == "explicit user preference / memory"
        ]
        assert len(explicit_preference_calls) == 0, "Deal question should not be saved as explicit preference"

    @patch('app.agent.agent.genai.Client')
    @patch('app.agent.agent.hindsight_service')
    @patch('app.agent.agent.settings')
    @patch('app.agent.agent.get_deals_needing_attention')
    def test_complete_preference_flow(
        self, mock_get_deals, mock_settings, mock_hindsight, mock_client
    ):
        """
        Complete regression test for the exact flow:
        1. User states preference
        2. Agent provides immediate confirmation
        3. Subsequent query retrieves the saved preference
        """
        from app.agent.agent import run_agent
        
        # Setup mocks
        mock_settings.LLM_API_KEY = "test-key"
        mock_hindsight.enabled = True
        mock_hindsight.ensure_bank_exists = Mock()
        mock_get_deals.return_value = []
        mock_db = Mock(spec=Session)
        
        # Step 1: User states explicit preference (first time)
        question1 = "My favorite dashboard color is blue."
        
        # Hindsight returns no existing memories
        mock_hindsight.recall_memories.return_value = []
        
        mock_response1 = Mock()
        mock_response1.text = "Understood. Your favorite dashboard color is blue."
        mock_client.return_value.models.generate_content.return_value = mock_response1
        
        result1 = run_agent(question1, mock_db)
        
        # Verify immediate acknowledgment
        assert "Understood" in result1["answer"]
        assert "blue" in result1["answer"]
        
        # Verify it was saved to Hindsight
        assert mock_hindsight.retain_memory.call_count >= 1
        
        # Step 2: User queries the preference (subsequent query)
        question2 = "What is my favorite dashboard color?"
        
        # Hindsight now returns the saved preference
        mock_hindsight.recall_memories.return_value = [
            {"text": "My favorite dashboard color is blue."}
        ]
        
        mock_response2 = Mock()
        mock_response2.text = "Your favorite dashboard color is blue."
        mock_client.return_value.models.generate_content.return_value = mock_response2
        
        result2 = run_agent(question2, mock_db)
        
        # Verify the preference is retrieved correctly
        assert "blue" in result2["answer"]
        assert "Understood" not in result2["answer"]  # No acknowledgment needed for retrieval
