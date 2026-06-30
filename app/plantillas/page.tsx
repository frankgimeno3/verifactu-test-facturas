import InvoiceTemplatePage from "../components/InvoiceTemplatePage";
import invoiceLines from "../components/invoice_lines.json";
import { readInvoices } from "../lib/invoiceStore";

export default async function PlantillasPage() {
  const invoices = await readInvoices();
  const invoice = invoices[0];
  const lines = invoiceLines.filter((line) =>
    invoice.lineItemIds.includes(line.lineItemId),
  );

  return (
    <InvoiceTemplatePage
      invoice={invoice}
      lines={lines}
      initialMode="pre"
      allowModeSwitch
    />
  );
}
