"use client";

import { useEffect, useState } from "react";

export type InvoiceProcessState = "pending" | "processing" | "sent";

const STORAGE_KEY = "verifactu_invoice_process_states";
const CHANGE_EVENT = "verifactu_invoice_process_state_change";

type ProcessStateMap = Record<string, InvoiceProcessState>;

export const invoiceProcessStateOptions: Array<{
  value: InvoiceProcessState;
  label: string;
}> = [
  { value: "pending", label: "Facturas pre-verifactu" },
  { value: "processing", label: "Proceso VeriFactu" },
  { value: "sent", label: "Facturas post-verifactu" },
];

function readStoredStates(): ProcessStateMap {
  if (typeof window === "undefined") {
    return {};
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return {};
  }

  try {
    return JSON.parse(rawValue) as ProcessStateMap;
  } catch {
    return {};
  }
}

function writeStoredStates(states: ProcessStateMap) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useInvoiceProcessStates() {
  const [states, setStates] = useState<ProcessStateMap>({});

  useEffect(() => {
    const syncStates = () => setStates(readStoredStates());

    syncStates();
    window.addEventListener("storage", syncStates);
    window.addEventListener(CHANGE_EVENT, syncStates);

    return () => {
      window.removeEventListener("storage", syncStates);
      window.removeEventListener(CHANGE_EVENT, syncStates);
    };
  }, []);

  function setInvoiceState(
    invoiceId: string,
    nextState: InvoiceProcessState,
  ) {
    const nextStates = {
      ...readStoredStates(),
      [invoiceId]: nextState,
    };

    setStates(nextStates);
    writeStoredStates(nextStates);
  }

  return {
    getInvoiceState: (
      invoiceId: string,
      initialState: InvoiceProcessState,
    ) => states[invoiceId] ?? initialState,
    setInvoiceState,
  };
}
