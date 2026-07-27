import { useState, useRef, useEffect } from "react";

const SUGGESTED_PROMPTS = [
  { icon: "🔐", text: "How do I enable 2FA?" },
  { icon: "💳", text: "What payment methods do you accept?" },
  { icon: "🌐", text: "What web browsers are supported?" },
  { icon: "🔒", text: "How is my personal data secured?" },
];

/**
 * InputBar — pinned bottom input with voice dictation & prompt chips.
 */
export default function InputBar({ onSubmit, isLoading }) {
  const [value, setValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");
        setValue(transcript);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  function toggleListening() {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handlePromptClick(promptText) {
    if (isLoading) return;
    onSubmit(promptText);
  }

  function handleInput(e) {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  return (
    <div className="border-t border-surface-700 bg-surface-800 px-4 py-3">
      {/* ── Suggested Prompt Chips ───────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <span className="text-[11px] font-medium text-surface-500 uppercase tracking-wider whitespace-nowrap flex-shrink-0">
          Suggested:
        </span>
        {SUGGESTED_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handlePromptClick(prompt.text)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-700/80 hover:bg-surface-700 border border-surface-600 text-xs text-slate-300 hover:text-white transition-all whitespace-nowrap flex-shrink-0 active:scale-95 disabled:opacity-50"
          >
            <span>{prompt.icon}</span>
            <span>{prompt.text}</span>
          </button>
        ))}
      </div>

      {/* ── Textarea Input Box ──────────────────────────────── */}
      <div className="flex items-end gap-2 bg-surface-700 border border-surface-600 rounded-2xl px-4 py-2.5 focus-within:border-brand-600 transition-colors">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder={isListening ? "Listening... Speak now..." : "Ask a customer support question..."}
          className="flex-1 bg-transparent text-sm text-slate-200 placeholder-surface-500 resize-none outline-none leading-relaxed disabled:opacity-50 max-h-40"
          style={{ height: "auto" }}
        />

        {/* Voice Dictation Button */}
        <button
          onClick={toggleListening}
          disabled={isLoading}
          className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
            isListening
              ? "bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse"
              : "text-surface-400 hover:text-slate-200 hover:bg-surface-600"
          }`}
          title={isListening ? "Stop Listening" : "Voice Dictation"}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v11m-4-7a4 4 0 008 0V5a4 4 0 00-8 0v7z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 01-14 0v-2M12 19v4m-4 0h8" />
          </svg>
        </button>

        {/* Send Button */}
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || isLoading}
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all bg-brand-600 text-white hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          aria-label="Send message"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>
      <p className="text-center text-xs text-surface-600 mt-2">
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
