"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { InvoiceProcessState } from "../../lib/invoiceStore";

export type InvoiceStatus = InvoiceProcessState;

type InvoiceTableProps = {
  title: string;
  description: string;
  status: InvoiceStatus;
  basePath: "/facturas/pending" | "/facturas/sent";
};

type InvoiceRow = {
  internalInvoiceId: string;
  invoiceSeries: string;
  invoiceNumber: number;
  invoice_current_process_state: InvoiceStatus;
  issueDate: string;
  recipientName: string;
  recipientCountry: string;
  totalAmount: number;
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

export default function InvoiceTable({
  title,
  description,
  status,
  basePath,
}: InvoiceTableProps) {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadInvoices() {
      setIsLoading(true);
      const response = await fetch("/api/invoices", { cache: "no-store" });
      const body = (await response.json()) as { invoices: InvoiceRow[] };

      if (isMounted) {
        setInvoices(body.invoices);
        setIsLoading(false);
      }
    }

    loadInvoices();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredInvoices = invoices.filter(
    (invoice) => invoice.invoice_current_process_state === status,
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Factura</th>
                <th className="px-4 py-3 font-semibold">Destinatario</th>
                <th className="px-4 py-3 font-semibold">Emision</th>
                <th className="px-4 py-3 font-semibold">Pais</th>
                <th className="px-4 py-3 text-right font-semibold">Importe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((invoice) => (
                <tr
                  key={invoice.internalInvoiceId}
                  className="cursor-pointer hover:bg-slate-50"
                >
                  <td className="p-0" colSpan={5}>
                    <Link
                      href={`${basePath}/${invoice.internalInvoiceId}`}
                      className="grid cursor-pointer grid-cols-[1.1fr_1.5fr_1fr_1fr_1fr] items-center gap-0 px-4 py-4 text-slate-700"
                    >
                      <span className="font-medium text-slate-950">
                        {formatInvoiceNumber(
                          invoice.invoiceSeries,
                          invoice.invoiceNumber,
                        )}
                      </span>
                      <span>{invoice.recipientName}</span>
                      <span>{dateFormatter.format(new Date(invoice.issueDate))}</span>
                      <span>{invoice.recipientCountry}</span>
                      <span className="text-right font-semibold text-slate-950">
                        {currencyFormatter.format(invoice.totalAmount)}
                      </span>
                    </Link>
                  </td>
                </tr>
              ))}
              {!isLoading && filteredInvoices.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-500" colSpan={5}>
                    No hay facturas en este estado.
                  </td>
                </tr>
              ) : null}
              {isLoading ? (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-500" colSpan={5}>
                    Cargando facturas...
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
