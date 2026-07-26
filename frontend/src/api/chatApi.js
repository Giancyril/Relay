/**
 * chatApi.js — thin wrapper around POST /chat
 * Reads backend URL from VITE_API_URL env var (defaults to localhost:8000)
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * @param {string} question
 * @param {string} sessionId
 * @returns {Promise<{answer, escalated, confidence_score, sources, session_id}>}
 */
export async function sendMessage(question, sessionId) {
  const response = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, session_id: sessionId }),
  });

  if (!response.ok) {
    let detail = `Server error (${response.status})`;
    try {
      const err = await response.json();
      detail = err.detail || detail;
    } catch (_) {}
    throw new Error(detail);
  }

  return response.json();
}

/**
 * Clear backend conversation history for a session.
 */
export async function clearHistory(sessionId) {
  if (!sessionId) return;
  try {
    await fetch(`${BASE_URL}/chat/history/${encodeURIComponent(sessionId)}`, {
      method: "DELETE",
    });
  } catch (err) {
    console.warn("Failed to clear session history:", err);
  }
}

