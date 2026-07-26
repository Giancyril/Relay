import { useState } from "react";
import { useSession } from "./hooks/useSession";
import { useChat } from "./hooks/useChat";
import ChatThread from "./components/ChatThread";
import InputBar from "./components/InputBar";
import AdminDashboard from "./components/AdminDashboard";

export default function App() {
  const [activeTab, setActiveTab] = useState("chat"); // "chat" | "admin"
  const { sessionId, resetSession } = useSession();
  const { messages, isLoading, submit } = useChat(sessionId);

  return (
    <div className="h-screen flex flex-col bg-surface-900 overflow-hidden">

      {/* ── Header Bar ────────────────────────────────────── */}
      <header className="bg-surface-800 border-b border-surface-700 px-5 py-3 flex items-center justify-between flex-shrink-0 z-10">
        
        {/* Left: Brand logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-900/50">
            <span className="text-white text-sm font-bold">R</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-100">Relay Support AI</h1>
            <p className="text-xs text-surface-500">AI-Powered Customer Support</p>
          </div>
        </div>

        {/* Center: Navigation Tab Switcher */}
        <div className="flex items-center bg-surface-900 border border-surface-700 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "chat"
                ? "bg-brand-600 text-white shadow"
                : "text-surface-400 hover:text-slate-200"
            }`}
          >
            <span>💬</span>
            <span>Customer Chat</span>
          </button>

          <button
            onClick={() => setActiveTab("admin")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "admin"
                ? "bg-brand-600 text-white shadow"
                : "text-surface-400 hover:text-slate-200"
            }`}
          >
            <span>📊</span>
            <span>Admin Dashboard</span>
          </button>
        </div>

        {/* Right: Session Info & New Chat Button */}
        <div className="flex items-center gap-3">
          {activeTab === "chat" && (
            <>
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-surface-500 font-mono">
                  {sessionId.slice(0, 16)}…
                </span>
              </div>

              <button
                onClick={resetSession}
                className="text-xs text-surface-400 hover:text-slate-200 border border-surface-600 hover:border-surface-500 px-3 py-1.5 rounded-lg transition-colors"
              >
                New chat
              </button>
            </>
          )}
        </div>
      </header>

      {/* ── Content View ──────────────────────────────────── */}
      {activeTab === "chat" ? (
        <>
          <ChatThread messages={messages} isLoading={isLoading} sessionId={sessionId} />
          <InputBar onSubmit={submit} isLoading={isLoading} />
        </>
      ) : (
        <AdminDashboard />
      )}

    </div>
  );
}
