"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  updateQuoteItemAction,
  type EditItemFormState,
} from "./actions";
import type { QuoteItem } from "@/lib/types/quote-item";
import { AlertCircleIcon } from "@/app/components/icons/Icons";

type EditItemFormProps = {
  item: QuoteItem;
  quoteId: string;
  lang: string;
  cancelHref: string;
  copy: {
    title: string;
    hint: string;
    fields: {
      description: string;
      descriptionPlaceholder: string;
      quantity: string;
      unitPrice: string;
    };
    saveChanges: string;
    saving: string;
    cancel: string;
    errors: {
      required: string;
      invalidNumber: string;
      generic: string;
    };
  };
};

const initialState: EditItemFormState = { ok: false, message: "idle" };

export function EditItemForm({
  item,
  quoteId,
  lang,
  cancelHref,
  copy,
}: EditItemFormProps) {
  const [state, formAction] = useActionState(updateQuoteItemAction, initialState);
  const fe = state.fieldErrors ?? {};

  return (
    <form
      action={formAction}
      className="mt-5 flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.02 p-4"
      noValidate
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-white/75">
          {copy.title}
        </h3>
        <span className="text-[11px] text-white/45">{copy.hint}</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <input
          name="description"
          type="text"
          required
          defaultValue={item.description}
          placeholder={copy.fields.descriptionPlaceholder}
          aria-label={copy.fields.description}
          aria-invalid={Boolean(fe.description)}
          className={`h-11 rounded-xl border bg-white/[0.03] px-4 text-sm text-white placeholder:text-white/35 transition-colors focus:outline-none focus:bg-white/[0.05] ${
            fe.description
              ? "border-danger/50 focus:border-danger"
              : "border-white/10 focus:border-white/25"
          }`}
        />
        {fe.description && (
          <span className="flex items-center gap-1 text-xs text-danger">
            <AlertCircleIcon className="size-3" />
            {copy.errors.required}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-[7rem_10rem_auto_auto] sm:items-end">
        <NumberField
          name="quantity"
          label={copy.fields.quantity}
          defaultValue={String(Number(item.quantity))}
          step="0.01"
          min="0"
          error={fe.quantity ? copy.errors.invalidNumber : undefined}
        />
        <NumberField
          name="unitPrice"
          label={copy.fields.unitPrice}
          defaultValue={String(Number(item.unit_price))}
          step="0.01"
          min="0"
          error={fe.unit_price ? copy.errors.invalidNumber : undefined}
        />
        <div className="flex items-end col-span-2 sm:col-span-1">
          <SubmitButton idleLabel={copy.saveChanges} pendingLabel={copy.saving} />
        </div>
        <div className="flex items-end col-span-2 sm:col-span-1">
          <a
            href={cancelHref}
            className="inline-flex h-11 w-full items-center justify-center rounded-full px-5 text-sm font-medium text-white/65 transition-colors hover:text-white sm:w-auto"
          >
            {copy.cancel}
          </a>
        </div>
      </div>

      {state.message === "error" && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger"
        >
          <AlertCircleIcon className="size-3.5 shrink-0" />
          {copy.errors.generic}
        </p>
      )}

      <input type="hidden" name="quoteId" value={quoteId} />
      <input type="hidden" name="itemId" value={item.id} />
      <input type="hidden" name="lang" value={lang} />
    </form>
  );
}

function NumberField({
  name,
  label,
  defaultValue,
  step,
  min,
  error,
}: {
  name: string;
  label: string;
  defaultValue: string;
  step?: string;
  min?: string;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={name}
        className="text-xs font-medium uppercase tracking-wider text-white/55"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="number"
        step={step}
        min={min}
        defaultValue={defaultValue}
        aria-invalid={Boolean(error)}
        className={`h-11 rounded-xl border bg-white/[0.03] px-4 text-sm text-white transition-colors focus:outline-none focus:bg-white/[0.05] ${
          error
            ? "border-danger/50 focus:border-danger"
            : "border-white/10 focus:border-white/25"
        }`}
      />
      {error && (
        <span className="flex items-center gap-1 text-xs text-danger">
          <AlertCircleIcon className="size-3" />
          {error}
        </span>
      )}
    </div>
  );
}

function SubmitButton({
  idleLabel,
  pendingLabel,
}: {
  idleLabel: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full gradient-accent px-5 text-sm font-medium text-white shadow-[0_10px_30px_-10px_rgba(124,140,255,0.55)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_14px_40px_-10px_rgba(124,140,255,0.75)] disabled:opacity-50 disabled:pointer-events-none sm:w-auto"
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}