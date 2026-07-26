import { useState, useRef } from "react";

/**
 * InputBar — pinned bottom input + send button.
 * Handles Enter key (submit) and Shift+Enter (newline).
 */
export default function InputBar({ onSubmit, isLoading }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
    setValue("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleInput(e) {
    setValue(e.target.value);
    // Auto-grow
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  return (
    <div className="border-t border-surface-700 bg-surface-800 px-4 py-3">
      <div className="flex items-end gap-3 bg-surface-700 border border-surface-600 rounded-2xl px-4 py-2.5 focus-within:border-brand-600 transition-colors">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder="Ask a question…"
          className="flex-1 bg-transparent text-sm text-slate-200 placeholder-surface-500 resize-none outline-none leading-relaxed disabled:opacity-50 max-h-40"
          style={{ height: "auto" }}
        />
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || isLoading}
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all
            bg-brand-600 text-white hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed
            active:scale-95"
          aria-label="Send message"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>
      <p className="text-center text-xs text-surface-600 mt-2">
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
