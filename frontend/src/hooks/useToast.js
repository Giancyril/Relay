/**
 * useToast.js — lightweight global toast notification hook.
 *
 * Usage:
 *   const { toasts, showToast, dismissToast } = useToast();
 *   showToast("Copied!", "success");          // success | error | info | warning
 */
import { useState, useCallback } from "react";

let _idCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info", duration = 3000) => {
    const id = ++_idCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, showToast, dismissToast };
}
