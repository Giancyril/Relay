import { useState, useEffect, useCallback } from "react";
import { fetchFeedbackSummary } from "../api/feedbackApi";
import MetricCard from "./MetricCard";

/**
 * FeedbackDashboard — standalone CSAT report & Feedback Log view.
 */
export default function FeedbackDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFeedback = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchFeedbackSummary(100);
      setData(res);
    } catch (err) {
      setError(err.message || "Failed to load CSAT feedback.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  const total = data?.total_feedback || 0;
  const pos = data?.positive_count || 0;
  const neg = data?.negative_count || 0;
  const csat = data?.csat_score !== undefined ? data.csat_score.toFixed(1) : "100.0";

  return (
    <div className="flex-1 overflow-y-auto chat-scroll p-6 space-y-6 max-w-7xl mx-auto w-full">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-700 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">CSAT & User Feedback</h2>
          <p className="text-xs text-surface-400">
            Customer satisfaction ratings, helpfulness feedback, and end-user comments
          </p>
        </div>

        <button
          onClick={loadFeedback}
          disabled={isLoading}
          className="flex items-center gap-2 bg-surface-800 hover:bg-surface-700 border border-surface-600 text-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors disabled:opacity-50"
        >
          <svg
            className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Refresh CSAT
        </button>
      </div>

      {error && (
        <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-4 text-xs text-rose-300">
          ⚠️ {error}
        </div>
      )}

      {/* CSAT Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="CSAT Score"
          value={`${csat}%`}
          subtitle="Overall customer satisfaction percentage"
          accentColor="emerald"
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
            </svg>
          }
        />

        <MetricCard
          title="Total Ratings"
          value={total}
          subtitle="Total submitted ratings"
          accentColor="indigo"
        />

        <MetricCard
          title="Positive Ratings (👍)"
          value={pos}
          subtitle="Helpful response ratings"
          accentColor="emerald"
        />

        <MetricCard
          title="Negative Ratings (👎)"
          value={neg}
          subtitle="Unhelpful response ratings"
          accentColor="rose"
        />
      </div>

      {/* Feedback Log Table */}
      <div className="bg-surface-800 border border-surface-700 rounded-2xl p-5 shadow-lg space-y-3">
        <h3 className="text-base font-semibold text-slate-200">Recent Ratings & User Comments</h3>
        <div className="overflow-x-auto rounded-xl border border-surface-700">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-surface-900 text-surface-400 font-semibold border-b border-surface-700 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Original Question</th>
                <th className="px-4 py-3">Generated Answer Preview</th>
                <th className="px-4 py-3">User Comment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-surface-500">
                    Loading CSAT feedback records...
                  </td>
                </tr>
              ) : !data || data.records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-surface-500">
                    No feedback ratings submitted yet. Rate answers in the Customer Chat tab to populate.
                  </td>
                </tr>
              ) : (
                data.records.map((r, idx) => (
                  <tr key={idx} className="hover:bg-surface-700/50 transition-colors">
                    <td className="px-4 py-3 text-surface-400 font-mono whitespace-nowrap">
                      {r.timestamp ? new Date(r.timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {r.rating === "up" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950/60 border border-emerald-700/60 text-emerald-300">👍 Helpful</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-950/60 border border-rose-700/60 text-rose-300">👎 Unhelpful</span>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate font-medium text-slate-200">{r.question}</td>
                    <td className="px-4 py-3 max-w-xs truncate text-surface-400 font-mono">{r.answer}</td>
                    <td className="px-4 py-3 max-w-xs truncate text-slate-300 italic">{r.comment || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
