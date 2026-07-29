import { useState } from "react";
import { useSession } from "./hooks/useSession";
import { useChat } from "./hooks/useChat";
import Sidebar from "./components/Sidebar";
import ChatThread from "./components/ChatThread";
import InputBar from "./components/InputBar";
import AdminDashboard from "./components/AdminDashboard";
import FeedbackDashboard from "./components/FeedbackDashboard";
import SessionStats from "./components/SessionStats";

export default function App() {
  const [activeTab, setActiveTab] = useState("chat"); // "chat" | "analytics" | "kb" | "feedback"
  const { sessionId, resetSession } = useSession();
  const { messages, isLoading, submit } = useChat(sessionId);

  const getSectionTitle = () => {
    switch (activeTab) {
      case "chat":
        return { title: "Customer Support Workspace", subtitle: "Live RAG customer assistant" };
      case "analytics":
        return { title: "Telemetry & Analytics", subtitle: "Real-time escalation metrics & model confidence" };
      case "kb":
        return { title: "Knowledge Base Manager", subtitle: "ChromaDB vector documents & chunk index" };
      case "feedback":
        return { title: "CSAT & Feedback Center", subtitle: "User ratings, helpfulness score, and comments" };
      default:
        return { title: "Relay Support AI", subtitle: "" };
    }
  };

  const currentInfo = getSectionTitle();

  return (
    <div className="h-screen flex bg-surface-900 overflow-hidden font-sans">
      
      {/* ── Sidebar Navigation ────────────────────────────────── */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        sessionId={sessionId}
        onNewChat={resetSession}
      />

      {/* ── Main View Area ────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 bg-surface-900 relative h-full">

        {/* Top Header Bar */}
        <header className="h-16 bg-surface-800/80 border-b border-surface-700/60 px-6 flex items-center justify-between flex-shrink-0 backdrop-blur-md z-10">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>{currentInfo.title}</span>
            </h2>
            <p className="text-[11px] text-surface-500">{currentInfo.subtitle}</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Session Telemetry Stats */}
            {activeTab === "chat" && <SessionStats messages={messages} />}

            {/* Session ID Pill */}
            <div className="hidden sm:flex items-center gap-2 bg-surface-900 border border-surface-700 px-3 py-1 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-surface-400 font-mono">
                {sessionId.slice(0, 14)}…
              </span>
            </div>

            {/* Quick action: New Chat */}
            {activeTab === "chat" && (
              <button
                onClick={resetSession}
                className="text-xs font-medium text-surface-400 hover:text-slate-200 border border-surface-600 hover:border-surface-500 px-3 py-1.5 rounded-xl transition-colors"
              >
                Reset session
              </button>
            )}
          </div>
        </header>

        {/* Content Body Router */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTab === "chat" && (
            <>
              <ChatThread messages={messages} isLoading={isLoading} sessionId={sessionId} onSelectPrompt={submit} />
              <InputBar onSubmit={submit} isLoading={isLoading} />
            </>
          )}

          {activeTab === "analytics" && (
            <AdminDashboard initialTab="analytics" />
          )}

          {activeTab === "kb" && (
            <AdminDashboard initialTab="kb" />
          )}

          {activeTab === "feedback" && (
            <FeedbackDashboard />
          )}
        </div>

      </main>

    </div>
  );
}
