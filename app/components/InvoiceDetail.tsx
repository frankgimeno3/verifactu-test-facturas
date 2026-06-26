import Link from "next/link";
import { notFound } from "next/navigation";
import InvoiceProcessSelect from "./InvoiceProcessSelect";
import invoices from "./invoice_data.json";
import invoiceLines from "./invoice_lines.json";
import type { InvoiceProcessState } from "./invoiceProcessState";

type InvoiceDetailProps = {
  id: string;
};

const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatInvoiceNumber(series: string, number: number) {
  return `${series}-${number.toString().padStart(6, "0")}`;
}

export default function InvoiceDetail({
  id,
}: InvoiceDetailProps) {
  const invoice = invoices.find((item) => item.internalInvoiceId === id);

  if (!invoice) {
    notFound();
  }

  const initialProcessState =
    invoice.invoice_current_process_state as InvoiceProcessState;
  const lines = invoiceLines.filter((line) =>
    invoice.lineItemIds.includes(line.lineItemId),
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-950">
          Volver al panel
        </Link>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Detalle de factura</p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-950">
                {formatInvoiceNumber(
                  invoice.invoiceSeries,
                  invoice.invoiceNumber,
                )}
              </h1>
              <p className="mt-2 text-slate-600">{invoice.recipientName}</p>
            </div>
            <div className="text-left sm:text-right">
              <InvoiceProcessSelect
                invoiceId={invoice.internalInvoiceId}
                initialState={initialProcessState}
              />
              <p className="mt-4 text-sm text-slate-500">Importe total</p>
              <p className="mt-1 text-2xl font-semibold">
                {currencyFormatter.format(invoice.totalAmount)}
              </p>
            </div>
          </div>

          <dl className="mt-6 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-3">
            <div>
              <dt className="text-sm font-medium text-slate-500">Fecha de emision</dt>
              <dd className="mt-1 text-slate-950">
                {dateFormatter.format(new Date(invoice.issueDate))}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">NIF emisor</dt>
              <dd className="mt-1 text-slate-950">{invoice.issuerNif}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">NIF destinatario</dt>
              <dd className="mt-1 text-slate-950">{invoice.recipientNif}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Pais</dt>
              <dd className="mt-1 text-slate-950">{invoice.recipientCountry}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Base imponible</dt>
              <dd className="mt-1 text-slate-950">
                {currencyFormatter.format(invoice.totalTaxableBase)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">IVA</dt>
              <dd className="mt-1 text-slate-950">
                {currencyFormatter.format(invoice.totalVatAmount)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Estado IVA</dt>
              <dd className="mt-1 text-slate-950">{invoice.vatStatus}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Tipo factura</dt>
              <dd className="mt-1 text-slate-950">{invoice.invoiceType}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Motivo exencion</dt>
              <dd className="mt-1 text-slate-950">
                {invoice.exemptionReason ?? "No aplica"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-lg font-semibold">Lineas de factura</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">ID linea</th>
                  <th className="px-4 py-3 font-semibold">Descripcion</th>
                  <th className="px-4 py-3 text-right font-semibold">Cantidad</th>
                  <th className="px-4 py-3 text-right font-semibold">Tarifa</th>
                  <th className="px-4 py-3 text-right font-semibold">Descuento</th>
                  <th className="px-4 py-3 text-right font-semibold">Base</th>
                  <th className="px-4 py-3 text-right font-semibold">IVA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lines.map((line) => (
                  <tr key={line.lineItemId}>
                    <td className="px-4 py-4 font-medium text-slate-950">
                      {line.lineItemId}
                    </td>
                    <td className="px-4 py-4 text-slate-700">{line.description}</td>
                    <td className="px-4 py-4 text-right">
                      {line.quantity}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {currencyFormatter.format(line.unitPriceWithoutTax)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {currencyFormatter.format(line.discountAmount)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {currencyFormatter.format(line.taxableBase)}
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-slate-950">
                      {line.vatRate}% · {currencyFormatter.format(line.vatAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
