"""
Unit tests for app/core/embeddings.py

Tests cover:
  - Mock/dev mode returns correct-length deterministic vectors
  - Same text always produces the same vector (determinism)
  - Different texts produce different vectors
  - Batch embedding via embed_documents
  - Module-level get_embeddings() shortcut
"""

import os
import pytest

os.environ["GEMINI_API_KEY"] = "mock_key_for_dev"

from app.core.embeddings import EmbeddingService, get_embeddings

EXPECTED_DIM = 768


class TestEmbeddingServiceMockMode:

    def setup_method(self):
        self.service = EmbeddingService()

    def test_embed_text_returns_correct_dimension(self):
        vec = self.service.embed_text("Hello world")
        assert len(vec) == EXPECTED_DIM

    def test_embed_text_is_deterministic(self):
        text = "Deterministic embedding test"
        vec1 = self.service.embed_text(text)
        vec2 = self.service.embed_text(text)
        assert vec1 == vec2

    def test_different_texts_produce_different_vectors(self):
        vec1 = self.service.embed_text("Return policy")
        vec2 = self.service.embed_text("Shipping information")
        assert vec1 != vec2

    def test_embed_text_returns_list_of_floats(self):
        vec = self.service.embed_text("Test sentence")
        assert isinstance(vec, list)
        assert all(isinstance(v, float) for v in vec)

    def test_vector_is_normalized(self):
        """SHA-256 mock vectors should be unit-normalised (L2 norm ≈ 1)."""
        import math
        vec = self.service.embed_text("Normalization check")
        norm = math.sqrt(sum(v ** 2 for v in vec))
        assert abs(norm - 1.0) < 1e-5, f"Expected norm ≈ 1, got {norm}"

    def test_embed_documents_batch(self):
        texts = ["First doc", "Second doc", "Third doc"]
        vecs = self.service.embed_documents(texts)
        assert len(vecs) == 3
        for vec in vecs:
            assert len(vec) == EXPECTED_DIM

    def test_empty_text_does_not_raise(self):
        vec = self.service.embed_text("")
        assert len(vec) == EXPECTED_DIM


class TestGetEmbeddingsHelper:

    def test_get_embeddings_returns_list_of_vectors(self):
        vecs = get_embeddings(["Hello", "World"])
        assert len(vecs) == 2
        assert all(len(v) == EXPECTED_DIM for v in vecs)

    def test_get_embeddings_single_item(self):
        vecs = get_embeddings(["single item"])
        assert len(vecs) == 1
        assert len(vecs[0]) == EXPECTED_DIM
