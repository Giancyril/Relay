/**
 * feedbackApi.js — API wrapper for submitting user feedback and fetching CSAT metrics.
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Submit thumbs up / thumbs down feedback.
 */
export async function sendFeedback({ rating, question, answer, comment = "", sessionId = "" }) {
  const response = await fetch(`${BASE_URL}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rating,
      question,
      answer,
      comment,
      session_id: sessionId,
    }),
  });

  if (!response.ok) {
    let detail = `Feedback submission failed (${response.status})`;
    try {
      const err = await response.json();
      detail = err.detail || detail;
    } catch (_) {}
    throw new Error(detail);
  }

  return response.json();
}

/**
 * Fetch feedback logs and aggregate CSAT metrics.
 */
export async function fetchFeedbackSummary(limit = 50) {
  const response = await fetch(`${BASE_URL}/feedback?limit=${limit}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch feedback summary (${response.status})`);
  }
  return response.json();
}
