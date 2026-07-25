import hashlib
import numpy as np
from typing import List
from app.config import settings


class EmbeddingService:
    """
    Service for generating vector embeddings using Google Gemini API (`text-embedding-004`),
    with fallback deterministic embeddings when in dev/mock mode.
    """

    def __init__(self):
        self.model_name = "text-embedding-004"
        self._client = None

    def _get_client(self):
        if self._client is None and settings.gemini_api_key and settings.gemini_api_key != "mock_key_for_dev":
            try:
                from google import genai
                self._client = genai.Client(api_key=settings.gemini_api_key)
            except Exception as e:
                print(f"[Warning] Failed to initialize Gemini Client: {e}")
                self._client = None
        return self._client

    def embed_text(self, text: str) -> List[float]:
        """Generates embedding vector for a single text string."""
        client = self._get_client()
        if client is not None:
            try:
                response = client.models.embed_content(
                    model=self.model_name,
                    contents=text
                )
                if hasattr(response, "embedding") and hasattr(response.embedding, "values"):
                    return list(response.embedding.values)
                elif hasattr(response, "embeddings") and len(response.embeddings) > 0:
                    return list(response.embeddings[0].values)
            except Exception as e:
                print(f"[Warning] Gemini Embedding API call failed: {e}. Falling back to deterministic embedding.")

        # Fallback deterministic 768-dim pseudo-embedding for offline/mock dev testing
        return self._generate_deterministic_embedding(text)

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Generates embedding vectors for a list of text strings."""
        return [self.embed_text(t) for t in texts]

    def _generate_deterministic_embedding(self, text: str, dim: int = 768) -> List[float]:
        """Creates normalized 768-dimensional vector from SHA-256 hash of text."""
        hash_digest = hashlib.sha256(text.encode("utf-8")).digest()
        seed = int.from_bytes(hash_digest[:4], "big")
        rng = np.random.RandomState(seed)
        vec = rng.randn(dim)
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()


embedding_service = EmbeddingService()


def get_embeddings(texts: List[str]) -> List[List[float]]:
    """Module-level shortcut: embed a list of texts via the shared EmbeddingService."""
    return embedding_service.embed_documents(texts)
