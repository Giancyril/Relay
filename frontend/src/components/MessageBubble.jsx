import { useState, useEffect } from "react";
import EscalationBadge from "./EscalationBadge";
import ConfidenceBar from "./ConfidenceBar";
import SourcesAccordion from "./SourcesAccordion";
import FeedbackButtons from "./FeedbackButtons";
import { useToastContext } from "../context/ToastContext";

/**
 * MessageBubble — renders a single message in the chat thread.
 */
export default function MessageBubble({ message, sessionId, onSelectPrompt }) {
  const { role, text, escalated, confidence_score, sources, timestamp, originalQuestion, sentiment, urgency, responseTimeMs } = message;
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToastContext();

  // Helper to derive smart follow-up suggestions based on response content
  const followUps = (() => {
    if (role !== "agent" || !text) return [];
    const lower = text.toLowerCase();
    if (lower.includes("return") || lower.includes("refund")) {
      return ["How long does a refund take?", "What if item is damaged?"];
    }
    if (lower.includes("payment") || lower.includes("card") || lower.includes("invoice")) {
      return ["Do you accept PayPal?", "Where can I download invoices?"];
    }
    if (lower.includes("password") || lower.includes("security") || lower.includes("login")) {
      return ["How to enable 2FA?", "What if I lost my email?"];
    }
    if (lower.includes("shipping") || lower.includes("delivery") || lower.includes("tracking")) {
      return ["Do you ship internationally?", "How to track my order?"];
    }
    return ["Can I speak to a human representative?", "What are your support hours?"];
  })();

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast("Copied answer to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const time = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function toggleSpeech() {
    if (!window.speechSynthesis) {
      alert("Text-to-Speech is not supported in this browser.");
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      window.speechSynthesis.cancel(); // stop any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  }

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

        {/* Sentiment & Urgency badges */}
        {(sentiment || urgency) && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {sentiment && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                  sentiment === "frustrated"
                    ? "bg-rose-950/50 border-rose-700/50 text-rose-300"
                    : sentiment === "urgent"
                    ? "bg-amber-950/50 border-amber-600/50 text-amber-300"
                    : sentiment === "inquiring"
                    ? "bg-sky-950/50 border-sky-700/50 text-sky-300"
                    : "bg-surface-700/60 border-surface-600 text-surface-400"
                }`}
              >
                {sentiment === "frustrated" && "😡"}
                {sentiment === "urgent" && "🚨"}
                {sentiment === "inquiring" && "💬"}
                {sentiment === "neutral" && "😐"}
                {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
              </span>
            )}
            {urgency && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                  urgency === "high"
                    ? "bg-rose-950/50 border-rose-700/50 text-rose-300"
                    : urgency === "medium"
                    ? "bg-amber-950/50 border-amber-600/50 text-amber-300"
                    : "bg-emerald-950/50 border-emerald-700/50 text-emerald-400"
                }`}
              >
                {urgency === "high" && "🔴"}
                {urgency === "medium" && "🟡"}
                {urgency === "low" && "🟢"}
                {urgency.charAt(0).toUpperCase() + urgency.slice(1)} Priority
              </span>
            )}
          </div>
        )}

        {/* Confidence bar */}
        {typeof confidence_score === "number" && (
          <ConfidenceBar score={confidence_score} />
        )}

        {/* Escalation badge */}
        {isEscalated && <EscalationBadge />}

        {/* Sources accordion */}
        <SourcesAccordion sources={sources} />

        {/* Smart Follow-Up Suggestions */}
        {followUps.length > 0 && typeof onSelectPrompt === "function" && (
          <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-surface-600/30">
            <span className="w-full text-[10px] text-surface-400 font-semibold uppercase tracking-wider mb-0.5">
              Suggested Follow-ups
            </span>
            {followUps.map((prompt) => (
              <button
                key={prompt}
                onClick={() => onSelectPrompt(prompt)}
                className="text-[11px] bg-surface-800 hover:bg-surface-600 border border-surface-600/80 hover:border-brand-500/60 text-brand-300 px-2.5 py-1 rounded-lg transition-all text-left flex items-center gap-1 group"
              >
                <span>💡 {prompt}</span>
                <span className="text-surface-500 group-hover:text-brand-400">→</span>
              </button>
            ))}
          </div>
        )}

        {/* Footer bar with Feedback buttons & Speech Playback */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-surface-600/50">
          <FeedbackButtons
            question={originalQuestion || text}
            answer={text}
            sessionId={sessionId}
          />

          <div className="flex items-center gap-3">
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1 text-xs transition-colors ${
                copied ? "text-emerald-400 font-medium" : "text-surface-400 hover:text-slate-200"
              }`}
              title="Copy answer text"
            >
              <span>{copied ? "✓" : "📋"}</span>
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>

            {/* Text-to-Speech Button */}
            <button
              onClick={toggleSpeech}
              className={`flex items-center gap-1 text-xs transition-colors ${
                isPlaying ? "text-brand-400 font-medium" : "text-surface-400 hover:text-slate-200"
              }`}
              title={isPlaying ? "Stop Reading" : "Read Answer Aloud"}
            >
              <span>{isPlaying ? "🔊" : "🔈"}</span>
              <span>{isPlaying ? "Speaking..." : "Read"}</span>
            </button>

            {typeof responseTimeMs === "number" && (
              <span className="text-[11px] font-mono text-surface-400 bg-surface-800/80 px-1.5 py-0.5 rounded border border-surface-600/40" title="End-to-end response generation latency">
                ⚡ {responseTimeMs}ms
              </span>
            )}

            <span className="text-xs text-surface-500">{time}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
