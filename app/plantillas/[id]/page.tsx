import { notFound } from "next/navigation";
import InvoiceTemplatePage from "../../components/InvoiceTemplatePage";
import invoiceLines from "../../components/invoice_lines.json";
import { findInvoice } from "../../lib/invoiceStore";

type TemplateMode = "pre" | "post";

function parseMode(mode: string | string[] | undefined): TemplateMode {
  return mode === "post" ? "post" : "pre";
}

export default async function InvoiceTemplateRoute({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string | string[] }>;
}) {
  const { id } = await params;
  const { mode } = await searchParams;
  const invoice = await findInvoice(id);

  if (!invoice) {
    notFound();
  }

  const lines = invoiceLines.filter((line) =>
    invoice.lineItemIds.includes(line.lineItemId),
  );

  return (
    <InvoiceTemplatePage
      invoice={invoice}
      lines={lines}
      initialMode={parseMode(mode)}
    />
  );
}
