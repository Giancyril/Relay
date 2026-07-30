import { useState, useCallback } from "react";

/**
 * usePinnedMessages — hook to manage pinned conversation items.
 */
export function usePinnedMessages() {
  const [pinnedIds, setPinnedIds] = useState(new Set());

  const togglePin = useCallback((id) => {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  return { pinnedIds, togglePin };
}
