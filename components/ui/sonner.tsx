"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-[#34d399]" />,
        info: <InfoIcon className="size-4 text-[#22d3ee]" />,
        warning: <TriangleAlertIcon className="size-4 text-[#fbbf24]" />,
        error: <OctagonXIcon className="size-4 text-[#f87171]" />,
        loading: <Loader2Icon className="size-4 animate-spin text-[#a78bfa]" />,
      }}
      style={
        {
          "--normal-bg": "#0a0e1a",
          "--normal-text": "#ffffff",
          "--normal-border": "rgba(255,255,255,0.1)",
          "--border-radius": "0.625rem",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "bg-[#0a0e1a] border border-white/10 text-white shadow-2xl",
          title: "text-white",
          description: "text-white/70",
          actionButton: "bg-accent-2 text-white hover:bg-accent-2/90",
          cancelButton: "bg-white/10 text-white/75 hover:bg-white/20",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
