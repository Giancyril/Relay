/**
 * SourcesAccordion — collapsible section listing retrieved knowledge-base chunks.
 * Builds user trust by showing the grounding sources for RAG answers.
 */
export default function SourcesAccordion({ sources }) {
  if (!sources || sources.length === 0) return null;

  return (
    <details className="mt-3 group">
      <summary className="flex items-center gap-1.5 text-xs text-surface-500 hover:text-brand-400 cursor-pointer select-none transition-colors list-none">
        {/* Chevron */}
        <svg
          className="w-3.5 h-3.5 transition-transform group-open:rotate-90"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        {sources.length} source{sources.length > 1 ? "s" : ""} used
      </summary>

      <div className="mt-2 space-y-2 pl-5">
        {sources.map((src, idx) => (
          <div
            key={idx}
            className="rounded-lg bg-surface-800 border border-surface-600 px-3 py-2"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-brand-400 font-mono">
                {src.doc_id}
              </span>
              <span className="text-xs text-surface-500">
                dist: {src.distance.toFixed(3)}
              </span>
            </div>
            <p className="text-xs text-surface-400 leading-relaxed line-clamp-3">
              {src.snippet}
            </p>
          </div>
        ))}
      </div>
    </details>
  );
}
