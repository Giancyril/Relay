"""
Shared pytest fixtures for the AI Customer Support Agent test suite.

All fixtures use mock/in-memory implementations so tests never hit:
  - Real Gemini API
  - Real ChromaDB (disk)
  - Real filesystem (escalation log)
"""

from __future__ import annotations

import os
import json
import tempfile
from typing import Generator
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

# ---------------------------------------------------------------------------
# Environment: ensure we're always in mock/dev mode for tests
# ---------------------------------------------------------------------------

os.environ.setdefault("GEMINI_API_KEY", "mock_key_for_dev")
os.environ.setdefault("ENVIRONMENT", "test")


# ---------------------------------------------------------------------------
# FastAPI test client
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session")
def client() -> Generator[TestClient, None, None]:
    """FastAPI TestClient with a fresh in-memory ChromaDB collection."""
    import chromadb
    from app.core.chromadb_client import ChromaDBClient

    # Patch ChromaDB to use an in-memory (ephemeral) client per test session
    in_memory = chromadb.EphemeralClient()

    def _get_or_create(name=None, **kwargs):
        col_name = name or "test_kb"
        return in_memory.get_or_create_collection(
            name=col_name,
            metadata={"hnsw:space": "cosine"},
        )

    def _delete(name=None):
        try:
            col_name = name or "test_kb"
            in_memory.delete_collection(col_name)
        except Exception:
            pass

    mock_chroma = MagicMock()
    mock_chroma.client = in_memory
    mock_chroma.get_or_create_collection.side_effect = _get_or_create
    mock_chroma.delete_collection.side_effect = _delete

    with patch("app.core.chromadb_client.ChromaDBClient", return_value=mock_chroma):
        with patch("app.core.chromadb_client.get_collection", side_effect=lambda: _get_or_create()):
            from app.main import app
            with TestClient(app) as tc:
                yield tc


# ---------------------------------------------------------------------------
# Temporary escalation log
# ---------------------------------------------------------------------------

@pytest.fixture
def tmp_escalation_log(tmp_path) -> str:
    """Return a path to a temporary escalation log file."""
    return str(tmp_path / "test_escalations.jsonl")
