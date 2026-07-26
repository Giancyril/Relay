import { useSession } from "./hooks/useSession";
import { useChat } from "./hooks/useChat";
import ChatThread from "./components/ChatThread";
import InputBar from "./components/InputBar";

export default function App() {
  const { sessionId, resetSession } = useSession();
  const { messages, isLoading, submit } = useChat(sessionId);

  return (
    <div className="h-screen flex flex-col bg-surface-900">

      {/* ── Header ────────────────────────────────────────── */}
      <header className="bg-surface-800 border-b border-surface-700 px-5 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-900/50">
            <span className="text-white text-sm font-bold">R</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-100">Relay Support AI</h1>
            <p className="text-xs text-surface-500">AI-Powered Customer Support</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Session indicator */}
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-surface-500 font-mono">
              {sessionId.slice(0, 16)}…
            </span>
          </div>

          {/* New conversation button */}
          <button
            onClick={resetSession}
            className="text-xs text-surface-500 hover:text-slate-300 border border-surface-600 hover:border-surface-500 px-3 py-1.5 rounded-lg transition-colors"
          >
            New chat
          </button>
        </div>
      </header>

      {/* ── Chat thread ───────────────────────────────────── */}
      <ChatThread messages={messages} isLoading={isLoading} />

      {/* ── Input bar ─────────────────────────────────────── */}
      <InputBar onSubmit={submit} isLoading={isLoading} />

    </div>
  );
}
