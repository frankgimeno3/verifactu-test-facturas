"use client";

import {
  invoiceProcessStateOptions,
  type InvoiceProcessState,
  useInvoiceProcessStates,
} from "./invoiceProcessState";

type InvoiceProcessSelectProps = {
  invoiceId: string;
  initialState: InvoiceProcessState;
};

export default function InvoiceProcessSelect({
  invoiceId,
  initialState,
}: InvoiceProcessSelectProps) {
  const { getInvoiceState, setInvoiceState } = useInvoiceProcessStates();
  const currentState = getInvoiceState(invoiceId, initialState);

  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
      Estado de proceso
      <select
        value={currentState}
        onChange={(event) =>
          setInvoiceState(invoiceId, event.target.value as InvoiceProcessState)
        }
        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-950 shadow-sm outline-none transition-colors hover:border-slate-400 focus:border-slate-950"
      >
        {invoiceProcessStateOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
