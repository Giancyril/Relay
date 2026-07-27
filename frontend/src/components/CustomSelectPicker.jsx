import { useState, useRef, useEffect } from "react";

/**
 * CustomSelectPicker — modern, dark-themed custom select dropdown component.
 */
export default function CustomSelectPicker({ value, onChange, options = [], placeholder = "Select option..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2 bg-surface-900 border border-surface-600 hover:border-surface-500 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none focus:outline-none select-none transition-all cursor-pointer min-w-[140px]"
      >
        <span className="truncate font-medium">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-surface-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-brand-400" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Dropdown Options Popup */}
      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-surface-800 border border-surface-600 rounded-xl shadow-2xl py-1 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors outline-none focus:outline-none ${
                  isSelected
                    ? "bg-surface-700 text-brand-400 font-semibold"
                    : "text-slate-300 hover:bg-surface-700/60 hover:text-slate-100"
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <svg className="w-3.5 h-3.5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
