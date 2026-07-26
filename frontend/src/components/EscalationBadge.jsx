/** EscalationBadge — shown on agent messages where escalated === true */
export default function EscalationBadge() {
  return (
    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-amber-700/40">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-900/40 border border-amber-600/50 text-amber-300 text-xs font-medium">
        {/* Warning icon */}
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
        Escalated to Human Support
      </span>
      <span className="text-xs text-surface-500">
        A support agent will follow up on this query.
      </span>
    </div>
  );
}
