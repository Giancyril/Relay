import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

/**
 * ChatThread — the scrollable message list.
 * Auto-scrolls to the latest message whenever messages or loading changes.
 */
export default function ChatThread({ messages, isLoading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const isEmpty = messages.length === 0 && !isLoading;

  return (
    <div className="flex-1 overflow-y-auto chat-scroll py-4 space-y-1">
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
              <span
                key={q}
                className="px-3 py-1.5 text-xs rounded-full bg-surface-700 border border-surface-600 text-surface-400"
              >
                {q}
              </span>
            ))}
          </div>
        </div>
      )}

      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {isLoading && <TypingIndicator />}

      <div ref={bottomRef} />
    </div>
  );
}
