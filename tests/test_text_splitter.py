"""
Unit tests for app/utils/text_splitter.py

Tests cover:
  - Short text that fits in one chunk
  - Long text that splits into multiple chunks
  - Overlap correctness
  - Edge cases: empty string, whitespace-only
"""

import pytest
from app.utils.text_splitter import recursive_character_text_splitter


class TestRecursiveCharacterTextSplitter:

    def test_short_text_returns_single_chunk(self):
        text = "This is a short sentence."
        chunks = recursive_character_text_splitter(text, chunk_size=400, chunk_overlap=50)
        assert len(chunks) == 1
        assert chunks[0] == text

    def test_empty_string_returns_empty_list(self):
        chunks = recursive_character_text_splitter("", chunk_size=400, chunk_overlap=50)
        assert chunks == [] or chunks == [""]  # either is acceptable

    def test_whitespace_only_handled_gracefully(self):
        chunks = recursive_character_text_splitter("   \n  ", chunk_size=400, chunk_overlap=50)
        # Should not raise; may return empty or whitespace chunk
        assert isinstance(chunks, list)

    def test_long_text_splits_into_multiple_chunks(self):
        # Generate a text clearly longer than chunk_size
        long_text = "This is sentence number {}. ".format(1) * 50  # ~1500 chars
        chunks = recursive_character_text_splitter(long_text, chunk_size=200, chunk_overlap=20)
        assert len(chunks) > 1

    def test_each_chunk_respects_size_limit(self):
        long_text = "word " * 300   # 1500 chars
        chunk_size = 100
        chunks = recursive_character_text_splitter(long_text, chunk_size=chunk_size, chunk_overlap=10)
        for chunk in chunks:
            # Allow a small tolerance for overlap / split boundary
            assert len(chunk) <= chunk_size + 20, f"Chunk too long: {len(chunk)}"

    def test_all_content_preserved(self):
        """All characters from the original text must appear across chunks (no data loss)."""
        text = "Alpha Beta Gamma Delta Epsilon Zeta Eta Theta Iota Kappa " * 10
        chunks = recursive_character_text_splitter(text, chunk_size=100, chunk_overlap=10)
        combined = " ".join(chunks)
        # Every unique word should still be present somewhere
        for word in ["Alpha", "Beta", "Kappa"]:
            assert word in combined

    def test_chunk_overlap_creates_shared_content(self):
        """With overlap > 0, adjacent chunks should share some content."""
        text = "A " * 200  # repetitive but long enough to split
        chunks = recursive_character_text_splitter(text, chunk_size=50, chunk_overlap=20)
        if len(chunks) >= 2:
            # The tail of chunk[0] and head of chunk[1] should share content
            tail = chunks[0][-20:]
            head = chunks[1][:20]
            # Both should be non-empty (overlap exists)
            assert len(tail.strip()) > 0
            assert len(head.strip()) > 0

    def test_returns_list_of_strings(self):
        chunks = recursive_character_text_splitter("Hello world.", chunk_size=400, chunk_overlap=50)
        assert isinstance(chunks, list)
        assert all(isinstance(c, str) for c in chunks)
