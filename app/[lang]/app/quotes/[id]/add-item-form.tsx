"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { addQuoteItemAction, type AddItemFormState } from "./actions";
import { AlertCircleIcon, PlusIcon } from "@/app/components/icons/Icons";

type AddItemFormProps = {
  quoteId: string;
  lang: string;
  copy: {
    fields: {
      description: string;
      descriptionPlaceholder: string;
      quantity: string;
      unitPrice: string;
    };
    submit: string;
    submitting: string;
    errors: {
      required: string;
      invalidNumber: string;
      generic: string;
    };
  };
};

const initialState: AddItemFormState = { ok: false, message: "idle" };

export function AddItemForm({ quoteId, lang, copy }: AddItemFormProps) {
  const [state, formAction] = useActionState(addQuoteItemAction, initialState);
  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-3" noValidate>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-white/55">
        {copy.submit}
      </h3>

      <div className="flex flex-col gap-1.5">
        <input
          name="description"
          type="text"
          required
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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-[7rem_10rem_auto] sm:items-end">
        <NumberField
          name="quantity"
          label={copy.fields.quantity}
          defaultValue="1"
          step="0.01"
          min="0"
          error={fe.quantity ? copy.errors.invalidNumber : undefined}
        />
        <NumberField
          name="unitPrice"
          label={copy.fields.unitPrice}
          defaultValue="0"
          step="0.01"
          min="0"
          error={fe.unit_price ? copy.errors.invalidNumber : undefined}
        />
        <div className="flex items-end col-span-2 sm:col-span-1">
          <SubmitButton idleLabel={copy.submit} pendingLabel={copy.submitting} />
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
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04 px-5 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-50 disabled:pointer-events-none sm:w-auto"
    >
      {!pending && <PlusIcon className="size-4" />}
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}