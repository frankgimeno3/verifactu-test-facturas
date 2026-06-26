import InvoiceTable from "./InvoiceTable";

export default function PendingInvoicesScreen() {
  return (
    <InvoiceTable
      title="Facturas pre-verifactu"
      description="Facturas preparadas para revisión antes del envío VeriFactu."
      status="pending"
      basePath="/facturas/pending"
    />
  );
}
