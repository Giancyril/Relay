import os
import chromadb
from chromadb.config import Settings as ChromaSettings
from app.config import settings


class ChromaDBClient:
    """Singleton wrapper for persistent ChromaDB client management."""

    _instance = None
    _client = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ChromaDBClient, cls).__new__(cls)
            persist_dir = os.path.abspath(settings.chromadb_persist_dir)
            os.makedirs(persist_dir, exist_ok=True)

            cls._client = chromadb.PersistentClient(
                path=persist_dir,
                settings=ChromaSettings(anonymized_telemetry=False)
            )
        return cls._instance

    @property
    def client(self) -> chromadb.PersistentClient:
        return self._client

    def get_or_create_collection(self, name: str = None):
        col_name = name or settings.chromadb_collection_name
        return self._client.get_or_create_collection(
            name=col_name,
            metadata={"hnsw:space": "cosine"}
        )

    def delete_collection(self, name: str = None):
        col_name = name or settings.chromadb_collection_name
        try:
            self._client.delete_collection(name=col_name)
        except Exception:
            pass


get_chroma_client = ChromaDBClient


def get_collection():
    """Convenience helper — returns the default ChromaDB collection."""
    return ChromaDBClient().get_or_create_collection()
