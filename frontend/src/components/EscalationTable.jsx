import { useState } from "react";
import CustomSelectPicker from "./CustomSelectPicker";
import CustomDatePicker from "./CustomDatePicker";

/**
 * EscalationTable — searchable, filterable table for viewing logged escalations.
 */
export default function EscalationTable({ records, search, setSearch, triggerType, setTriggerType, isLoading }) {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");

  const triggerOptions = [
    { label: "All Triggers", value: "all" },
    { label: "High Distance", value: "distance" },
    { label: "LLM Uncertainty", value: "llm" },
  ];

  // Filter by date if selectedDate is set
  const filteredRecords = selectedDate
    ? records.filter((r) => r.timestamp && r.timestamp.startsWith(selectedDate))
    : records;

  return (
    <div className="bg-surface-800 border border-surface-700 rounded-2xl p-5 shadow-lg space-y-4">

      {/* --- Filter & Search Controls --- */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-200">Logged Escalations</h3>
          <p className="text-xs text-surface-400">Queries that required human follow-up</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-56">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search query text..."
              className="w-full bg-surface-900 border border-surface-600 rounded-xl px-3.5 py-1.5 text-xs text-slate-200 placeholder-surface-500 outline-none focus:border-brand-500 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-500 hover:text-slate-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Custom Date Picker */}
          <CustomDatePicker
            value={selectedDate}
            onChange={setSelectedDate}
            placeholder="Filter Date"
          />

          {/* Custom Select Picker */}
          <CustomSelectPicker
            value={triggerType}
            onChange={setTriggerType}
            options={triggerOptions}
          />
        </div>
      </div>

      {/* --- Table Component --- */}
      <div className="overflow-x-auto rounded-xl border border-surface-700">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-surface-900 text-surface-400 font-semibold border-b border-surface-700 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">User Question</th>
              <th className="px-4 py-3">Trigger Reason</th>
              <th className="px-4 py-3 text-right">Confidence</th>
              <th className="px-4 py-3 text-right">Distance</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-700">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-surface-500">
                  Loading escalation records...
                </td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-surface-500">
                  No matching escalation records found.
                </td>
              </tr>
            ) : (
              filteredRecords.map((r, idx) => {
                const dateStr = r.timestamp
                  ? new Date(r.timestamp).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "N/A";

                return (
                  <tr
                    key={idx}
                    className="hover:bg-surface-700/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedRecord(r)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-surface-400 font-mono">
                      {dateStr}
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate font-medium text-slate-200">
                      {r.question}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {r.distance_triggered && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-rose-950/60 border border-rose-800/60 text-rose-300 mr-1">
                          Vector Distance
                        </span>
                      )}
                      {r.llm_triggered && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-950/60 border border-amber-800/60 text-amber-300">
                          LLM Uncertainty
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-slate-300">
                      {(r.confidence_score * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-surface-400">
                      {r.top_distance.toFixed(4)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRecord(r);
                        }}
                        className="text-brand-400 hover:text-brand-300 text-xs underline font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* --- Detail Modal --- */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-surface-800 border border-surface-600 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-surface-700 pb-3">
              <h4 className="text-sm font-semibold text-slate-100">Escalation Record Detail</h4>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-surface-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-surface-500 font-semibold block uppercase tracking-wider mb-1">User Question</span>
                <p className="bg-surface-900 border border-surface-700 rounded-xl p-3 text-slate-200 leading-relaxed">
                  {selectedRecord.question}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-surface-500 font-semibold block uppercase tracking-wider mb-1">Confidence Score</span>
                  <span className="font-mono text-sm text-slate-200">
                    {(selectedRecord.confidence_score * 100).toFixed(2)}%
                  </span>
                </div>
                <div>
                  <span className="text-surface-500 font-semibold block uppercase tracking-wider mb-1">Top Distance</span>
                  <span className="font-mono text-sm text-slate-200">
                    {selectedRecord.top_distance.toFixed(4)}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-surface-500 font-semibold block uppercase tracking-wider mb-1">Answer Preview</span>
                <p className="bg-surface-900 border border-surface-700 rounded-xl p-3 text-surface-300 leading-relaxed font-mono">
                  {selectedRecord.answer_preview || "(No answer generated)"}
                </p>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedRecord(null)}
                className="bg-surface-700 hover:bg-surface-600 text-slate-200 px-4 py-1.5 rounded-xl text-xs font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
