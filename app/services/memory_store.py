"""
memory_store.py — Thread-safe in-memory conversation history store.

Each session_id maps to a capped list of turn dicts:
    {"role": "user" | "assistant", "text": str}

Max turns per session is controlled by MAX_TURNS (default 8).
"""

from __future__ import annotations

import threading
from collections import deque
from typing import TypedDict

MAX_TURNS = 8  # 4 user + 4 assistant turns


class Turn(TypedDict):
    role: str   # "user" | "assistant"
    text: str


class MemoryStore:
    """Thread-safe, session-keyed conversation history store."""

    def __init__(self, max_turns: int = MAX_TURNS) -> None:
        self._max_turns = max_turns
        self._store: dict[str, deque[Turn]] = {}
        self._lock = threading.Lock()

    def get_history(self, session_id: str) -> list[Turn]:
        """Return recent turns for a session (oldest first)."""
        with self._lock:
            return list(self._store.get(session_id, []))

    def append_turn(self, session_id: str, role: str, text: str) -> None:
        """Append a new turn, evicting the oldest if over the cap."""
        with self._lock:
            if session_id not in self._store:
                self._store[session_id] = deque(maxlen=self._max_turns)
            self._store[session_id].append(Turn(role=role, text=text))

    def clear_session(self, session_id: str) -> None:
        """Remove all history for a session."""
        with self._lock:
            self._store.pop(session_id, None)

    def session_count(self) -> int:
        """Return the number of active sessions in memory."""
        with self._lock:
            return len(self._store)


# Singleton used across the app
memory_store = MemoryStore()
