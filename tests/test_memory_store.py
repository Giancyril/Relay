"""
Unit tests for app/services/memory_store.py conversation history store.

Tests cover:
  - Empty store returns empty list
  - Appending turns stores history in order
  - Memory cap (MAX_TURNS) evicts oldest turns
  - Clear session removes session history
  - Multiple sessions stay isolated
"""

from app.services.memory_store import MemoryStore, MAX_TURNS


class TestMemoryStore:

    def test_empty_store_returns_empty_list(self):
        store = MemoryStore()
        assert store.get_history("sess-new") == []

    def test_append_turn_preserves_order(self):
        store = MemoryStore()
        store.append_turn("sess-1", role="user", text="Hello")
        store.append_turn("sess-1", role="assistant", text="Hi there")

        history = store.get_history("sess-1")
        assert len(history) == 2
        assert history[0] == {"role": "user", "text": "Hello"}
        assert history[1] == {"role": "assistant", "text": "Hi there"}

    def test_memory_cap_evicts_oldest_turns(self):
        store = MemoryStore(max_turns=4)
        for i in range(6):
            store.append_turn("sess-cap", role="user" if i % 2 == 0 else "assistant", text=f"Turn {i}")

        history = store.get_history("sess-cap")
        assert len(history) == 4
        # Oldest turns 0 and 1 should be evicted
        assert history[0]["text"] == "Turn 2"
        assert history[-1]["text"] == "Turn 5"

    def test_clear_session(self):
        store = MemoryStore()
        store.append_turn("sess-clear", role="user", text="Q")
        assert len(store.get_history("sess-clear")) == 1

        store.clear_session("sess-clear")
        assert store.get_history("sess-clear") == []

    def test_multiple_sessions_isolated(self):
        store = MemoryStore()
        store.append_turn("sess-A", role="user", text="Question A")
        store.append_turn("sess-B", role="user", text="Question B")

        hist_A = store.get_history("sess-A")
        hist_B = store.get_history("sess-B")

        assert len(hist_A) == 1
        assert len(hist_B) == 1
        assert hist_A[0]["text"] == "Question A"
        assert hist_B[0]["text"] == "Question B"
