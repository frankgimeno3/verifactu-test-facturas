import { readInvoices } from "../../lib/invoiceStore";

export async function GET() {
  const invoices = await readInvoices();

  return Response.json({ invoices });
}
