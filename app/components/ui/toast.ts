"use client";

import { useEffect, useRef } from "react";
import { toast as sonnerToast } from "sonner";

/**
 * Fire a Sonner toast in response to a form action result.
 *
 * Rules:
 *  - `message === "success"` → success toast (if `options.success` set)
 *  - `message === "error" | "genericError"` → error toast (if set)
 *  - anything else (e.g. "invalid", "idle") → no toast
 *
 * For the error case the caller can also pass `formError` (a more
 * specific bucket from the action) — it gets paired with its own
 * copy if defined, otherwise falls back to `options.error`.
 *
 * Toast fires only when the message (or formError) actually changes,
 * so React strict mode + re-renders don't spam toasts.
 */
export function useActionToast(
  message: string,
  options: {
    success?: string;
    error?: string;
    formError?: string | null;
    formErrorCopy?: Partial<Record<string, string>>;
  },
) {
  const lastKey = useRef<string | null>(null);
  useEffect(() => {
    const key = `${message}::${options.formError ?? ""}`;
    if (key === lastKey.current) return;
    lastKey.current = key;

    if (message === "success" && options.success) {
      sonnerToast.success(options.success);
      return;
    }
    if (message === "error" || message === "genericError") {
      if (options.formError && options.formErrorCopy) {
        const specific = options.formErrorCopy[options.formError];
        if (specific) {
          sonnerToast.error(specific);
          return;
        }
      }
      if (options.error) sonnerToast.error(options.error);
    }
  }, [message, options.formError, options.success, options.error, options.formErrorCopy]);
}

/**
 * Show a confirmation toast with Cancel / Confirm actions.
 * On confirm, the caller is expected to actually do the destructive
 * thing (call the action, navigate, etc.) — pass a function via
 * `onConfirm`.
 *
 * Sonner's "action" / "cancel" affordances render as buttons inside
 * the toast. The toast stays open until the user picks one or the
 * duration elapses; if duration elapses, the action is cancelled.
 */
export function confirmToast(args: {
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void | Promise<void>;
  tone?: "danger" | "default";
}) {
  sonnerToast(args.message, {
    duration: 10_000,
    action: {
      label: args.confirmLabel,
      onClick: () => void args.onConfirm(),
    },
    cancel: {
      label: args.cancelLabel,
      onClick: () => {},
    },
    ...(args.tone === "danger"
      ? {
          // Sonner doesn't expose a built-in danger variant; the
          // caller can override with style. For the simple case, a
          // subtle red bg hints at the destructive action without
          // overriding the dark theme.
          style: {
            background: "rgba(220, 38, 38, 0.12)",
            border: "1px solid rgba(220, 38, 38, 0.35)",
          },
        }
      : {}),
  });
}