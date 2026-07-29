import { useState, useEffect } from "react";

/**
 * TypingIndicator — multi-stage thinking animation with status messages.
 */
export default function TypingIndicator() {
  const [stepIndex, setStepIndex] = useState(0);

  const STEPS = [
    "Searching ChromaDB vector index...",
    "Retrieving Top-K relevant knowledge chunks...",
    "Synthesizing answer with Gemini Flash...",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % STEPS.length);
    }, 1200);
    return () => clearInterval(timer);
  }, []); // eslint-disable-line

  return (
    <div className="flex items-start gap-3 px-4 py-2">
      {/* Agent avatar with pulsing ring */}
      <div className="relative w-8 h-8 rounded-full bg-surface-700 border border-brand-500/60 flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
        <span className="text-brand-400 text-xs font-bold">R</span>
        <span className="absolute inset-0 rounded-full border border-brand-400 animate-ping opacity-30" />
      </div>

      <div className="bg-surface-700/80 border border-surface-600 rounded-2xl rounded-tl-sm px-4 py-3 shadow-md space-y-1.5">
        <div className="flex items-center gap-2">
          {/* Animated 3-dot pulse */}
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-brand-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }}
              />
            ))}
          </div>

          <span className="text-xs text-brand-300 font-medium font-mono animate-pulse">
            Thinking…
          </span>
        </div>

        {/* Dynamic stage message */}
        <p className="text-[11px] text-surface-400 italic transition-all duration-300">
          {STEPS[stepIndex]}
        </p>
      </div>
    </div>
  );
}
