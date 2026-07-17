import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Quote } from "@/lib/types/quote"
import type { Client } from "@/lib/types/client"
import type { Profile } from "@/lib/supabase/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount)
}

export function formatDate(dateString: string, locale: string = "en"): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

export type ShareData = {
  quote: Quote
  client: Client
  profile: Profile
  pdfUrl: string
  lang: string
}

export function formatShareMessage(data: ShareData): string {
  const { quote, client, profile, pdfUrl, lang } = data
  const greet = lang === "es" ? "Hola" : "Hello"
  const validUntilLabel = lang === "es" ? "Válida hasta" : "Valid until"
  const pdfLabel = lang === "es" ? "PDF completo" : "Complete PDF"
  const regards = lang === "es" ? "Saludos" : "Best regards"

  const message = `${greet} ${client.name},

${lang === "es" ? "Te envío la cotización" : "Please find attached the quote"} "${quote.title}" ${lang === "es" ? "por un total de" : "for a total of"} ${formatCurrency(quote.total, quote.currency)}.

${validUntilLabel}: ${quote.valid_until ? formatDate(quote.valid_until, lang) : "—"}

${pdfLabel}: ${pdfUrl}

${regards},
${profile.company_name}`

  return message
}

export function sanitizeWhatsAppPhone(phone: string): string {
  return phone.replace(/\D/g, "")
}

export function formatWhatsAppUrl(phone: string, message: string): string {
  const sanitized = sanitizeWhatsAppPhone(phone)
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${sanitized}?text=${encoded}`
}

export function formatMailtoUrl(email: string, subject: string, body: string): string {
  const encodedSubject = encodeURIComponent(subject)
  const encodedBody = encodeURIComponent(body)
  return `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`
}
