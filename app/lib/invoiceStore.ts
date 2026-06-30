import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type InvoiceProcessState = "pending" | "processing" | "sent";

export type VerifactuData = {
  qrUrl: string;
  qrRequired: boolean;
  visibleLegend: string;
  recordType: string;
  recordGenerationDateTime: string;
  previousRecord: {
    previousIssuerNif: string;
    previousInvoiceSeriesNumber: string;
    previousIssueDate: string;
    previousHash: string;
  };
  hash: string;
  systemInfo: {
    softwareName: string;
    softwareId: string;
    softwareVersion: string;
    installationNumber: string;
    producerName: string;
    producerNif: string;
  };
};

export type InvoiceRecord = {
  internalInvoiceId: string;
  invoiceSeries: string;
  invoiceNumber: number;
  invoice_current_process_state: InvoiceProcessState;
  issueDate: string;
  operationDate: string | null;
  invoiceType: string;
  isRectifyingInvoice: boolean;
  rectifiedInvoices: unknown[];
  issuerName: string;
  issuerNif: string;
  recipientName: string;
  recipientCountry: string;
  recipientNif: string;
  lineItemIds: string[];
  taxBreakdown: Array<{
    taxType: string;
    vatRate: number;
    taxableBase: number;
    vatAmount: number;
  }>;
  totalTaxableBase: number;
  totalVatAmount: number;
  totalAmount: number;
  vatStatus: string;
  exemptionReason: string | null;
  reverseCharge: boolean;
  cashAccounting: boolean;
  selfBilling: boolean;
  verifactu?: VerifactuData;
};

const invoiceDataPath = path.join(
  process.cwd(),
  "app",
  "components",
  "invoice_data.json",
);

export async function readInvoices() {
  const rawInvoices = await readFile(invoiceDataPath, "utf8");

  return JSON.parse(rawInvoices) as InvoiceRecord[];
}

export async function writeInvoices(invoices: InvoiceRecord[]) {
  await writeFile(invoiceDataPath, `${JSON.stringify(invoices, null, 2)}\n`);
}

export async function findInvoice(invoiceId: string) {
  const invoices = await readInvoices();

  return invoices.find((invoice) => invoice.internalInvoiceId === invoiceId);
}

export async function updateInvoiceProcessState(
  invoiceId: string,
  nextState: InvoiceProcessState,
) {
  const invoices = await readInvoices();
  const invoiceIndex = invoices.findIndex(
    (invoice) => invoice.internalInvoiceId === invoiceId,
  );

  if (invoiceIndex === -1) {
    return null;
  }

  invoices[invoiceIndex] = {
    ...invoices[invoiceIndex],
    invoice_current_process_state: nextState,
  };

  await writeInvoices(invoices);

  return invoices[invoiceIndex];
}

export async function updateInvoiceVerifactu(
  invoiceId: string,
  verifactu: VerifactuData,
  nextState?: InvoiceProcessState,
) {
  const invoices = await readInvoices();
  const invoiceIndex = invoices.findIndex(
    (invoice) => invoice.internalInvoiceId === invoiceId,
  );

  if (invoiceIndex === -1) {
    return null;
  }

  invoices[invoiceIndex] = {
    ...invoices[invoiceIndex],
    ...(nextState ? { invoice_current_process_state: nextState } : {}),
    verifactu,
  };

  await writeInvoices(invoices);

  return invoices[invoiceIndex];
}
