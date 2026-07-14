import { listItems } from "@/lib/queries/quote-items";
import { AddItemForm } from "./add-item-form";
import { DeleteItemButton } from "./delete-item-button";

type ItemsSectionProps = {
  quoteId: string;
  lang: string;
  currency: string;
  copy: {
    table: {
      description: string;
      quantity: string;
      unitPrice: string;
      subtotal: string;
      remove: string;
    };
    empty: string;
    addTitle: string;
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
    deleteConfirm: string;
  };
};

export async function ItemsSection({
  quoteId,
  lang,
  currency,
  copy,
}: ItemsSectionProps) {
  const items = await listItems(quoteId);
  const formatter = new Intl.NumberFormat(lang, {
    style: "currency",
    currency,
  });

  return (
    <section className="glass rounded-2xl p-5 lg:col-span-2">
      <h2 className="mb-4 text-sm font-semibold text-white">
        {/* Using addTitle as heading so we can give the section a label */}
        <span className="sr-only">{copy.addTitle}</span>
      </h2>

      {items.length === 0 ? (
        <p className="mb-5 rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/55">
          {copy.empty}
        </p>
      ) : (
        <div className="mb-5 overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-white/40">
                <th className="px-4 py-2.5 font-medium">{copy.table.description}</th>
                <th className="px-4 py-2.5 text-right font-medium">
                  {copy.table.quantity}
                </th>
                <th className="px-4 py-2.5 text-right font-medium">
                  {copy.table.unitPrice}
                </th>
                <th className="px-4 py-2.5 text-right font-medium">
                  {copy.table.subtotal}
                </th>
                <th className="px-2 py-2.5" aria-label={copy.table.remove}></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.map((it) => {
                const lineSubtotal = Number(it.quantity) * Number(it.unit_price);
                return (
                  <tr key={it.id} className="text-white/85">
                    <td className="max-w-xs px-4 py-3 align-top">
                      <span className="whitespace-pre-wrap text-sm">
                        {it.description}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right align-top tabular-nums text-white/75">
                      {Number(it.quantity)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right align-top tabular-nums text-white/75">
                      {formatter.format(Number(it.unit_price))}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right align-top tabular-nums font-medium text-white">
                      {formatter.format(lineSubtotal)}
                    </td>
                    <td className="px-2 py-3 text-right align-top">
                      <DeleteItemButton
                        lang={lang}
                        quoteId={quoteId}
                        itemId={it.id}
                        label={copy.table.remove}
                        confirmMessage={copy.deleteConfirm}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AddItemForm quoteId={quoteId} lang={lang} copy={copy} />
    </section>
  );
}