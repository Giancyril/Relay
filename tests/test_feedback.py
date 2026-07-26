"""
Unit tests for app/services/feedback_logger.py and feedback API endpoints.

Tests cover:
  - FeedbackLogger writes valid JSONL records
  - All fields present in persisted record
  - POST /feedback valid and invalid rating
  - GET /feedback returns correct CSAT calculation
"""

import json
import os
import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient

from app.services.feedback_logger import FeedbackLogger, FeedbackRecord


class TestFeedbackLogger:

    def _make_logger(self, tmp_path) -> FeedbackLogger:
        return FeedbackLogger(log_path=str(tmp_path / "test_feedback.jsonl"))

    def _read_records(self, logger: FeedbackLogger) -> list[dict]:
        with open(logger._log_path, "r", encoding="utf-8") as f:
            return [json.loads(line) for line in f if line.strip()]

    def test_log_creates_file(self, tmp_path):
        logger = self._make_logger(tmp_path)
        assert not os.path.exists(logger._log_path)
        logger.log(rating="up", question="Q", answer="A")
        assert os.path.exists(logger._log_path)

    def test_log_writes_valid_json(self, tmp_path):
        logger = self._make_logger(tmp_path)
        logger.log(rating="up", question="How do I cancel?", answer="You can cancel via settings.")
        records = self._read_records(logger)
        assert len(records) == 1
        r = records[0]
        assert r["rating"] == "up"
        assert r["question"] == "How do I cancel?"
        assert r["answer"] == "You can cancel via settings."

    def test_log_has_all_required_fields(self, tmp_path):
        logger = self._make_logger(tmp_path)
        logger.log(
            rating="down",
            question="Q",
            answer="A",
            comment="Needs more detail",
            session_id="sess-test-123",
        )
        records = self._read_records(logger)
        required = {"timestamp", "rating", "question", "answer", "comment", "session_id"}
        assert required.issubset(records[0].keys())
        assert records[0]["comment"] == "Needs more detail"
        assert records[0]["session_id"] == "sess-test-123"

    def test_multiple_logs_append_correctly(self, tmp_path):
        logger = self._make_logger(tmp_path)
        for rating in ["up", "down", "up"]:
            logger.log(rating=rating, question="Q", answer="A")
        records = self._read_records(logger)
        assert len(records) == 3

    def test_returns_feedback_record_dataclass(self, tmp_path):
        logger = self._make_logger(tmp_path)
        result = logger.log(rating="up", question="Q", answer="A")
        assert isinstance(result, FeedbackRecord)
        assert result.rating == "up"


class TestFeedbackEndpoints:

    def test_post_feedback_valid_up(self, client: TestClient, tmp_path):
        with patch("app.api.router.feedback_logger._log_path", str(tmp_path / "fb.jsonl")):
            response = client.post("/feedback", json={
                "rating": "up",
                "question": "What is your return policy?",
                "answer": "30 days return.",
                "session_id": "sess-1"
            })
            assert response.status_code == 200
            assert response.json()["status"] == "success"

    def test_post_feedback_valid_down(self, client: TestClient, tmp_path):
        with patch("app.api.router.feedback_logger._log_path", str(tmp_path / "fb.jsonl")):
            response = client.post("/feedback", json={
                "rating": "down",
                "question": "How to reset password?",
                "answer": "Some answer.",
                "comment": "Not helpful at all"
            })
            assert response.status_code == 200

    def test_post_feedback_invalid_rating_returns_422(self, client: TestClient):
        response = client.post("/feedback", json={
            "rating": "maybe",
            "question": "Q",
            "answer": "A"
        })
        assert response.status_code == 422

    def test_get_feedback_empty_file(self, client: TestClient, tmp_path):
        with patch("app.api.router.feedback_logger._log_path", str(tmp_path / "non_existent.jsonl")):
            response = client.get("/feedback")
            assert response.status_code == 200
            data = response.json()
            assert data["total_feedback"] == 0
            assert data["csat_score"] == 100.0

    def test_get_feedback_csat_calculation(self, client: TestClient, tmp_path):
        log_file = str(tmp_path / "fb.jsonl")
        with open(log_file, "w", encoding="utf-8") as f:
            f.write(json.dumps({"rating": "up", "question": "Q1", "answer": "A1", "comment": None, "session_id": None, "timestamp": "2026-07-26T00:00:00Z"}) + "\n")
            f.write(json.dumps({"rating": "up", "question": "Q2", "answer": "A2", "comment": None, "session_id": None, "timestamp": "2026-07-26T00:01:00Z"}) + "\n")
            f.write(json.dumps({"rating": "down", "question": "Q3", "answer": "A3", "comment": "Poor answer", "session_id": None, "timestamp": "2026-07-26T00:02:00Z"}) + "\n")

        with patch("app.api.router.feedback_logger._log_path", log_file):
            response = client.get("/feedback")
            assert response.status_code == 200
            data = response.json()
            assert data["total_feedback"] == 3
            assert data["positive_count"] == 2
            assert data["negative_count"] == 1
            assert data["csat_score"] == pytest.approx(66.7, abs=0.2)
