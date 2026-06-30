import InvoiceTable from "./InvoiceTable";

export default function SentInvoicesScreen() {
  return (
    <InvoiceTable
      title="Facturas post-verifactu"
      description="Facturas con el proceso VeriFactu completado y listas para consulta."
      status="sent"
      basePath="/facturas/sent"
    />
  );
}
