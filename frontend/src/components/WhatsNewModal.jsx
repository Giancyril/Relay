import { useEffect } from "react";

/**
 * WhatsNewModal — showcases platform version release notes & feature changelog.
 */
export default function WhatsNewModal({ isOpen, onClose }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const RELEASES = [
    {
      version: "v2.5.0",
      date: "Latest Release",
      features: [
        "🎵 Web Audio API Synthesized Sound Effects Engine (send, receive, error, pop)",
        "😊 Emoji Reactions on AI Message Bubbles (👍, ❤️, 🔥, 😄, 🤔)",
        "📌 Pinned Messages system with amber glow ring highlighting",
        "🎯 Animated SVG Confidence Ring indicator with score gradients",
        "🕒 Interactive Relative Timestamp toggle (Just now / 2m ago ↔ 10:32 PM)",
        "⌨️ Character counter with 1,000 char max limit indicator",
        "✓ Escalation Quick-Resolve toggle action in audit table",
        "📊 Backend GET /system/metrics endpoint for vector DB & runtime telemetry",
      ],
    },
    {
      version: "v2.4.0",
      date: "Previous Build",
      features: [
        "🍞 Global Toast Notification system with 4 alert variants",
        "📋 1-Click Copy-to-Clipboard with visual state feedback",
        "⚡ Response execution latency tracking badge (ms)",
        "📥 Chat Transcript Export suite (.TXT & .JSON)",
        "⌨️ Global Hotkeys cheat sheet modal (?)",
        "⬇ Auto-scroll lock & floating Scroll-to-Latest pill",
        "👁 Knowledge Base Inline Document Content Preview modal",
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[999]">
      <div className="bg-surface-800 border border-surface-600 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-700 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">What&apos;s New in Relay Support AI</h3>
              <p className="text-[11px] text-surface-400">Release Notes & Platform Changelog</p>
            </div>
          </div>
          <button onClick={onClose} className="text-surface-400 hover:text-slate-200 text-sm">
            ✕
          </button>
        </div>

        {/* Release Cards */}
        <div className="space-y-4">
          {RELEASES.map((rel) => (
            <div key={rel.version} className="bg-surface-900/70 border border-surface-700/70 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-brand-300 bg-brand-950/60 border border-brand-700/50 px-2 py-0.5 rounded-md">
                  {rel.version}
                </span>
                <span className="text-[11px] font-medium text-surface-400">{rel.date}</span>
              </div>

              <ul className="space-y-1.5 pt-1">
                {rel.features.map((feat, idx) => (
                  <li key={idx} className="text-xs text-surface-300 flex items-start gap-2">
                    <span className="text-brand-400 flex-shrink-0">•</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white py-2 rounded-xl text-xs font-medium transition-colors shadow"
          >
            Explore New Features
          </button>
        </div>
      </div>
    </div>
  );
}
