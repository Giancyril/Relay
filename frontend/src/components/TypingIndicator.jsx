/** TypingIndicator — animated three-dot indicator while waiting for API response */
export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 px-4 py-2">
      {/* Agent avatar */}
      <div className="w-8 h-8 rounded-full bg-surface-700 border border-surface-600 flex items-center justify-center flex-shrink-0 mt-1">
        <span className="text-brand-400 text-xs font-bold">R</span>
      </div>

      <div className="bg-surface-700 border border-surface-600 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-surface-500 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.9s" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
