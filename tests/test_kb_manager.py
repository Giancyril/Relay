"""
Unit tests for app/api/router.py Knowledge Base management endpoints.

Tests cover:
  - GET /documents with empty ChromaDB collection
  - GET /documents with indexed documents
  - DELETE /documents/{doc_id} existing document
  - DELETE /documents/{doc_id} non-existent document (404)
"""

from unittest.mock import patch, MagicMock
import pytest
from fastapi.testclient import TestClient


class TestKBManagerEndpoints:

    def test_list_documents_empty(self, client: TestClient):
        with patch("app.api.router.ChromaDBClient") as mock_client_cls:
            mock_col = MagicMock()
            mock_col.count.return_value = 0
            mock_client_cls.return_value.get_or_create_collection.return_value = mock_col

            response = client.get("/documents")
            assert response.status_code == 200
            data = response.json()
            assert data["total_documents"] == 0
            assert data["total_chunks"] == 0
            assert data["documents"] == []

    def test_list_documents_with_data(self, client: TestClient):
        with patch("app.api.router.ChromaDBClient") as mock_client_cls:
            mock_col = MagicMock()
            mock_col.count.return_value = 2
            mock_col.get.return_value = {
                "metadatas": [
                    {"doc_id": "faq_returns_01", "title": "Return Policy", "source": "faq_returns_01"},
                    {"doc_id": "faq_returns_01", "title": "Return Policy", "source": "faq_returns_01"},
                ],
                "documents": [
                    "Return policy content snippet part 1...",
                    "Return policy content snippet part 2...",
                ]
            }
            mock_client_cls.return_value.get_or_create_collection.return_value = mock_col

            response = client.get("/documents")
            assert response.status_code == 200
            data = response.json()
            assert data["total_documents"] == 1
            assert data["total_chunks"] == 2
            assert data["documents"][0]["doc_id"] == "faq_returns_01"
            assert data["documents"][0]["chunk_count"] == 2

    def test_delete_document_success(self, client: TestClient):
        with patch("app.api.router.ChromaDBClient") as mock_client_cls:
            mock_col = MagicMock()
            mock_col.get.return_value = {"ids": ["faq_returns_01_chunk_0", "faq_returns_01_chunk_1"]}
            mock_client_cls.return_value.get_or_create_collection.return_value = mock_col

            response = client.delete("/documents/faq_returns_01")
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "success"
            assert data["deleted_chunks"] == 2
            mock_col.delete.assert_called_once_with(ids=["faq_returns_01_chunk_0", "faq_returns_01_chunk_1"])

    def test_delete_document_not_found_404(self, client: TestClient):
        with patch("app.api.router.ChromaDBClient") as mock_client_cls:
            mock_col = MagicMock()
            mock_col.get.return_value = {"ids": []}
            mock_client_cls.return_value.get_or_create_collection.return_value = mock_col

            response = client.delete("/documents/non_existent_doc")
            assert response.status_code == 404
            data = response.json()
            assert "not found" in data["detail"]
