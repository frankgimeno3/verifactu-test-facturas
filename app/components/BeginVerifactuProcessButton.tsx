"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type BeginVerifactuProcessButtonProps = {
  invoiceId: string;
};

function wait(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

export default function BeginVerifactuProcessButton({
  invoiceId,
}: BeginVerifactuProcessButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleClick() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [response] = await Promise.all([
        fetch(`/api/invoices/${invoiceId}/process-state`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nextState: "processing" }),
        }),
        wait(2500),
      ]);

      if (!response.ok) {
        const body = (await response.json()) as { message?: string };
        throw new Error(body.message ?? "No se pudo comenzar el proceso.");
      }

      router.push(`/facturas/processing/${invoiceId}`);
      router.refresh();
    } catch (error) {
      setIsLoading(false);
      setErrorMessage(
        error instanceof Error ? error.message : "No se pudo comenzar el proceso.",
      );
    }
  }

  return (
    <div className="flex flex-col items-start gap-3 sm:items-end">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-wait disabled:bg-slate-500"
      >
        {isLoading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        ) : null}
        <span>
          {isLoading ? "Iniciando proceso..." : "Comenzar proceso verifactu"}
        </span>
      </button>
      {errorMessage ? (
        <p className="max-w-xs text-sm text-red-600">{errorMessage}</p>
      ) : null}
    </div>
  );
}
