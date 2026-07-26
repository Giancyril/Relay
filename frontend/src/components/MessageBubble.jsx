import EscalationBadge from "./EscalationBadge";
import ConfidenceBar from "./ConfidenceBar";
import SourcesAccordion from "./SourcesAccordion";

/**
 * MessageBubble — renders a single message in the chat thread.
 *
 * Roles:
 *   "user"  → right-aligned, brand indigo background
 *   "agent" → left-aligned, dark surface card, with confidence/escalation/sources
 *   "error" → left-aligned, rose-tinted border, inline error UI
 */
export default function MessageBubble({ message }) {
  const { role, text, escalated, confidence_score, sources, timestamp } = message;

  const time = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  /* ── User message ─────────────────────────────────────────── */
  if (role === "user") {
    return (
      <div className="flex justify-end px-4 py-1">
        <div className="max-w-[75%]">
          <div className="bg-brand-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm leading-relaxed shadow-md">
            {text}
          </div>
          <p className="text-right text-xs text-surface-500 mt-1 pr-1">{time}</p>
        </div>
      </div>
    );
  }

  /* ── Error message ─────────────────────────────────────────── */
  if (role === "error") {
    return (
      <div className="flex items-start gap-3 px-4 py-1">
        <div className="w-8 h-8 rounded-full bg-rose-900/40 border border-rose-700/50 flex items-center justify-center flex-shrink-0 mt-1">
          <span className="text-rose-400 text-xs">!</span>
        </div>
        <div className="max-w-[75%] bg-rose-900/20 border border-rose-700/40 px-4 py-3 rounded-2xl rounded-tl-sm">
          <p className="text-sm text-rose-300 font-medium mb-0.5">Request failed</p>
          <p className="text-xs text-rose-400/80">{text}</p>
          <p className="text-xs text-surface-500 mt-2">{time}</p>
        </div>
      </div>
    );
  }

  /* ── Agent message ─────────────────────────────────────────── */
  const isEscalated = escalated === true;

  return (
    <div className="flex items-start gap-3 px-4 py-1">
      {/* Agent avatar */}
      <div className="w-8 h-8 rounded-full bg-surface-700 border border-brand-600/40 flex items-center justify-center flex-shrink-0 mt-1">
        <span className="text-brand-400 text-xs font-bold">R</span>
      </div>

      <div
        className={`max-w-[75%] px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed shadow-md ${
          isEscalated
            ? "bg-surface-700 border border-amber-700/50 border-l-2 border-l-amber-500"
            : "bg-surface-700 border border-surface-600"
        }`}
      >
        {/* Answer text */}
        <p className="text-slate-200 whitespace-pre-wrap">{text}</p>

        {/* Confidence bar */}
        {typeof confidence_score === "number" && (
          <ConfidenceBar score={confidence_score} />
        )}

        {/* Escalation badge */}
        {isEscalated && <EscalationBadge />}

        {/* Sources accordion */}
        <SourcesAccordion sources={sources} />

        <p className="text-xs text-surface-500 mt-2">{time}</p>
      </div>
    </div>
  );
}
