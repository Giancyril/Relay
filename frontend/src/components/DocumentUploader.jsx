import { useState, useRef, useCallback } from "react";
import { ingestDocuments } from "../api/kbApi";

/**
 * DocumentUploader — Modal for adding KB documents.
 * Features:
 *  - Drag-and-drop zone for .json and .txt files
 *  - File preview before ingestion (chunk count + size)
 *  - Manual single-document form
 */
export default function DocumentUploader({ isOpen, onClose, onSuccess }) {
  const [docId, setDocId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Drag-and-drop state
  const [isDragging, setIsDragging] = useState(false);
  const [droppedFile, setDroppedFile] = useState(null); // { name, size, preview, parsedDocs }
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  /* ── Helpers ──────────────────────────────────────────────── */

  function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  async function processFile(file) {
    setError(null);
    const text = await file.text();

    try {
      let parsedDocs;

      if (file.name.endsWith(".json")) {
        const parsed = JSON.parse(text);
        parsedDocs = Array.isArray(parsed) ? parsed : [parsed];
        for (const d of parsedDocs) {
          if (!d.doc_id || !d.title || !d.content) {
            throw new Error("Each JSON item must have doc_id, title, and content.");
          }
        }
      } else if (file.name.endsWith(".txt")) {
        // Auto-generate a doc from the .txt file
        parsedDocs = [
          {
            doc_id: `txt_${Date.now()}`,
            title: file.name.replace(/\.txt$/, ""),
            content: text,
          },
        ];
      } else {
        throw new Error("Unsupported file type. Please drop a .json or .txt file.");
      }

      const preview = parsedDocs
        .slice(0, 3)
        .map((d) => `"${d.title}"`)
        .join(", ");

      setDroppedFile({
        name: file.name,
        size: file.size,
        parsedDocs,
        preview: parsedDocs.length > 3 ? `${preview} …+${parsedDocs.length - 3} more` : preview,
      });
    } catch (err) {
      setError(err.message || "Failed to parse file.");
      setDroppedFile(null);
    }
  }

  /* ── Drag events ──────────────────────────────────────────── */

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  }, []); // eslint-disable-line

  const onFileInputChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
  }, []); // eslint-disable-line

  /* ── Ingest dropped file ──────────────────────────────────── */

  async function ingestDropped() {
    if (!droppedFile) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await ingestDocuments(droppedFile.parsedDocs);
      setDroppedFile(null);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to ingest file.");
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ── Single document form ─────────────────────────────────── */

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
        { doc_id: docId.trim(), title: title.trim(), content: content.trim() },
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

  /* ── Render ───────────────────────────────────────────────── */

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-surface-800 border border-surface-600 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-700 pb-3">
          <h3 className="text-sm font-semibold text-slate-100">Add Knowledge Base Document</h3>
          <button onClick={onClose} className="text-surface-400 hover:text-slate-200 text-sm">✕</button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-3 text-xs text-rose-300">
            ⚠️ {error}
          </div>
        )}

        {/* ── Drag & Drop Zone ──────────────────────────────── */}
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !droppedFile && fileInputRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer ${
            isDragging
              ? "border-brand-500 bg-brand-500/10 scale-[1.01]"
              : droppedFile
              ? "border-emerald-600/60 bg-emerald-950/20 cursor-default"
              : "border-surface-600 bg-surface-900/60 hover:border-brand-500/60 hover:bg-surface-900"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.txt"
            onChange={onFileInputChange}
            className="hidden"
          />

          {!droppedFile ? (
            /* Empty drop zone */
            <div className="flex flex-col items-center justify-center gap-2 p-6 text-center select-none">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDragging ? "bg-brand-500/20" : "bg-surface-700"}`}>
                <svg className={`w-5 h-5 transition-colors ${isDragging ? "text-brand-400" : "text-surface-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <p className={`text-xs font-medium transition-colors ${isDragging ? "text-brand-300" : "text-surface-400"}`}>
                {isDragging ? "Release to upload" : "Drag & drop a file here, or click to browse"}
              </p>
              <p className="text-[10px] text-surface-500">
                Supports <code className="font-mono text-surface-400">.json</code> (FAQ array) and <code className="font-mono text-surface-400">.txt</code> (raw document)
              </p>
            </div>
          ) : (
            /* File preview */
            <div className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-700/40 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-200 truncate">{droppedFile.name}</p>
                  <p className="text-[10px] text-surface-500">
                    {formatBytes(droppedFile.size)} · {droppedFile.parsedDocs.length} document{droppedFile.parsedDocs.length !== 1 ? "s" : ""}
                  </p>
                  <p className="text-[10px] text-surface-400 mt-0.5 italic truncate">{droppedFile.preview}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setDroppedFile(null); }}
                  className="text-surface-500 hover:text-rose-400 transition-colors flex-shrink-0"
                  title="Remove file"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <button
                onClick={ingestDropped}
                disabled={isSubmitting}
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Ingesting…" : `Ingest ${droppedFile.parsedDocs.length} Document${droppedFile.parsedDocs.length !== 1 ? "s" : ""}`}
              </button>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-surface-700" />
          <span className="flex-shrink mx-3 text-[10px] uppercase tracking-wider text-surface-500 font-semibold">
            Or Add Single Document
          </span>
          <div className="flex-grow border-t border-surface-700" />
        </div>

        {/* ── Single Document Form ──────────────────────────── */}
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
              placeholder="Paste full document or FAQ content here…"
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
              {isSubmitting ? "Ingesting…" : "Ingest Document"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
