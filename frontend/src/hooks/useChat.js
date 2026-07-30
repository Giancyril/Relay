/**
 * useChat.js — manages message thread, API calls, loading, and error state.
 *
 * Message shape:
 *   { id, role: "user"|"agent"|"error", text, escalated, confidence_score, sources, timestamp, sentiment, urgency, responseTimeMs }
 */

import { useState, useCallback } from "react";
import { sendMessage } from "../api/chatApi";

export function useChat(sessionId, onPlaySound) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = useCallback((msg) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), timestamp: new Date(), ...msg },
    ]);
  }, []);

  const submit = useCallback(
    async (question) => {
      const trimmed = question.trim();
      if (!trimmed) return;

      // Add user message immediately
      addMessage({ role: "user", text: trimmed });
      setIsLoading(true);
      onPlaySound?.("send");

      const startTime = performance.now();
      try {
        const data = await sendMessage(trimmed, sessionId);
        const elapsedMs = Math.round(performance.now() - startTime);
        addMessage({
          role: "agent",
          text: data.answer,
          escalated: data.escalated,
          confidence_score: data.confidence_score,
          sources: data.sources || [],
          sentiment: data.sentiment || null,
          urgency: data.urgency || null,
          responseTimeMs: elapsedMs,
          originalQuestion: trimmed,  // passed to FeedbackButtons
        });
        onPlaySound?.("receive");
      } catch (err) {
        addMessage({
          role: "error",
          text: err.message || "Something went wrong. Please try again.",
          originalQuestion: trimmed,
        });
        onPlaySound?.("error");
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, addMessage, onPlaySound]
  );

  return { messages, isLoading, submit };
}
