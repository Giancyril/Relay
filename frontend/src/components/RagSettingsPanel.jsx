import { useState } from "react";

const PERSONAS = [
  { id: "helpful", name: "Professional & Helpful", desc: "Balanced tone, polite, detailed responses." },
  { id: "concise", name: "Concise & Direct", desc: "Short, bulleted, action-oriented answers." },
  { id: "empathetic", name: "Empathetic Support Specialist", desc: "Warm, supportive, customer-centric framing." },
  { id: "technical", name: "Technical Support Engineer", desc: "Precise technical language, step-by-step guidance." },
];

/**
 * RagSettingsPanel — Admin tuning control panel for RAG parameters & persona.
 */
export default function RagSettingsPanel() {
  const [topK, setTopK] = useState(3);
  const [distanceThreshold, setDistanceThreshold] = useState(0.5);
  const [selectedPersona, setSelectedPersona] = useState("helpful");
  const [isSaved, setIsSaved] = useState(false);

  function handleSave() {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  }

  return (
    <div className="bg-surface-800 border border-surface-700 rounded-2xl p-6 shadow-lg space-y-6">
      <div className="flex items-center justify-between border-b border-surface-700 pb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-200">RAG Guardrails & Persona Config</h3>
          <p className="text-xs text-surface-400">Tune vector retrieval parameters and AI system persona</p>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95 flex items-center gap-1.5"
        >
          <span>{isSaved ? "✓ Saved" : " Save Settings"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── Retrieval Top-K Slider ──────────────────────────── */}
        <div className="bg-surface-900/60 border border-surface-700/60 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-300">Retrieval Top-K Chunks</label>
            <span className="text-xs font-bold text-brand-400 px-2 py-0.5 bg-brand-950/60 border border-brand-800/60 rounded-md">
              {topK} chunks
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={topK}
            onChange={(e) => setTopK(Number(e.target.value))}
            className="w-full accent-brand-500 cursor-pointer"
          />
          <p className="text-[11px] text-surface-400 leading-relaxed">
            Controls how many matching knowledge base document chunks are retrieved per query.
          </p>
        </div>

        {/* ── Escalation Distance Threshold Slider ──────────── */}
        <div className="bg-surface-900/60 border border-surface-700/60 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-300">Escalation Distance Threshold</label>
            <span className="text-xs font-bold text-amber-400 px-2 py-0.5 bg-amber-950/60 border border-amber-800/60 rounded-md">
              {distanceThreshold.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="0.10"
            max="0.90"
            step="0.05"
            value={distanceThreshold}
            onChange={(e) => setDistanceThreshold(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <p className="text-[11px] text-surface-400 leading-relaxed">
            Vector distance above this threshold automatically triggers human escalation.
          </p>
        </div>
      </div>

      {/* ── AI Persona Selector ───────────────────────────────── */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-slate-300 block">AI Support Persona & Tone</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PERSONAS.map((p) => {
            const isSelected = selectedPersona === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedPersona(p.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${isSelected
                    ? "bg-brand-950/40 border-brand-500 shadow-md ring-1 ring-brand-500/50"
                    : "bg-surface-900/40 border-surface-700 hover:border-surface-600"
                  }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-200">{p.name}</span>
                  {isSelected && <span className="text-xs text-brand-400">✓</span>}
                </div>
                <p className="text-[11px] text-surface-400 leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
