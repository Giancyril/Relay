/**
 * adminApi.js — API wrapper for Admin Analytics & Escalation endpoints
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Fetch analytics summary metrics.
 */
export async function fetchAnalyticsSummary() {
  const response = await fetch(`${BASE_URL}/analytics/summary`);
  if (!response.ok) {
    throw new Error(`Failed to fetch analytics summary (${response.status})`);
  }
  return response.json();
}

/**
 * Fetch escalated queries with optional search and filtering.
 */
export async function fetchEscalations({ limit = 50, search = "", triggerType = "" } = {}) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (search.trim()) params.append("search", search.trim());
  if (triggerType && triggerType !== "all") params.append("trigger_type", triggerType);

  const response = await fetch(`${BASE_URL}/escalations?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch escalations (${response.status})`);
  }
  return response.json();
}
