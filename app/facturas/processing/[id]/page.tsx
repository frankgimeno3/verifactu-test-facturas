import InvoiceDetail from "../../../components/InvoiceDetail";

export default async function ProcessingInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <InvoiceDetail id={id} />;
}
