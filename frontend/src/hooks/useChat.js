/**
 * useChat.js — manages message thread, API calls, loading, and error state.
 *
 * Message shape:
 *   { id, role: "user"|"agent"|"error", text, escalated, confidence_score, sources, timestamp }
 */

import { useState, useCallback } from "react";
import { sendMessage } from "../api/chatApi";

export function useChat(sessionId) {
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

      try {
        const data = await sendMessage(trimmed, sessionId);
        addMessage({
          role: "agent",
          text: data.answer,
          escalated: data.escalated,
          confidence_score: data.confidence_score,
          sources: data.sources || [],
          originalQuestion: trimmed,  // passed to FeedbackButtons
        });
      } catch (err) {
        addMessage({
          role: "error",
          text: err.message || "Something went wrong. Please try again.",
          originalQuestion: trimmed,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, addMessage]
  );

  return { messages, isLoading, submit };
}
