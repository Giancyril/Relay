import os
import json
from typing import List, Dict, Any, Tuple
from app.api.schemas import DocumentInput
from app.core.chromadb_client import ChromaDBClient
from app.core.embeddings import embedding_service
from app.utils.text_splitter import recursive_character_text_splitter


class IngestionService:
    """Service for splitting, embedding, and indexing product documentation into ChromaDB."""

    def __init__(self):
        self.chroma_client = ChromaDBClient()

    def ingest_documents(
        self,
        documents: List[DocumentInput] = None,
        reset_collection: bool = False
    ) -> Tuple[int, int]:
        """
        Ingests a list of documents into ChromaDB.
        If documents is None or empty, loads default data/sample_faqs.json.

        Returns (chunks_ingested, total_documents).
        """
        if reset_collection:
            self.chroma_client.delete_collection()

        collection = self.chroma_client.get_or_create_collection()

        if not documents:
            documents = self._load_default_sample_faqs()

        if not documents:
            return 0, 0

        all_ids = []
        all_embeddings = []
        all_metadatas = []
        all_documents = []

        for doc in documents:
            chunks = recursive_character_text_splitter(
                text=doc.content,
                chunk_size=400,
                chunk_overlap=50
            )

            for idx, chunk in enumerate(chunks):
                chunk_id = f"{doc.doc_id}_chunk_{idx}"
                embedding = embedding_service.embed_text(chunk)

                metadata = {
                    "doc_id": doc.doc_id,
                    "source": doc.doc_id,   # alias used by rag_service for attribution
                    "title": doc.title,
                    "chunk_index": idx,
                    "total_chunks": len(chunks)
                }

                all_ids.append(chunk_id)
                all_embeddings.append(embedding)
                all_metadatas.append(metadata)
                all_documents.append(chunk)

        if all_ids:
            collection.upsert(
                ids=all_ids,
                embeddings=all_embeddings,
                metadatas=all_metadatas,
                documents=all_documents
            )

        return len(all_ids), len(documents)

    def _load_default_sample_faqs(self) -> List[DocumentInput]:
        """Loads sample FAQs from data/sample_faqs.json."""
        filepath = os.path.join(os.getcwd(), "data", "sample_faqs.json")
        if not os.path.exists(filepath):
            return []

        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
                return [DocumentInput(**item) for item in data]
        except Exception as e:
            print(f"[Error] Failed to load sample_faqs.json: {e}")
            return []


ingestion_service = IngestionService()
