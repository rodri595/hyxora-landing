"use client";

import { haptic } from "@/utils/haptics";
import { useEffect, useRef } from "react";
import { useToasterStore } from "react-hot-toast";

/**
 * ToastHaptics — bridges react-hot-toast to haptic feedback.
 *
 * Renders nothing. Watches the global toast store and fires a haptic whenever a
 * toast appears (or a loading toast resolves via toast.promise). Mount it once,
 * next to <Toaster> in the root layout, and every toast in the app buzzes for
 * free — no need to touch individual toast() call sites.
 */
const TYPE_TO_PATTERN = {
  success: "success",
  error: "error",
  // "loading" intentionally omitted — it's transient and resolves into
  // success/error, which carry the meaningful feedback.
};

const ToastHaptics = () => {
  const { toasts } = useToasterStore();
  // Tracks the last type we reacted to per toast id, so we fire once per toast
  // and again if the type changes (loading -> success/error).
  const seen = useRef(new Map());

  useEffect(() => {
    const liveIds = new Set();

    for (const t of toasts) {
      liveIds.add(t.id);
      if (t.visible === false) continue;
      if (seen.current.get(t.id) === t.type) continue;

      seen.current.set(t.id, t.type);
      const pattern = TYPE_TO_PATTERN[t.type];
      if (pattern) haptic(pattern);
    }

    // Forget dismissed toasts so reused ids fire again.
    for (const id of seen.current.keys()) {
      if (!liveIds.has(id)) seen.current.delete(id);
    }
  }, [toasts]);

  return null;
};

export default ToastHaptics;
