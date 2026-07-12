"use server";

export type QuoteRequestState = {
  ok: boolean;
  message: string;
  fieldErrors?: Partial<
    Record<"name" | "email" | "company" | "phone" | "service" | "message", string>
  >;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitQuoteRequest(
  _prev: QuoteRequestState | undefined,
  formData: FormData,
): Promise<QuoteRequestState> {
  const fields = {
    name: (formData.get("name") ?? "").toString().trim(),
    email: (formData.get("email") ?? "").toString().trim(),
    company: (formData.get("company") ?? "").toString().trim(),
    phone: (formData.get("phone") ?? "").toString().trim(),
    service: (formData.get("service") ?? "").toString().trim(),
    message: (formData.get("message") ?? "").toString().trim(),
  };

  const fieldErrors: QuoteRequestState["fieldErrors"] = {};

  if (!fields.name) fieldErrors.name = "required";
  if (!fields.email) fieldErrors.email = "required";
  else if (!EMAIL_RE.test(fields.email)) fieldErrors.email = "email";
  if (!fields.company) fieldErrors.company = "required";
  if (!fields.service) fieldErrors.service = "required";
  if (!fields.message) fieldErrors.message = "required";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      message: "invalid",
      fieldErrors,
    };
  }

  await new Promise((resolve) => setTimeout(resolve, 600));

  console.info("[QuoteFlow] New quote request", {
    ...fields,
    receivedAt: new Date().toISOString(),
  });

  return {
    ok: true,
    message: "success",
  };
}