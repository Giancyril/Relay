import { useState, useEffect } from "react";
import EscalationBadge from "./EscalationBadge";
import ConfidenceBar from "./ConfidenceBar";
import SourcesAccordion from "./SourcesAccordion";
import FeedbackButtons from "./FeedbackButtons";

/**
 * MessageBubble — renders a single message in the chat thread.
 */
export default function MessageBubble({ message, sessionId }) {
  const { role, text, escalated, confidence_score, sources, timestamp, originalQuestion } = message;
  const [isPlaying, setIsPlaying] = useState(false);

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

        {/* Confidence bar */}
        {typeof confidence_score === "number" && (
          <ConfidenceBar score={confidence_score} />
        )}

        {/* Escalation badge */}
        {isEscalated && <EscalationBadge />}

        {/* Sources accordion */}
        <SourcesAccordion sources={sources} />

        {/* Footer bar with Feedback buttons & Speech Playback */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-surface-600/50">
          <FeedbackButtons
            question={originalQuestion || text}
            answer={text}
            sessionId={sessionId}
          />

          <div className="flex items-center gap-3">
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

            <span className="text-xs text-surface-500">{time}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
