"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        classNames: {
          toast:
            "bg-[#0a0e1a] border border-white/10 text-white shadow-2xl",
          title: "text-white",
          description: "text-white/75",
          actionButton:
            "bg-accent-2 text-white hover:bg-accent-2/90",
          cancelButton:
            "bg-white/10 text-white/75 hover:bg-white/20",
        },
      }}
    />
  );
}