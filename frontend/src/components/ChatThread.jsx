import { useEffect, useRef, useState, useMemo } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { useChatExport } from "../hooks/useChatExport";

/**
 * ChatThread — scrollable message list with an optional pinned search bar.
 * Auto-scrolls to the latest message whenever messages or loading changes.
 */
export default function ChatThread({ messages, isLoading, sessionId, onSelectPrompt }) {
  const bottomRef = useRef(null);
  const searchRef = useRef(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { exportAsTxt, exportAsJson } = useChatExport(messages, sessionId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus search input whenever the bar opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchRef.current?.focus(), 50);
    } else {
      setSearchQuery("");
    }
  }, [searchOpen]);

  // Keyboard shortcut: Ctrl+F / Cmd+F → toggle search
  useEffect(() => {
    function onKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === "Escape") setSearchOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  // Derive which message IDs match the query
  const matchIds = useMemo(() => {
    if (!normalizedQuery) return new Set();
    return new Set(
      messages
        .filter((m) => m.text?.toLowerCase().includes(normalizedQuery))
        .map((m) => m.id)
    );
  }, [messages, normalizedQuery]);

  const matchCount = matchIds.size;

  const isEmpty = messages.length === 0 && !isLoading;

  return (
    <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">

      {/* ── Pinned Search Bar ───────────────────────────────────── */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out border-b border-surface-700/60 bg-surface-900/80 backdrop-blur-sm ${
          searchOpen ? "max-h-14 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-2 px-4 py-2">
          {/* Search icon */}
          <svg className="w-3.5 h-3.5 text-surface-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>

          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages…"
            className="flex-1 bg-transparent text-xs text-slate-200 placeholder-surface-500 outline-none"
          />

          {/* Match counter */}
          {normalizedQuery && (
            <span className="text-[10px] font-semibold text-surface-500 whitespace-nowrap">
              {matchCount > 0 ? `${matchCount} result${matchCount !== 1 ? "s" : ""}` : "No results"}
            </span>
          )}

          {/* Export buttons */}
          {messages.length > 0 && (
            <div className="flex items-center gap-1.5 ml-2 border-l border-surface-700/80 pl-2">
              <button
                onClick={exportAsTxt}
                className="text-[10px] bg-surface-800 hover:bg-surface-700 text-surface-300 px-2 py-0.5 rounded border border-surface-600 font-mono transition-colors"
                title="Export transcript as plain text"
              >
                📥 TXT
              </button>
              <button
                onClick={exportAsJson}
                className="text-[10px] bg-surface-800 hover:bg-surface-700 text-surface-300 px-2 py-0.5 rounded border border-surface-600 font-mono transition-colors"
                title="Export transcript as structured JSON"
              >
                📥 JSON
              </button>
            </div>
          )}

          {/* Clear / close */}
          <button
            onClick={() => setSearchOpen(false)}
            className="text-surface-500 hover:text-slate-200 transition-colors ml-1"
            title="Close search (Esc)"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Message List ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto chat-scroll py-4 space-y-1 relative">
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full text-center px-8 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-surface-700 border border-surface-600 flex items-center justify-center">
              <span className="text-brand-400 text-2xl font-bold">R</span>
            </div>
            <div>
              <p className="text-slate-300 font-semibold text-lg">Relay Support AI</p>
              <p className="text-surface-500 text-sm mt-1">
                Ask a question about our products or services.
              </p>
            </div>

            {/* Suggested prompts */}
            <div className="mt-2 flex flex-wrap justify-center gap-2 max-w-lg">
              {[
                "What is your return policy?",
                "How do I reset my password?",
                "What payment methods do you accept?",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => onSelectPrompt && onSelectPrompt(q)}
                  className="px-3 py-1.5 text-xs rounded-full bg-surface-700 hover:bg-surface-600 border border-surface-600 text-surface-300 hover:text-brand-300 transition-colors cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`transition-all duration-200 ${
              normalizedQuery && matchIds.has(msg.id)
                ? "ring-1 ring-brand-500/40 rounded-2xl bg-brand-500/5"
                : normalizedQuery && !matchIds.has(msg.id) && msg.text
                ? "opacity-30"
                : ""
            }`}
          >
            <MessageBubble message={msg} sessionId={sessionId} onSelectPrompt={onSelectPrompt} />
          </div>
        ))}

        {isLoading && <TypingIndicator />}

        <div ref={bottomRef} />
      </div>

      {/* ── Search Toggle Button (bottom-right corner hint) ─────── */}
      {!searchOpen && messages.length > 0 && (
        <button
          onClick={() => setSearchOpen(true)}
          title="Search messages (Ctrl+F)"
          className="absolute bottom-20 right-5 z-10 w-8 h-8 rounded-full bg-surface-700 border border-surface-600 flex items-center justify-center text-surface-400 hover:text-brand-400 hover:border-brand-500/60 transition-all shadow-lg"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </button>
      )}
    </div>
  );
}
