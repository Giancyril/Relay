/**
 * kbApi.js — API wrapper for Knowledge Base document management endpoints
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Fetch all unique documents indexed in ChromaDB.
 */
export async function fetchDocuments() {
  const response = await fetch(`${BASE_URL}/documents`);
  if (!response.ok) {
    throw new Error(`Failed to fetch documents (${response.status})`);
  }
  return response.json();
}

/**
 * Delete a document by doc_id from ChromaDB.
 */
export async function deleteDocument(docId) {
  const response = await fetch(`${BASE_URL}/documents/${encodeURIComponent(docId)}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    let detail = `Delete failed (${response.status})`;
    try {
      const err = await response.json();
      detail = err.detail || detail;
    } catch (_) {}
    throw new Error(detail);
  }
  return response.json();
}

/**
 * Ingest custom documents or sample FAQs into ChromaDB.
 */
export async function ingestDocuments(documents = [], resetCollection = false) {
  const response = await fetch(`${BASE_URL}/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ documents, reset_collection: resetCollection }),
  });
  if (!response.ok) {
    let detail = `Ingestion failed (${response.status})`;
    try {
      const err = await response.json();
      detail = err.detail || detail;
    } catch (_) {}
    throw new Error(detail);
  }
  return response.json();
}
