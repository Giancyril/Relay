"""
Unit tests for app/services/rag_service.py

Tests cover:
  - RAGResult structure
  - High distance triggers escalation
  - LLM uncertainty phrase triggers escalation
  - Top distance calculation
  - Escalation logging triggered on low confidence
"""

import os
from unittest.mock import MagicMock, patch

import pytest
from app.services.rag_service import query_rag, RAGResult, RetrievedChunk, _ESCALATION_PHRASE

os.environ["GEMINI_API_KEY"] = "mock_key_for_dev"


class TestRAGService:

    @patch("app.services.rag_service.get_collection")
    @patch("app.services.rag_service.get_embeddings")
    @patch("app.services.rag_service.generate_answer")
    @patch("app.services.rag_service.escalation_logger")
    def test_query_rag_in_scope_success(
        self, mock_logger, mock_gen_answer, mock_get_embeddings, mock_get_collection
    ):
        # Mock embeddings
        mock_get_embeddings.return_value = [[0.1] * 768]

        # Mock ChromaDB query return
        mock_col = MagicMock()
        mock_col.query.return_value = {
            "documents": [["Our return policy is 30 days."]],
            "metadatas": [[{"source": "faq_returns_01"}]],
            "distances": [[0.15]],  # Low distance (good match)
        }
        mock_get_collection.return_value = mock_col

        # Mock LLM answer
        mock_gen_answer.return_value = "You can return products within 30 days."

        result = query_rag("What is your return policy?", top_k=1)

        assert isinstance(result, RAGResult)
        assert result.answer == "You can return products within 30 days."
        assert result.should_escalate is False
        assert result.top_distance == 0.15
        assert len(result.retrieved_chunks) == 1
        assert result.retrieved_chunks[0].source == "faq_returns_01"
        mock_logger.log.assert_not_called()

    @patch("app.services.rag_service.get_collection")
    @patch("app.services.rag_service.get_embeddings")
    @patch("app.services.rag_service.generate_answer")
    @patch("app.services.rag_service.escalation_logger")
    def test_query_rag_escalates_on_high_distance(
        self, mock_logger, mock_gen_answer, mock_get_embeddings, mock_get_collection
    ):
        mock_get_embeddings.return_value = [[0.1] * 768]
        mock_col = MagicMock()
        mock_col.query.return_value = {
            "documents": [["Unrelated content"]],
            "metadatas": [[{"source": "faq_unrelated"}]],
            "distances": [[0.85]],  # Exceeds threshold (0.50)
        }
        mock_get_collection.return_value = mock_col
        mock_gen_answer.return_value = "Uncertain answer"

        result = query_rag("What is the quantum speed of dark matter?")

        assert result.should_escalate is True
        assert result.top_distance == 0.85
        mock_logger.log.assert_called_once()

    @patch("app.services.rag_service.get_collection")
    @patch("app.services.rag_service.get_embeddings")
    @patch("app.services.rag_service.generate_answer")
    @patch("app.services.rag_service.escalation_logger")
    def test_query_rag_escalates_on_llm_uncertainty_phrase(
        self, mock_logger, mock_gen_answer, mock_get_embeddings, mock_get_collection
    ):
        mock_get_embeddings.return_value = [[0.1] * 768]
        mock_col = MagicMock()
        mock_col.query.return_value = {
            "documents": [["Some content"]],
            "metadatas": [[{"source": "faq_01"}]],
            "distances": [[0.20]],  # Low distance (good match)
        }
        mock_get_collection.return_value = mock_col
        # LLM explicitly uses the escalation phrase
        mock_gen_answer.return_value = f"I'm sorry, {_ESCALATION_PHRASE}"

        result = query_rag("Complex custom question")

        assert result.should_escalate is True
        mock_logger.log.assert_called_once()
