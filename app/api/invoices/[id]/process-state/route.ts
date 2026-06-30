import {
  type InvoiceProcessState,
  updateInvoiceProcessState,
} from "../../../../lib/invoiceStore";

const validStates = new Set<InvoiceProcessState>([
  "pending",
  "processing",
  "sent",
]);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await request.json()) as { nextState?: string };
  const nextState = body.nextState as InvoiceProcessState | undefined;

  if (!nextState || !validStates.has(nextState)) {
    return Response.json(
      { message: "Estado de proceso no valido." },
      { status: 400 },
    );
  }

  const invoice = await updateInvoiceProcessState(id, nextState);

  if (!invoice) {
    return Response.json(
      { message: "Factura no encontrada." },
      { status: 404 },
    );
  }

  return Response.json({ invoice });
}
