import { useEffect } from "react";

/**
 * WhatsNewModal — platform version release notes & feature changelog.
 * Clean, professional design — no emoji icons.
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
        "Web Audio API synthesized sound effects engine with mute toggle",
        "Emoji reactions on AI message bubbles",
        "Pinned Messages system with amber highlight ring",
        "Animated SVG Confidence Ring with color-coded scoring zones",
        "Interactive relative timestamp toggle (e.g. 2m ago / 10:32 PM)",
        "Real-time character counter with 1,000 character limit",
        "Escalation quick-resolve toggle action in audit table",
        "Backend GET /system/metrics endpoint for runtime telemetry",
        "What's New release notes modal",
        "Scroll reading progress bar in chat thread",
        "Live System Metrics Panel with animated number counters",
      ],
    },
    {
      version: "v2.4.0",
      date: "Previous Release",
      features: [
        "Global toast notification system with 4 severity types",
        "1-click copy to clipboard with confirmation state",
        "End-to-end response latency tracking badge",
        "Live session telemetry stats bar",
        "Contextual follow-up prompt chips",
        "Chat transcript export in TXT and JSON formats",
        "Keyboard shortcuts cheat sheet modal",
        "Auto-scroll lock with scroll-to-latest floating pill",
        "Inline Knowledge Base document preview modal",
        "AI sentiment and urgency classifier badges",
        "Live chat message search with keyword highlighting",
        "Drag-and-drop Knowledge Base document uploader",
        "Multi-stage typing indicator with animated stages",
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[999]">
      <div className="bg-surface-800 border border-surface-600/80 rounded-2xl max-w-lg w-full shadow-2xl max-h-[85vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-700">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 tracking-tight">
              What&apos;s New in Relay Support AI
            </h3>
            <p className="text-[11px] text-surface-400 mt-0.5">Release Notes &amp; Platform Changelog</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-surface-600 text-surface-400 hover:text-slate-200 hover:border-surface-500 transition-colors"
            title="Close"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Release cards — scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {RELEASES.map((rel) => (
            <div key={rel.version} className="space-y-2">
              {/* Version badge row */}
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] font-semibold text-slate-200 bg-surface-700 border border-surface-600 px-2.5 py-0.5 rounded-md tracking-wide">
                  {rel.version}
                </span>
                <span className="text-[11px] text-surface-500">{rel.date}</span>
                <div className="flex-1 h-px bg-surface-700" />
              </div>

              {/* Feature list */}
              <ul className="space-y-1.5 pl-1">
                {rel.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-surface-300 leading-relaxed">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-surface-500 flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-surface-700">
          <button
            onClick={onClose}
            className="w-full bg-surface-700 hover:bg-surface-600 border border-surface-600 hover:border-surface-500 text-slate-200 py-2 rounded-xl text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
