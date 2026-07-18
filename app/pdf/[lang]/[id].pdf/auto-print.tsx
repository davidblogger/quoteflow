"use client";

import { useEffect } from "react";

export function AutoPrint({ delay = 0 }: { delay?: number }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = window.setTimeout(() => {
      window.print();
    }, delay);
    return () => window.clearTimeout(id);
  }, [delay]);

  return null;
}
