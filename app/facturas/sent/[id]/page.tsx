import InvoiceDetail from "../../../components/InvoiceDetail";

export default async function SentInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <InvoiceDetail id={id} expectedState="sent" />;
}
