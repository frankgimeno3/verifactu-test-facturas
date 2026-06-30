import {
  type InvoiceProcessState,
  type VerifactuData,
  updateInvoiceVerifactu,
} from "../../../../lib/invoiceStore";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await request.json()) as {
    verifactu?: VerifactuData;
    nextState?: InvoiceProcessState;
  };

  if (!body.verifactu) {
    return Response.json(
      { message: "Faltan datos VeriFactu para guardar." },
      { status: 400 },
    );
  }

  const invoice = await updateInvoiceVerifactu(
    id,
    body.verifactu,
    body.nextState,
  );

  if (!invoice) {
    return Response.json(
      { message: "Factura no encontrada." },
      { status: 404 },
    );
  }

  return Response.json({ invoice });
}
