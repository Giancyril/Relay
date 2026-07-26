import { useState, useEffect, useCallback } from "react";
import { fetchAnalyticsSummary, fetchEscalations } from "../api/adminApi";
import MetricCard from "./MetricCard";
import EscalationTable from "./EscalationTable";

/**
 * AdminDashboard — main container for the Analytics & Escalation Management view.
 */
export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [triggerType, setTriggerType] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sumData, escData] = await Promise.all([
        fetchAnalyticsSummary(),
        fetchEscalations({ limit: 100, search, triggerType }),
      ]);
      setSummary(sumData);
      setRecords(escData.records || []);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, [search, triggerType]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const total = summary?.total_escalations || 0;
  const distCount = summary?.distance_triggered_count || 0;
  const llmCount = summary?.llm_triggered_count || 0;
  const avgConf = ((summary?.avg_confidence_score || 0) * 100).toFixed(1);

  return (
    <div className="flex-1 overflow-y-auto chat-scroll p-6 space-y-6 max-w-7xl mx-auto w-full">

      {/* --- Top Header / Refresh Bar --- */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Analytics & Escalations</h2>
          <p className="text-xs text-surface-400">
            Real-time telemetry on model confidence and human support handoffs
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="flex items-center gap-2 bg-surface-800 hover:bg-surface-700 border border-surface-600 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-medium transition-colors disabled:opacity-50"
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
          Refresh Data
        </button>
      </div>

      {error && (
        <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-4 text-xs text-rose-300">
          ⚠️ {error}
        </div>
      )}

      {/* --- Metric Cards Grid --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      </div>

      {/* --- Escalation Table --- */}
      <EscalationTable
        records={records}
        search={search}
        setSearch={setSearch}
        triggerType={triggerType}
        setTriggerType={setTriggerType}
        isLoading={isLoading}
      />

    </div>
  );
}
