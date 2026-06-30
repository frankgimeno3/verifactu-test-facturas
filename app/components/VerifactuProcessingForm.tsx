"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { VerifactuData } from "../lib/invoiceStore";

type VerifactuProcessingFormProps = {
  invoiceId: string;
  initialVerifactu?: VerifactuData;
};

type CheckResult = {
  ok: boolean;
  messages: string[];
};

const emptyVerifactu: VerifactuData = {
  qrUrl: "",
  qrRequired: true,
  visibleLegend: "VERI*FACTU",
  recordType: "RegistroAlta",
  recordGenerationDateTime: "",
  previousRecord: {
    previousIssuerNif: "",
    previousInvoiceSeriesNumber: "",
    previousIssueDate: "",
    previousHash: "",
  },
  hash: "",
  systemInfo: {
    softwareName: "",
    softwareId: "",
    softwareVersion: "",
    installationNumber: "",
    producerName: "",
    producerNif: "",
  },
};

function createInitialState(initialVerifactu?: VerifactuData): VerifactuData {
  return {
    ...emptyVerifactu,
    ...initialVerifactu,
    previousRecord: {
      ...emptyVerifactu.previousRecord,
      ...initialVerifactu?.previousRecord,
    },
    systemInfo: {
      ...emptyVerifactu.systemInfo,
      ...initialVerifactu?.systemInfo,
    },
  };
}

function validateVerifactuData(verifactu: VerifactuData): CheckResult {
  const messages: string[] = [];

  if (verifactu.visibleLegend !== "VERI*FACTU") {
    messages.push("La leyenda visible debe ser VERI*FACTU.");
  }

  if (!verifactu.qrUrl.trim()) {
    messages.push("Falta la URL del QR VeriFactu.");
  }

  if (!verifactu.recordType.trim()) {
    messages.push("Falta el tipo de registro.");
  }

  if (!verifactu.recordGenerationDateTime.trim()) {
    messages.push("Falta la fecha y hora de generacion del registro.");
  }

  if (!verifactu.hash.trim()) {
    messages.push("Falta el hash del registro.");
  }

  if (!verifactu.previousRecord.previousHash.trim()) {
    messages.push("Falta el hash del registro anterior.");
  }

  if (!verifactu.systemInfo.softwareName.trim()) {
    messages.push("Falta el nombre del software.");
  }

  if (!verifactu.systemInfo.softwareId.trim()) {
    messages.push("Falta el identificador del software.");
  }

  if (!verifactu.systemInfo.softwareVersion.trim()) {
    messages.push("Falta la version del software.");
  }

  if (!verifactu.systemInfo.producerNif.trim()) {
    messages.push("Falta el NIF del productor del software.");
  }

  if (messages.length === 0) {
    messages.push("Comprobacion correcta. La factura esta lista para enviar.");
  }

  return {
    ok: messages.length === 1 && messages[0].startsWith("Comprobacion correcta"),
    messages,
  };
}

export default function VerifactuProcessingForm({
  invoiceId,
  initialVerifactu,
}: VerifactuProcessingFormProps) {
  const router = useRouter();
  const [verifactu, setVerifactu] = useState(() =>
    createInitialState(initialVerifactu),
  );
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  async function persist(nextState?: "sent") {
    const response = await fetch(`/api/invoices/${invoiceId}/verifactu`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        verifactu,
        nextState,
      }),
    });

    if (!response.ok) {
      const body = (await response.json()) as { message?: string };
      throw new Error(body.message ?? "No se pudieron guardar los datos.");
    }
  }

  async function handleSave() {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      await persist();
      setSaveMessage("Cambios guardados. La factura permanece en proceso.");
      router.refresh();
    } catch (error) {
      setSaveMessage(
        error instanceof Error ? error.message : "No se pudieron guardar los datos.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleCheckAndSend() {
    setCheckResult(validateVerifactuData(verifactu));
    setIsModalOpen(true);
  }

  async function handleConfirmAndSend() {
    setIsSending(true);

    try {
      await persist("sent");
      router.push(`/facturas/sent/${invoiceId}`);
      router.refresh();
    } catch (error) {
      setCheckResult({
        ok: false,
        messages: [
          error instanceof Error
            ? error.message
            : "No se pudo enviar la factura.",
        ],
      });
      setIsSending(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Proceso VeriFactu</p>
          <h2 className="text-lg font-semibold text-slate-950">
            Datos especificos para el registro de alta
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCheckAndSend}
            className="h-10 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Comprobar y enviar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="h-10 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-100 disabled:cursor-wait disabled:text-slate-400"
          >
            {isSaving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>

      <div className="grid gap-5 p-6 lg:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
          URL del QR
          <input
            value={verifactu.qrUrl}
            onChange={(event) =>
              setVerifactu({ ...verifactu, qrUrl: event.target.value })
            }
            className="h-10 rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-slate-950"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
          Leyenda visible
          <input
            value={verifactu.visibleLegend}
            onChange={(event) =>
              setVerifactu({ ...verifactu, visibleLegend: event.target.value })
            }
            className="h-10 rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-slate-950"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
          Tipo de registro
          <input
            value={verifactu.recordType}
            onChange={(event) =>
              setVerifactu({ ...verifactu, recordType: event.target.value })
            }
            className="h-10 rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-slate-950"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
          Fecha y hora de generacion
          <input
            value={verifactu.recordGenerationDateTime}
            onChange={(event) =>
              setVerifactu({
                ...verifactu,
                recordGenerationDateTime: event.target.value,
              })
            }
            placeholder="2026-06-26T12:34:56+02:00"
            className="h-10 rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-slate-950"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
          Hash anterior
          <input
            value={verifactu.previousRecord.previousHash}
            onChange={(event) =>
              setVerifactu({
                ...verifactu,
                previousRecord: {
                  ...verifactu.previousRecord,
                  previousHash: event.target.value,
                },
              })
            }
            className="h-10 rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-slate-950"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
          Hash registro
          <input
            value={verifactu.hash}
            onChange={(event) =>
              setVerifactu({ ...verifactu, hash: event.target.value })
            }
            className="h-10 rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-slate-950"
          />
        </label>
      </div>

      <div className="grid gap-5 border-t border-slate-100 p-6 lg:grid-cols-3">
        {[
          ["softwareName", "Software"],
          ["softwareId", "ID software"],
          ["softwareVersion", "Version"],
          ["installationNumber", "Instalacion"],
          ["producerName", "Productor"],
          ["producerNif", "NIF productor"],
        ].map(([field, label]) => (
          <label
            key={field}
            className="flex flex-col gap-2 text-sm font-medium text-slate-600"
          >
            {label}
            <input
              value={verifactu.systemInfo[field as keyof VerifactuData["systemInfo"]]}
              onChange={(event) =>
                setVerifactu({
                  ...verifactu,
                  systemInfo: {
                    ...verifactu.systemInfo,
                    [field]: event.target.value,
                  },
                })
              }
              className="h-10 rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-slate-950"
            />
          </label>
        ))}
      </div>

      {saveMessage ? (
        <p className="border-t border-slate-100 px-6 py-4 text-sm text-slate-600">
          {saveMessage}
        </p>
      ) : null}

      {isModalOpen && checkResult ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4"
          role="dialog"
          aria-modal="true"
        >
          <section className="w-full max-w-xl rounded-lg bg-white shadow-xl">
            <div className="border-b border-slate-200 px-5 py-4">
              <h3 className="text-lg font-semibold text-slate-950">
                Comprobacion VeriFactu
              </h3>
            </div>
            <div className="px-5 py-5">
              <p
                className={`text-sm font-semibold ${
                  checkResult.ok ? "text-emerald-700" : "text-red-700"
                }`}
              >
                {checkResult.ok ? "Todo OK" : "Se encontraron errores"}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                {checkResult.messages.map((message) => (
                  <li key={message} className="rounded-md bg-slate-50 p-3">
                    {message}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-9 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancelar
              </button>
              {checkResult.ok ? (
                <button
                  type="button"
                  onClick={handleConfirmAndSend}
                  disabled={isSending}
                  className="h-9 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-wait disabled:bg-slate-500"
                >
                  {isSending ? "Enviando..." : "Confirmar y enviar"}
                </button>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}
