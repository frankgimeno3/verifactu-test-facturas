import InvoiceTable from "./InvoiceTable";

export default function SentInvoicesScreen() {
  return (
    <InvoiceTable
      title="Facturas enviadas"
      description="Facturas ya comunicadas y listas para consulta."
      status="sent"
      basePath="/facturas/sent"
    />
  );
}
