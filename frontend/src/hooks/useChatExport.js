import { useCallback } from "react";
import { useToastContext } from "../context/ToastContext";

/**
 * useChatExport — hook to export current conversation transcript as TXT or JSON file.
 */
export function useChatExport(messages, sessionId) {
  const { showToast } = useToastContext();

  const exportAsTxt = useCallback(() => {
    if (!messages || messages.length === 0) {
      showToast("No chat history to export.", "warning");
      return;
    }

    const lines = [
      `==================================================`,
      `RELAY SUPPORT AI — CHAT TRANSCRIPT`,
      `Session ID: ${sessionId}`,
      `Export Date: ${new Date().toLocaleString()}`,
      `Total Messages: ${messages.length}`,
      `==================================================\n`,
    ];

    messages.forEach((msg, index) => {
      const timeStr = msg.timestamp
        ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "";
      const roleLabel = msg.role === "user" ? "USER" : msg.role === "agent" ? "RELAY AI AGENT" : "SYSTEM ERROR";

      lines.push(`[#${index + 1}] ${roleLabel} (${timeStr})`);
      if (msg.sentiment) lines.push(`Sentiment: ${msg.sentiment} | Urgency: ${msg.urgency || "low"}`);
      if (typeof msg.confidence_score === "number") lines.push(`Confidence Score: ${(msg.confidence_score * 100).toFixed(1)}%`);
      if (typeof msg.responseTimeMs === "number") lines.push(`Latency: ${msg.responseTimeMs}ms`);
      lines.push(`Content:\n${msg.text}\n`);

      if (msg.sources && msg.sources.length > 0) {
        lines.push(`Sources Cited:`);
        msg.sources.forEach((s) => lines.push(` - ${s.title || s.doc_id}: ${s.snippet || ""}`));
        lines.push(``);
      }

      lines.push(`--------------------------------------------------\n`);
    });

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat_transcript_${sessionId.slice(0, 8)}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Downloaded chat transcript (.txt)", "success");
  }, [messages, sessionId, showToast]);

  const exportAsJson = useCallback(() => {
    if (!messages || messages.length === 0) {
      showToast("No chat history to export.", "warning");
      return;
    }

    const payload = {
      session_id: sessionId,
      exported_at: new Date().toISOString(),
      total_messages: messages.length,
      messages: messages.map((m) => ({
        id: m.id,
        role: m.role,
        text: m.text,
        timestamp: m.timestamp,
        confidence_score: m.confidence_score,
        escalated: m.escalated,
        sentiment: m.sentiment,
        urgency: m.urgency,
        response_time_ms: m.responseTimeMs,
        sources: m.sources,
      })),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat_transcript_${sessionId.slice(0, 8)}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Downloaded chat transcript (.json)", "success");
  }, [messages, sessionId, showToast]);

  return { exportAsTxt, exportAsJson };
}
