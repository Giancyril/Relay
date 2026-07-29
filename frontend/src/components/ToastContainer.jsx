/**
 * ToastContainer — renders toast notifications in a fixed bottom-right stack.
 * Each toast slides in from the right and auto-dismisses.
 */
export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  const ICONS = {
    success: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    ),
    error: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    ),
    warning: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.008v.008H12v-.008z" />
      </svg>
    ),
    info: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
    ),
  };

  const STYLES = {
    success: "bg-emerald-900/90 border-emerald-700/60 text-emerald-200",
    error:   "bg-rose-900/90 border-rose-700/60 text-rose-200",
    warning: "bg-amber-900/90 border-amber-700/60 text-amber-200",
    info:    "bg-surface-800/95 border-surface-600/60 text-slate-200",
  };

  const ICON_COLORS = {
    success: "text-emerald-400",
    error:   "text-rose-400",
    warning: "text-amber-400",
    info:    "text-brand-400",
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-sm
            pointer-events-auto max-w-xs w-full
            animate-[slideInRight_0.25s_ease-out]
            ${STYLES[toast.type] || STYLES.info}`}
          style={{
            animation: "slideInRight 0.25s ease-out",
          }}
        >
          <span className={`flex-shrink-0 mt-0.5 ${ICON_COLORS[toast.type] || ICON_COLORS.info}`}>
            {ICONS[toast.type] || ICONS.info}
          </span>
          <p className="text-xs font-medium leading-relaxed flex-1">{toast.message}</p>
          <button
            onClick={() => onDismiss(toast.id)}
            className="flex-shrink-0 text-current opacity-50 hover:opacity-100 transition-opacity ml-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(1.5rem); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
