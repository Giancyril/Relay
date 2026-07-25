"""
Unit tests for app/services/escalation_logger.py

Tests cover:
  - log() writes a valid JSONL record to the file
  - Multiple calls append separate records (not overwrite)
  - All fields are present and correctly typed
  - Records returned newest-first when read back
  - Handler registration and invocation
  - File write failure is caught gracefully (no exception propagated)
"""

import json
import os
import pytest

from app.services.escalation_logger import EscalationLogger, EscalationRecord


class TestEscalationLogger:

    def _make_logger(self, tmp_path) -> EscalationLogger:
        log_file = str(tmp_path / "test_escalations.jsonl")
        return EscalationLogger(log_path=log_file)

    def _read_records(self, logger: EscalationLogger) -> list[dict]:
        with open(logger._log_path, "r", encoding="utf-8") as f:
            return [json.loads(line) for line in f if line.strip()]

    # ------------------------------------------------------------------
    # Basic write / read
    # ------------------------------------------------------------------

    def test_log_creates_file(self, tmp_path):
        logger = self._make_logger(tmp_path)
        assert not os.path.exists(logger._log_path)

        logger.log(
            question="How do I cancel?",
            top_distance=0.95,
            confidence_score=0.05,
            answer="[MOCK] I don't have enough info.",
            distance_triggered=True,
            llm_triggered=False,
        )
        assert os.path.exists(logger._log_path)

    def test_log_writes_valid_json(self, tmp_path):
        logger = self._make_logger(tmp_path)
        logger.log(
            question="What is the refund policy?",
            top_distance=0.80,
            confidence_score=0.20,
            answer="Some answer here.",
            distance_triggered=True,
            llm_triggered=False,
        )
        records = self._read_records(logger)
        assert len(records) == 1
        r = records[0]
        assert r["question"] == "What is the refund policy?"
        assert r["top_distance"] == pytest.approx(0.80, abs=1e-4)
        assert r["confidence_score"] == pytest.approx(0.20, abs=1e-4)
        assert r["distance_triggered"] is True
        assert r["llm_triggered"] is False

    def test_log_has_all_required_fields(self, tmp_path):
        logger = self._make_logger(tmp_path)
        logger.log(
            question="Q",
            top_distance=0.9,
            confidence_score=0.1,
            answer="A",
            distance_triggered=True,
            llm_triggered=True,
            session_id="sess-xyz",
        )
        records = self._read_records(logger)
        r = records[0]
        required_fields = {
            "timestamp", "question", "top_distance", "confidence_score",
            "answer_preview", "distance_triggered", "llm_triggered",
            "session_id", "notes",
        }
        assert required_fields.issubset(r.keys())

    def test_log_truncates_answer_to_200_chars(self, tmp_path):
        logger = self._make_logger(tmp_path)
        long_answer = "X" * 500
        logger.log(
            question="Q",
            top_distance=0.9,
            confidence_score=0.1,
            answer=long_answer,
            distance_triggered=True,
            llm_triggered=False,
        )
        records = self._read_records(logger)
        assert len(records[0]["answer_preview"]) == 200

    def test_multiple_logs_append_correctly(self, tmp_path):
        logger = self._make_logger(tmp_path)
        for i in range(3):
            logger.log(
                question=f"Question {i}",
                top_distance=0.9,
                confidence_score=0.1,
                answer="Answer",
                distance_triggered=True,
                llm_triggered=False,
            )
        records = self._read_records(logger)
        assert len(records) == 3
        assert records[0]["question"] == "Question 0"
        assert records[2]["question"] == "Question 2"

    def test_session_id_stored_correctly(self, tmp_path):
        logger = self._make_logger(tmp_path)
        logger.log(
            question="Q",
            top_distance=0.9,
            confidence_score=0.1,
            answer="A",
            distance_triggered=True,
            llm_triggered=False,
            session_id="my-session-42",
        )
        records = self._read_records(logger)
        assert records[0]["session_id"] == "my-session-42"

    # ------------------------------------------------------------------
    # Handler hooks
    # ------------------------------------------------------------------

    def test_registered_handler_is_called(self, tmp_path):
        logger = self._make_logger(tmp_path)
        received = []

        def my_handler(record: EscalationRecord):
            received.append(record)

        logger.add_handler(my_handler)
        logger.log(
            question="Handler test",
            top_distance=0.9,
            confidence_score=0.1,
            answer="A",
            distance_triggered=True,
            llm_triggered=False,
        )
        assert len(received) == 1
        assert received[0].question == "Handler test"

    def test_failing_handler_does_not_raise(self, tmp_path):
        logger = self._make_logger(tmp_path)

        def bad_handler(record):
            raise RuntimeError("Handler crash!")

        logger.add_handler(bad_handler)
        # Should not propagate the exception
        logger.log(
            question="Q",
            top_distance=0.9,
            confidence_score=0.1,
            answer="A",
            distance_triggered=True,
            llm_triggered=False,
        )

    # ------------------------------------------------------------------
    # Graceful failure
    # ------------------------------------------------------------------

    def test_unwritable_path_does_not_raise(self):
        logger = EscalationLogger(log_path="/invalid_path/no_permission/esc.jsonl")
        # Should log the error internally but NOT raise
        logger.log(
            question="Q",
            top_distance=0.9,
            confidence_score=0.1,
            answer="A",
            distance_triggered=True,
            llm_triggered=False,
        )
