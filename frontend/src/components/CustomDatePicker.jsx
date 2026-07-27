import { useState, useRef, useEffect } from "react";

/**
 * CustomDatePicker — modern, dark-themed custom date range/date selector picker.
 */
export default function CustomDatePicker({ value, onChange, placeholder = "Filter by Date" }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Quick preset dates
  const presets = [
    { label: "All Time", value: "" },
    { label: "Today", value: new Date().toISOString().split("T")[0] },
    {
      label: "Last 7 Days",
      value: new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0],
    },
    {
      label: "Last 30 Days",
      value: new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0],
    },
  ];

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayLabel = value
    ? `From ${new Date(value).toLocaleDateString([], { month: "short", day: "numeric" })}`
    : placeholder;

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-surface-900 border border-surface-600 hover:border-surface-500 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none focus:outline-none select-none transition-all cursor-pointer"
      >
        <svg className="w-3.5 h-3.5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
        <span className="font-medium truncate">{displayLabel}</span>
        {value && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="text-surface-500 hover:text-slate-200 text-xs ml-1"
          >
            ✕
          </span>
        )}
      </button>

      {/* Date Picker Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1 w-56 bg-surface-800 border border-surface-600 rounded-xl shadow-2xl p-3 z-50 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider">
            Quick Date Filter
          </div>

          {/* Presets */}
          <div className="space-y-1">
            {presets.map((p) => {
              const isSelected = value === p.value;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    onChange(p.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors outline-none focus:outline-none ${
                    isSelected
                      ? "bg-surface-700 text-brand-400 font-semibold"
                      : "text-slate-300 hover:bg-surface-700/60"
                  }`}
                >
                  <span>{p.label}</span>
                  {isSelected && (
                    <svg className="w-3 h-3 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          <div className="border-t border-surface-700 pt-2">
            <label className="block text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-1">
              Select Specific Date
            </label>
            <input
              type="date"
              value={value || ""}
              onChange={(e) => {
                onChange(e.target.value);
                setIsOpen(false);
              }}
              className="w-full bg-surface-900 border border-surface-600 rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none focus:border-brand-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
