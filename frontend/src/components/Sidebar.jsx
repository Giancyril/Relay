import { useState, useEffect } from "react";

/**
 * Sidebar — collapsible navigation sidebar inspired by sofy-therapist-main.
 */
export default function Sidebar({
  activeTab,
  onSelectTab,
  sessionId,
  onNewChat,
}) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("relay_sidebar_collapsed") === "true";
  });

  useEffect(() => {
    localStorage.setItem("relay_sidebar_collapsed", isCollapsed);
  }, [isCollapsed]);

  const navItems = [
    {
      id: "chat",
      label: "Customer Chat",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a.75.75 0 01-1.007-.875l.448-2.686A8.25 8.25 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      ),
      badge: null,
    },
    {
      id: "analytics",
      label: "Telemetry & Analytics",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
      badge: "Live",
    },
    {
      id: "kb",
      label: "Knowledge Base",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      ),
      badge: null,
    },
    {
      id: "feedback",
      label: "CSAT & Feedback",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
        </svg>
      ),
      badge: null,
    },
  ];

  return (
    <aside
      className={`h-full bg-surface-800 border-r border-surface-700 flex flex-col justify-between transition-all duration-300 z-20 flex-shrink-0 relative ${isCollapsed ? "w-16" : "w-64"
        }`}
    >
      {/* ── Brand Header ───────────────────────────────────── */}
      <div>
        <div className={`h-16 px-3 flex items-center border-b border-surface-700/60 ${isCollapsed ? "justify-center" : "justify-between"}`}>
          {/* Logo + title — hidden entirely when collapsed */}
          <div
            className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${
              isCollapsed ? "max-w-0 opacity-0 pointer-events-none" : "max-w-full opacity-100"
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">R</span>
            </div>
            <div className="truncate">
              <h1 className="text-sm font-bold text-slate-100 truncate whitespace-nowrap">Relay AI</h1>
              <p className="text-[11px] text-surface-500 truncate whitespace-nowrap">Customer Support</p>
            </div>
          </div>

          {/* Collapse toggle button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-7 h-7 rounded-lg border border-surface-600 bg-surface-700 hover:bg-surface-600 text-surface-400 hover:text-slate-200 flex items-center justify-center transition-colors flex-shrink-0 outline-none focus:outline-none select-none"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? "›" : "‹"}
          </button>
        </div>

        {/* ── Action: + New Chat ────────────────────────────── */}
        <div className="p-3 border-b border-surface-700/60">
          <button
            onClick={() => {
              onNewChat();
              onSelectTab("chat");
            }}
            className={`w-full bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-xl transition-all shadow-md shadow-brand-950/40 flex items-center justify-center gap-2 outline-none focus:outline-none select-none ${isCollapsed ? "h-10 px-0" : "h-10 px-4 text-xs"
              }`}
            title="Start new conversation"
          >
            <span className="text-base font-bold">+</span>
            {!isCollapsed && <span>New Chat</span>}
          </button>
        </div>

        {/* ── Main Navigation Items ─────────────────────────── */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all outline-none focus:outline-none select-none ${isActive
                  ? "bg-surface-700/60 text-slate-100 font-semibold"
                  : "text-surface-400 hover:bg-surface-700/30 hover:text-slate-200"
                  }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3 truncate">
                  <div
                    className={`${isActive ? "text-brand-400" : "text-surface-400"
                      }`}
                  >
                    {item.icon}
                  </div>
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && item.badge && (
                  <span className="text-[10px] font-semibold bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Footer & Session Telemetry ──────────────────────── */}
      <div className="border-t border-surface-700/60 p-3 space-y-3">
        {/* Active session pill */}
        {!isCollapsed && (
          <div className="bg-surface-900 border border-surface-700 rounded-xl p-2.5 text-[11px] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-surface-500 font-semibold uppercase tracking-wider text-[9px]">ChromaDB Index</span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </span>
            </div>
            <p className="font-mono text-surface-400 truncate">
              {sessionId ? sessionId.slice(0, 18) + "…" : "No session"}
            </p>
          </div>
        )}

        {/* User admin profile */}
        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-full bg-surface-700 border border-surface-600 flex items-center justify-center text-xs font-bold text-slate-200 flex-shrink-0">
            A
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-200 truncate">Relay Admin</p>
              <p className="text-[10px] text-surface-500 truncate">Pro Account</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
