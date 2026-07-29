"""
Integration tests for FastAPI endpoints in app/api/router.py

Tests cover:
  - GET /health
  - POST /chat (validation, response format, sources structure)
  - POST /ingest (default docs, custom docs, reset_collection)
  - GET /escalations (empty, populated, limit query param)
"""

from unittest.mock import patch, MagicMock
import pytest
from fastapi.testclient import TestClient


class TestHealthEndpoint:

    def test_health_check_returns_200_and_healthy(self, client: TestClient):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "chromadb_status" in data
        assert "chromadb_doc_count" in data
        assert "gemini_api_configured" in data


class TestChatEndpoint:

    def test_chat_empty_question_returns_422(self, client: TestClient):
        response = client.post("/chat", json={"question": "   "})
        assert response.status_code == 422

    def test_chat_valid_question_returns_response_schema(self, client: TestClient):
        with patch("app.api.router.query_rag") as mock_rag:
            mock_chunk = MagicMock()
            mock_chunk.source = "faq_01"
            mock_chunk.text = "Sample snippet text for testing..."
            mock_chunk.distance = 0.20

            mock_rag.return_value = MagicMock(
                answer="Sample answer",
                retrieved_chunks=[mock_chunk],
                should_escalate=False,
                top_distance=0.20,
                sentiment="neutral",
                urgency="low",
            )

            response = client.post("/chat", json={"question": "What is your policy?", "session_id": "sess-1"})
            assert response.status_code == 200
            data = response.json()
            assert data["answer"] == "Sample answer"
            assert data["escalated"] is False
            assert data["confidence_score"] == pytest.approx(0.80, abs=1e-4)
            assert len(data["sources"]) == 1
            assert data["sources"][0]["doc_id"] == "faq_01"
            assert data["session_id"] == "sess-1"

    def test_get_session_stats_returns_history(self, client: TestClient):
        response = client.get("/chat/session/sess-1")
        assert response.status_code == 200
        data = response.json()
        assert data["session_id"] == "sess-1"
        assert "turn_count" in data
        assert isinstance(data["active_turns"], list)


class TestIngestEndpoint:

    def test_ingest_default_documents(self, client: TestClient):
        with patch("app.api.router.ingestion_service.ingest_documents") as mock_ingest:
            mock_ingest.return_value = (8, 8)
            response = client.post("/ingest", json={"documents": [], "reset_collection": False})
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "success"
            assert data["chunks_ingested"] == 8
            assert data["total_documents"] == 8

    def test_ingest_custom_documents(self, client: TestClient):
        custom_docs = [
            {"doc_id": "doc1", "title": "Title 1", "content": "Content 1"}
        ]
        with patch("app.api.router.ingestion_service.ingest_documents") as mock_ingest:
            mock_ingest.return_value = (1, 1)
            response = client.post("/ingest", json={"documents": custom_docs, "reset_collection": True})
            assert response.status_code == 200
            data = response.json()
            assert data["chunks_ingested"] == 1
            assert data["total_documents"] == 1


class TestEscalationsEndpoint:

    def test_escalations_non_existent_file(self, client: TestClient, tmp_path):
        with patch("app.api.router.escalation_logger._log_path", str(tmp_path / "non_existent.jsonl")):
            response = client.get("/escalations")
            assert response.status_code == 200
            data = response.json()
            assert data["total"] == 0
            assert data["records"] == []

    def test_escalations_with_data(self, client: TestClient, tmp_path):
        log_file = str(tmp_path / "test_esc.jsonl")
        with open(log_file, "w", encoding="utf-8") as f:
            f.write('{"timestamp": "2026-07-25T00:00:00Z", "question": "Q1", "top_distance": 0.9, "confidence_score": 0.1, "answer_preview": "A1", "distance_triggered": true, "llm_triggered": false}\n')
            f.write('{"timestamp": "2026-07-25T00:01:00Z", "question": "Q2", "top_distance": 0.8, "confidence_score": 0.2, "answer_preview": "A2", "distance_triggered": true, "llm_triggered": false}\n')

        with patch("app.api.router.escalation_logger._log_path", log_file):
            response = client.get("/escalations?limit=1")
            assert response.status_code == 200
            data = response.json()
            assert data["total"] == 2
            assert len(data["records"]) == 1
            assert data["records"][0]["question"] == "Q2"  # Newest first
