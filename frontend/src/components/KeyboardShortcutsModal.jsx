import { useEffect } from "react";

/**
 * KeyboardShortcutsModal — cheat sheet modal listing all global hotkeys.
 */
export default function KeyboardShortcutsModal({ isOpen, onClose }) {
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

  const SHORTCUTS = [
    { key: "Ctrl + F", label: "Toggle Live Chat Message Search Bar" },
    { key: "Esc", label: "Close search bar or active modal window" },
    { key: "Enter", label: "Send current chat message" },
    { key: "Shift + Enter", label: "Insert new line in message input" },
    { key: "?", label: "Toggle Keyboard Shortcuts Cheat Sheet" },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[999]">
      <div className="bg-surface-800 border border-surface-600 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-700 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-100">Keyboard Shortcuts</h3>
          </div>
          <button onClick={onClose} className="text-surface-400 hover:text-slate-200 text-sm">
            ✕
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="space-y-2 text-xs">
          {SHORTCUTS.map((s) => (
            <div
              key={s.key}
              className="flex items-center justify-between p-2.5 rounded-xl bg-surface-900/60 border border-surface-700/60"
            >
              <span className="text-surface-300 font-medium">{s.label}</span>
              <kbd className="bg-surface-700 text-brand-300 font-mono text-[11px] px-2 py-0.5 rounded border border-surface-600 shadow-sm">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="w-full bg-surface-700 hover:bg-surface-600 text-slate-200 py-2 rounded-xl text-xs font-medium transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
