import { useState, useEffect, useCallback } from "react";
import { fetchAnalyticsSummary, fetchEscalations } from "../api/adminApi";
import { fetchFeedbackSummary } from "../api/feedbackApi";
import MetricCard from "./MetricCard";
import EscalationTable from "./EscalationTable";
import DocumentList from "./DocumentList";

/**
 * AdminDashboard — main container for Admin view (Analytics & KB Management).
 */
export default function AdminDashboard() {
  const [adminTab, setAdminTab] = useState("analytics"); // "analytics" | "kb"
  const [summary, setSummary] = useState(null);
  const [feedbackData, setFeedbackData] = useState(null);
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [triggerType, setTriggerType] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sumData, escData, fbData] = await Promise.all([
        fetchAnalyticsSummary(),
        fetchEscalations({ limit: 100, search, triggerType }),
        fetchFeedbackSummary(100),
      ]);
      setSummary(sumData);
      setRecords(escData.records || []);
      setFeedbackData(fbData);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, [search, triggerType]);

  useEffect(() => {
    if (adminTab === "analytics") {
      loadData();
    }
  }, [adminTab, loadData]);

  const total = summary?.total_escalations || 0;
  const distCount = summary?.distance_triggered_count || 0;
  const llmCount = summary?.llm_triggered_count || 0;
  const avgConf = ((summary?.avg_confidence_score || 0) * 100).toFixed(1);

  return (
    <div className="flex-1 overflow-y-auto chat-scroll p-6 space-y-6 max-w-7xl mx-auto w-full">

      {/* --- Top Sub-Nav Header --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-700 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Admin Control Center</h2>
          <p className="text-xs text-surface-400">
            Manage knowledge base documents, vector index, and escalation telemetry
          </p>
        </div>

        {/* Sub-tab Pills */}
        <div className="flex items-center bg-surface-800 border border-surface-700 p-1 rounded-xl">
          <button
            onClick={() => setAdminTab("analytics")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              adminTab === "analytics"
                ? "bg-surface-700 text-brand-400 font-semibold shadow"
                : "text-surface-400 hover:text-slate-200"
            }`}
          >
            📊 Analytics & Telemetry
          </button>

          <button
            onClick={() => setAdminTab("kb")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              adminTab === "kb"
                ? "bg-surface-700 text-brand-400 font-semibold shadow"
                : "text-surface-400 hover:text-slate-200"
            }`}
          >
            📚 Knowledge Base Manager
          </button>
        </div>
      </div>

      {/* --- Sub-Tab Views --- */}
      {adminTab === "analytics" ? (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={loadData}
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
              Refresh Telemetry
            </button>
          </div>

          {error && (
            <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-4 text-xs text-rose-300">
              ⚠️ {error}
            </div>
          )}

          {/* Metric Cards — 5 columns on XL screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <MetricCard
              title="Total Escalations"
              value={total}
              subtitle="Total queries requiring human support"
              accentColor="amber"
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              }
            />

            <MetricCard
              title="Avg Confidence"
              value={`${avgConf}%`}
              subtitle="Mean confidence across escalated cases"
              accentColor="indigo"
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              }
            />

            <MetricCard
              title="Vector Distance"
              value={distCount}
              subtitle="Triggered by distance threshold"
              accentColor="rose"
              badge={`${total ? Math.round((distCount / total) * 100) : 0}%`}
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              }
            />

            <MetricCard
              title="LLM Uncertainty"
              value={llmCount}
              subtitle="Triggered by model confidence phrase"
              accentColor="emerald"
              badge={`${total ? Math.round((llmCount / total) * 100) : 0}%`}
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 18h.008v.008H12V18z" />
                </svg>
              }
            />

            {/* CSAT Metric Card */}
            <MetricCard
              title="CSAT Score"
              value={feedbackData ? `${feedbackData.csat_score.toFixed(1)}%` : "—"}
              subtitle={feedbackData ? `${feedbackData.positive_count} 👍 / ${feedbackData.negative_count} 👎 from ${feedbackData.total_feedback} ratings` : "No ratings yet"}
              accentColor="emerald"
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
                </svg>
              }
            />
          </div>

          <EscalationTable
            records={records}
            search={search}
            setSearch={setSearch}
            triggerType={triggerType}
            setTriggerType={setTriggerType}
            isLoading={isLoading}
          />

          {/* Feedback Log Table */}
          {feedbackData && feedbackData.records.length > 0 && (
            <div className="bg-surface-800 border border-surface-700 rounded-2xl p-5 shadow-lg space-y-3">
              <h3 className="text-base font-semibold text-slate-200">User Feedback Log</h3>
              <div className="overflow-x-auto rounded-xl border border-surface-700">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-surface-900 text-surface-400 font-semibold border-b border-surface-700 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Rating</th>
                      <th className="px-4 py-3">Question</th>
                      <th className="px-4 py-3">Comment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-700">
                    {feedbackData.records.map((r, idx) => (
                      <tr key={idx} className="hover:bg-surface-700/50 transition-colors">
                        <td className="px-4 py-3 text-surface-400 font-mono whitespace-nowrap">
                          {r.timestamp ? new Date(r.timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {r.rating === "up" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950/60 border border-emerald-700/60 text-emerald-300">👍 Helpful</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-950/60 border border-rose-700/60 text-rose-300">👎 Unhelpful</span>
                          )}
                        </td>
                        <td className="px-4 py-3 max-w-xs truncate text-slate-200">{r.question}</td>
                        <td className="px-4 py-3 max-w-xs truncate text-surface-400 italic">{r.comment || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <DocumentList />
      )}

    </div>
  );
}
