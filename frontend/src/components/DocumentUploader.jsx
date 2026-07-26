import { useState } from "react";
import { ingestDocuments } from "../api/kbApi";

/**
 * DocumentUploader — Modal/Form for adding single documents or uploading JSON FAQ files.
 */
export default function DocumentUploader({ isOpen, onClose, onSuccess }) {
  const [docId, setDocId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!docId.trim() || !title.trim() || !content.trim()) {
      setError("Please fill out all fields.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await ingestDocuments([
        {
          doc_id: docId.trim(),
          title: title.trim(),
          content: content.trim(),
        },
      ]);
      setDocId("");
      setTitle("");
      setContent("");
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to ingest document.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const docs = Array.isArray(parsed) ? parsed : [parsed];

        // Validate structure
        for (const d of docs) {
          if (!d.doc_id || !d.title || !d.content) {
            throw new Error("Invalid JSON format. Each item must have doc_id, title, and content.");
          }
        }

        setIsSubmitting(true);
        setError(null);
        await ingestDocuments(docs);
        onSuccess();
        onClose();
      } catch (err) {
        setError(err.message || "Failed to parse/upload JSON file.");
      } finally {
        setIsSubmitting(false);
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-surface-800 border border-surface-600 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        
        <div className="flex items-center justify-between border-b border-surface-700 pb-3">
          <h3 className="text-sm font-semibold text-slate-100">Add Knowledge Base Document</h3>
          <button onClick={onClose} className="text-surface-400 hover:text-slate-200 text-sm">
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-3 text-xs text-rose-300">
            ⚠️ {error}
          </div>
        )}

        {/* JSON File Upload Option */}
        <div className="bg-surface-900 border border-dashed border-surface-600 rounded-xl p-4 text-center space-y-2">
          <p className="text-xs text-surface-400 font-medium">
            Upload JSON Document Set (`.json`)
          </p>
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            disabled={isSubmitting}
            className="hidden"
            id="json-file-input"
          />
          <label
            htmlFor="json-file-input"
            className="inline-block bg-surface-700 hover:bg-surface-600 text-brand-400 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors"
          >
            Select JSON File
          </label>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-surface-700"></div>
          <span className="flex-shrink mx-3 text-[10px] uppercase tracking-wider text-surface-500 font-semibold">Or Add Single Document</span>
          <div className="flex-grow border-t border-surface-700"></div>
        </div>

        {/* Single Document Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-surface-400 font-semibold mb-1">Document ID (unique)</label>
            <input
              type="text"
              value={docId}
              onChange={(e) => setDocId(e.target.value)}
              placeholder="e.g. faq_shipping_01"
              className="w-full bg-surface-900 border border-surface-600 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-surface-400 font-semibold mb-1">Document Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Shipping Methods & Delivery Times"
              className="w-full bg-surface-900 border border-surface-600 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-surface-400 font-semibold mb-1">Document Content</label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste full document or FAQ content here..."
              className="w-full bg-surface-900 border border-surface-600 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-brand-500 resize-none leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-surface-700 hover:bg-surface-600 text-slate-300 px-4 py-1.5 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-1.5 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Ingesting..." : "Ingest Document"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
