"""
Escalation Logger — records low-confidence / unanswered queries for review.

Design goals:
  - Single responsibility: only logs; does NOT decide whether to escalate.
  - Extensible: add Slack/email/ticket notifiers as separate handler classes
    without touching RAGService or the confidence logic.
  - Zero-dependency fallback: if the log file can't be written, the error is
    caught and logged via Python's standard logging module so the API never
    breaks due to a logging failure.

File format: newline-delimited JSON (JSONL), one record per line.
Default path: ./escalations.jsonl (override via ESCALATION_LOG_PATH env var).
"""

from __future__ import annotations

import json
import logging
import os
from datetime import datetime, timezone
from dataclasses import asdict, dataclass, field
from typing import Optional

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Record schema
# ---------------------------------------------------------------------------


@dataclass
class EscalationRecord:
    """Structured record written for each escalated query."""

    timestamp: str
    question: str
    top_distance: float
    confidence_score: float
    answer_preview: str          # first 200 chars of the LLM answer
    distance_triggered: bool     # True if distance threshold crossed
    llm_triggered: bool          # True if LLM expressed uncertainty
    session_id: Optional[str] = None
    notes: str = ""              # reserved for future use (ticket ID, etc.)


# ---------------------------------------------------------------------------
# Logger class
# ---------------------------------------------------------------------------


class EscalationLogger:
    """
    Writes escalation records to a local JSONL file.

    To add a new notification channel (e.g. Slack), subclass this and
    override `_notify()`, or register a handler via `add_handler()`.
    """

    def __init__(self, log_path: str | None = None) -> None:
        self._log_path = log_path or os.environ.get(
            "ESCALATION_LOG_PATH", "./escalations.jsonl"
        )
        self._handlers: list = []   # callable(record: EscalationRecord) hooks

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def add_handler(self, handler) -> None:
        """
        Register a callable that will be invoked for every escalation.

        Example:
            def slack_notify(record: EscalationRecord):
                slack_client.chat_postMessage(...)

            escalation_logger.add_handler(slack_notify)
        """
        self._handlers.append(handler)

    def log(
        self,
        *,
        question: str,
        top_distance: float,
        confidence_score: float,
        answer: str,
        distance_triggered: bool,
        llm_triggered: bool,
        session_id: str | None = None,
    ) -> EscalationRecord:
        """
        Create and persist an escalation record.

        Args:
            question: The user's original question.
            top_distance: Cosine distance of the closest retrieved chunk.
            confidence_score: Derived confidence (1 - top_distance).
            answer: Full LLM answer text.
            distance_triggered: Whether the distance threshold caused escalation.
            llm_triggered: Whether the LLM's own wording caused escalation.
            session_id: Optional session identifier.

        Returns:
            The EscalationRecord that was written.
        """
        record = EscalationRecord(
            timestamp=datetime.now(timezone.utc).isoformat(),
            question=question,
            top_distance=round(top_distance, 6),
            confidence_score=round(confidence_score, 6),
            answer_preview=answer[:200],
            distance_triggered=distance_triggered,
            llm_triggered=llm_triggered,
            session_id=session_id,
        )

        self._write(record)
        self._run_handlers(record)
        return record

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _write(self, record: EscalationRecord) -> None:
        """Append the record as a JSON line to the log file."""
        try:
            with open(self._log_path, "a", encoding="utf-8") as fh:
                fh.write(json.dumps(asdict(record)) + "\n")
            logger.debug("Escalation logged → %s", self._log_path)
        except OSError as exc:
            # Never crash the API because of a logging failure
            logger.error("Failed to write escalation log: %s", exc)

    def _run_handlers(self, record: EscalationRecord) -> None:
        """Invoke all registered notification handlers."""
        for handler in self._handlers:
            try:
                handler(record)
            except Exception as exc:
                logger.error("Escalation handler %s failed: %s", handler, exc)


# ---------------------------------------------------------------------------
# Shared singleton — import this everywhere
# ---------------------------------------------------------------------------

escalation_logger = EscalationLogger()
