import InvoiceTable from "./InvoiceTable";

export default function ProcessingInvoicesScreen() {
  return (
    <InvoiceTable
      title="En proceso"
      description="Facturas que se están validando o transmitiendo."
      status="processing"
      basePath="/facturas/processing"
    />
  );
}
