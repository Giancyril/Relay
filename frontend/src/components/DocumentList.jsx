import { useState, useEffect, useCallback } from "react";
import { fetchDocuments, deleteDocument, ingestDocuments } from "../api/kbApi";
import DocumentUploader from "./DocumentUploader";

/**
 * DocumentList — Knowledge Base document table, default FAQ seed trigger, and uploader modal launcher.
 */
export default function DocumentList() {
  const [data, setData] = useState({ total_documents: 0, total_chunks: 0, documents: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadDocs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchDocuments();
      setData(res);
    } catch (err) {
      setError(err.message || "Failed to load knowledge base documents.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  async function handleDelete(docId) {
    if (!window.confirm(`Are you sure you want to delete document '${docId}' and all its vector chunks?`)) {
      return;
    }
    setDeletingId(docId);
    try {
      await deleteDocument(docId);
      await loadDocs();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSeedSampleFAQs() {
    setIsLoading(true);
    try {
      await ingestDocuments([], false);
      await loadDocs();
    } catch (err) {
      alert(`Sample FAQ ingestion failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-surface-800 border border-surface-700 rounded-2xl p-5 shadow-lg space-y-4">
      
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-200">Indexed Documents</h3>
          <p className="text-xs text-surface-400">
            {data.total_documents} documents ({data.total_chunks} total vector chunks in ChromaDB)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSeedSampleFAQs}
            disabled={isLoading}
            className="bg-surface-700 hover:bg-surface-600 border border-surface-600 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
          >
            Seed Sample FAQs
          </button>

          <button
            onClick={() => setIsUploaderOpen(true)}
            className="bg-brand-600 hover:bg-brand-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors shadow"
          >
            + Add Document
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-3 text-xs text-rose-300">
          ⚠️ {error}
        </div>
      )}

      {/* Document Table */}
      <div className="overflow-x-auto rounded-xl border border-surface-700">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-surface-900 text-surface-400 font-semibold border-b border-surface-700 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Document ID</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3 text-center">Chunks</th>
              <th className="px-4 py-3">Content Snippet Preview</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-700">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-surface-500">
                  Loading ChromaDB documents...
                </td>
              </tr>
            ) : data.documents.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-surface-500">
                  No documents found. Click &quot;Seed Sample FAQs&quot; or &quot;+ Add Document&quot; to populate your vector database.
                </td>
              </tr>
            ) : (
              data.documents.map((doc) => (
                <tr key={doc.doc_id} className="hover:bg-surface-700/50 transition-colors">
                  <td className="px-4 py-3 font-mono font-medium text-brand-400 whitespace-nowrap">
                    {doc.doc_id}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-200 whitespace-nowrap">
                    {doc.title}
                  </td>
                  <td className="px-4 py-3 text-center font-mono font-medium text-slate-300">
                    {doc.chunk_count}
                  </td>
                  <td className="px-4 py-3 max-w-sm truncate text-surface-400">
                    {doc.snippet}
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(doc.doc_id)}
                      disabled={deletingId === doc.doc_id}
                      className="text-rose-400 hover:text-rose-300 text-xs font-medium underline disabled:opacity-50"
                    >
                      {deletingId === doc.doc_id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <DocumentUploader
        isOpen={isUploaderOpen}
        onClose={() => setIsUploaderOpen(false)}
        onSuccess={loadDocs}
      />
    </div>
  );
}
