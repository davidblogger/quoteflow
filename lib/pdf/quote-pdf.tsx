import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.woff2",
      fontWeight: 600,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Inter",
    fontSize: 10,
    color: "#111827",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  titleSection: {
    flexDirection: "column",
  },
  label: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#6b7280",
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 600,
    color: "#111827",
    marginTop: 4,
  },
  companySection: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  companyName: {
    fontSize: 14,
    fontWeight: 600,
    color: "#111827",
  },
  companyDetail: {
    fontSize: 8,
    color: "#4b5563",
    marginTop: 2,
  },
  infoGrid: {
    flexDirection: "row",
    marginBottom: 30,
    gap: 40,
  },
  infoBlock: {
    flexDirection: "column",
  },
  infoLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#6b7280",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 11,
    fontWeight: 600,
    color: "#111827",
  },
  infoSubValue: {
    fontSize: 8,
    color: "#4b5563",
    marginTop: 1,
  },
  table: {
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableHeaderCell: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#6b7280",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingVertical: 8,
  },
  col1: { width: "50%" },
  col2: { width: "15%", textAlign: "right" },
  col3: { width: "18%", textAlign: "right" },
  col4: { width: "17%", textAlign: "right", fontWeight: 600 },
  cell: {
    fontSize: 10,
    color: "#1f2937",
  },
  totalsSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 30,
  },
  totalsBox: {
    width: 180,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  totalsLabel: {
    fontSize: 10,
    color: "#374151",
  },
  totalsValue: {
    fontSize: 10,
    color: "#374151",
  },
  totalsFinalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#d1d5db",
    marginTop: 4,
  },
  totalsFinalLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "#111827",
  },
  totalsFinalValue: {
    fontSize: 12,
    fontWeight: 600,
    color: "#111827",
  },
  notes: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  notesLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#6b7280",
    marginBottom: 6,
  },
  notesText: {
    fontSize: 9,
    color: "#374151",
    lineHeight: 1.5,
  },
});

type QuoteItem = {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
};

type Quote = {
  title: string;
  currency: string;
  tax_rate: number;
  subtotal: number;
  total: number;
  valid_until: string | null;
  notes: string | null;
  created_at: string;
};

type Client = {
  name: string;
  company: string | null;
  email: string | null;
};

type Profile = {
  company_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
};

type Copy = {
  quoteLabel: string;
  preparedFor: string;
  issueDate: string;
  validUntil: string;
  table: {
    description: string;
    quantity: string;
    unitPrice: string;
    subtotal: string;
  };
  totals: {
    subtotal: string;
    tax: string;
    total: string;
  };
  noItems: string;
};

type Props = {
  quote: Quote;
  client: Client | null;
  profile: Profile | null;
  items: QuoteItem[];
  copy: Copy;
  currencyFormatter: Intl.NumberFormat;
  issuedAt: string;
  validUntil: string | null;
};

export function QuotePdfDocument({
  quote,
  client,
  profile,
  items,
  copy,
  currencyFormatter,
  issuedAt,
  validUntil,
}: Props) {
  const taxAmount = Number(quote.subtotal) * (Number(quote.tax_rate) / 100);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Text style={styles.label}>{copy.quoteLabel}</Text>
            <Text style={styles.title}>{quote.title}</Text>
          </View>
          <View style={styles.companySection}>
            <Text style={styles.companyName}>
              {profile?.company_name ?? "QuoteFlow"}
            </Text>
            {profile?.email && (
              <Text style={styles.companyDetail}>{profile.email}</Text>
            )}
            {profile?.phone && (
              <Text style={styles.companyDetail}>{profile.phone}</Text>
            )}
            {profile?.address && (
              <Text style={styles.companyDetail}>{profile.address}</Text>
            )}
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>{copy.preparedFor}</Text>
            <Text style={styles.infoValue}>{client?.name ?? "—"}</Text>
            {client?.company && (
              <Text style={styles.infoSubValue}>{client.company}</Text>
            )}
            {client?.email && (
              <Text style={styles.infoSubValue}>{client.email}</Text>
            )}
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>{copy.issueDate}</Text>
            <Text style={styles.infoValue}>{issuedAt}</Text>
            {validUntil && (
              <>
                <Text style={[styles.infoLabel, { marginTop: 8 }]}>
                  {copy.validUntil}
                </Text>
                <Text style={styles.infoSubValue}>{validUntil}</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.col1]}>
              {copy.table.description}
            </Text>
            <Text style={[styles.tableHeaderCell, styles.col2]}>
              {copy.table.quantity}
            </Text>
            <Text style={[styles.tableHeaderCell, styles.col3]}>
              {copy.table.unitPrice}
            </Text>
            <Text style={[styles.tableHeaderCell, styles.col4]}>
              {copy.table.subtotal}
            </Text>
          </View>

          {items.length === 0 ? (
            <Text style={{ textAlign: "center", color: "#6b7280", padding: 20 }}>
              {copy.noItems}
            </Text>
          ) : (
            items.map((item) => {
              const lineSubtotal =
                Number(item.quantity) * Number(item.unit_price);
              return (
                <View key={item.id} style={styles.tableRow}>
                  <View style={styles.col1}>
                    <Text style={styles.cell}>{item.description}</Text>
                  </View>
                  <View style={styles.col2}>
                    <Text style={styles.cell}>{Number(item.quantity)}</Text>
                  </View>
                  <View style={styles.col3}>
                    <Text style={styles.cell}>
                      {currencyFormatter.format(Number(item.unit_price))}
                    </Text>
                  </View>
                  <View style={styles.col4}>
                    <Text style={styles.cell}>
                      {currencyFormatter.format(lineSubtotal)}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>{copy.totals.subtotal}</Text>
              <Text style={styles.totalsValue}>
                {currencyFormatter.format(Number(quote.subtotal))}
              </Text>
            </View>
            {Number(quote.tax_rate) > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>
                  {copy.totals.tax} ({quote.tax_rate}%)
                </Text>
                <Text style={styles.totalsValue}>
                  {currencyFormatter.format(taxAmount)}
                </Text>
              </View>
            )}
            <View style={styles.totalsFinalRow}>
              <Text style={styles.totalsFinalLabel}>{copy.totals.total}</Text>
              <Text style={styles.totalsFinalValue}>
                {currencyFormatter.format(Number(quote.total))}
              </Text>
            </View>
          </View>
        </View>

        {quote.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesLabel}>{copy.table.description}</Text>
            <Text style={styles.notesText}>{quote.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
