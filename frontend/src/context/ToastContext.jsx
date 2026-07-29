/**
 * ToastContext — provides showToast() globally to the whole component tree.
 *
 * Usage anywhere in the app:
 *   import { useToastContext } from "../context/ToastContext";
 *   const { showToast } = useToastContext();
 *   showToast("Saved!", "success");
 */
import { createContext, useContext } from "react";
import { useToast } from "../hooks/useToast";
import ToastContainer from "../components/ToastContainer";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const { toasts, showToast, dismissToast } = useToast();

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToastContext must be used inside <ToastProvider>");
  return ctx;
}
