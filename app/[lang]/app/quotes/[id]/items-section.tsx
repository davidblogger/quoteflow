import { listItems } from "@/lib/queries/quote-items";
import { AddItemForm } from "./add-item-form";
import { DeleteItemButton } from "./delete-item-button";
import { EditItemForm } from "./edit-item-form";
import { EditItemLink } from "./edit-item-link";
import type { QuoteItem } from "@/lib/types/quote-item";

type ItemsSectionProps = {
  quoteId: string;
  lang: string;
  currency: string;
  editingItemId: string | null;
  copy: ItemsCopy;
};

type ItemsCopy = {
  table: {
    description: string;
    quantity: string;
    unitPrice: string;
    subtotal: string;
    remove: string;
    edit: string;
  };
  empty: string;
  addTitle: string;
  title: string;
  hint: string;
  fields: {
    description: string;
    descriptionPlaceholder: string;
    quantity: string;
    unitPrice: string;
  };
  submit: string;
  submitting: string;
  saveChanges: string;
  saving: string;
  cancel: string;
  errors: {
    required: string;
    invalidNumber: string;
    generic: string;
  };
  deleteConfirm: string;
};

export async function ItemsSection({
  quoteId,
  lang,
  currency,
  editingItemId,
  copy,
}: ItemsSectionProps) {
  const items = await listItems(quoteId);
  const formatter = new Intl.NumberFormat(lang, {
    style: "currency",
    currency,
  });

  const editingItem =
    editingItemId ? items.find((it) => it.id === editingItemId) ?? null : null;

  return (
    <section className="glass rounded-2xl p-5 lg:col-span-2">
      {items.length === 0 && !editingItem ? (
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
                <th
                  className="px-2 py-2.5"
                  aria-label={copy.table.edit + " " + copy.table.remove}
                ></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.map((it) => (
                <ItemRow
                  key={it.id}
                  item={it}
                  quoteId={quoteId}
                  lang={lang}
                  formatter={formatter}
                  active={editingItemId === it.id}
                  copy={copy}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingItem && (
        <EditItemForm
          item={editingItem}
          quoteId={quoteId}
          lang={lang}
          cancelHref={`/${lang}/app/quotes/${quoteId}`}
          copy={copy}
        />
      )}

      {!editingItem && <AddItemForm quoteId={quoteId} lang={lang} copy={copy} />}
    </section>
  );
}

function ItemRow({
  item,
  quoteId,
  lang,
  formatter,
  active,
  copy,
}: {
  item: QuoteItem;
  quoteId: string;
  lang: string;
  formatter: Intl.NumberFormat;
  active: boolean;
  copy: ItemsCopy;
}) {
  const lineSubtotal = Number(item.quantity) * Number(item.unit_price);
  const editHref = `/${lang}/app/quotes/${quoteId}?edit=${item.id}`;
  return (
    <tr className={active ? "bg-white/[0.03] text-white/85" : "text-white/85"}>
      <td className="max-w-xs px-4 py-3 align-top">
        <span className="whitespace-pre-wrap text-sm">{item.description}</span>
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-right align-top tabular-nums text-white/75">
        {Number(item.quantity)}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-right align-top tabular-nums text-white/75">
        {formatter.format(Number(item.unit_price))}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-right align-top tabular-nums font-medium text-white">
        {formatter.format(lineSubtotal)}
      </td>
      <td className="px-2 py-3 text-right align-top">
        <div className="inline-flex items-center gap-0.5">
          <EditItemLink href={editHref} label={copy.table.edit} active={active} />
          <DeleteItemButton
            lang={lang}
            quoteId={quoteId}
            itemId={item.id}
            label={copy.table.remove}
            confirmMessage={copy.deleteConfirm}
          />
        </div>
      </td>
    </tr>
  );
}