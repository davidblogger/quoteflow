"use client";

import { useEffect, useRef } from "react";
import { toast as sonnerToast } from "sonner";

/**
 * Maps a form action's `message` field to a Sonner toast.
 * `success` and `genericError` map to the obvious toast types.
 * `invalid` (validation) does NOT toast — those show inline field errors
 * and the form itself communicates the failure. The caller can pass a
 * separate `validationToast` string if they want a top-level note
 * for validation errors too (we don't today).
 */
type MessageKind = "success" | "error" | "invalid" | string;

type Options = {
  success?: string;
  error?: string;
  genericError?: string;
};

export function useActionToast(
  message: MessageKind,
  options: Options,
) {
  // Only fire the toast when the message actually changes. Without
  // this guard React strict mode (and any future re-render) would
  // re-fire the toast on every render.
  const lastMessage = useRef<MessageKind | null>(null);
  useEffect(() => {
    if (message === lastMessage.current) return;
    lastMessage.current = message;
    if (message === "success" && options.success) {
      sonnerToast.success(options.success);
      return;
    }
    if (
      (message === "error" || message === "genericError") &&
      options.error
    ) {
      sonnerToast.error(options.error);
      return;
    }
  }, [message, options]);
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