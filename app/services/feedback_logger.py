"""
Feedback Logger — records user ratings (thumbs up / down) and comments.

File format: newline-delimited JSON (JSONL), one record per line.
Default path: ./feedback.jsonl (override via FEEDBACK_LOG_PATH env var).
"""

from __future__ import annotations

import json
import logging
import os
from datetime import datetime, timezone
from dataclasses import asdict, dataclass
from typing import Optional

logger = logging.getLogger(__name__)


@dataclass
class FeedbackRecord:
    """Structured record for user feedback."""

    timestamp: str
    rating: str               # "up" | "down"
    question: str
    answer: str
    comment: Optional[str] = None
    session_id: Optional[str] = None


class FeedbackLogger:
    """Writes feedback records to a local JSONL file."""

    def __init__(self, log_path: str | None = None) -> None:
        self._log_path = log_path or os.environ.get(
            "FEEDBACK_LOG_PATH", "./feedback.jsonl"
        )

    def log(
        self,
        *,
        rating: str,
        question: str,
        answer: str,
        comment: str | None = None,
        session_id: str | None = None,
    ) -> FeedbackRecord:
        record = FeedbackRecord(
            timestamp=datetime.now(timezone.utc).isoformat(),
            rating=rating,
            question=question,
            answer=answer,
            comment=comment,
            session_id=session_id,
        )

        try:
            with open(self._log_path, "a", encoding="utf-8") as fh:
                fh.write(json.dumps(asdict(record)) + "\n")
            logger.debug("Feedback logged → %s", self._log_path)
        except OSError as exc:
            logger.error("Failed to write feedback log: %s", exc)

        return record


feedback_logger = FeedbackLogger()
