/**
 * useSession.js — generates and persists a session_id in localStorage
 * so multi-turn conversations stay coherent within the same browser session.
 */

import { useState } from "react";
import { clearHistory } from "../api/chatApi";

function generateSessionId() {
  return "sess-" + Math.random().toString(36).slice(2, 11) + "-" + Date.now();
}

export function useSession() {
  const [sessionId] = useState(() => {
    const existing = localStorage.getItem("relay_session_id");
    if (existing) return existing;
    const newId = generateSessionId();
    localStorage.setItem("relay_session_id", newId);
    return newId;
  });

  async function resetSession() {
    await clearHistory(sessionId);
    const newId = generateSessionId();
    localStorage.setItem("relay_session_id", newId);
    window.location.reload(); // clear chat state and update session
  }

  return { sessionId, resetSession };
}
