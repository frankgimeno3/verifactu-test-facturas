"use client";

import Link from "next/link";
import {
  type ReactNode,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { InvoiceRecord } from "../lib/invoiceStore";

type InvoiceLine = {
  lineItemId: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPriceWithoutTax: number;
  discountAmount: number;
  taxableBase: number;
  vatRate: number;
  vatAmount: number;
};

type TemplateMode = "pre" | "post";
type TemplateDisplayMode = "data" | "variables";

type InvoiceTemplatePageProps = {
  invoice: InvoiceRecord;
  lines: InvoiceLine[];
  initialMode?: TemplateMode;
  allowModeSwitch?: boolean;
};

const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatInvoiceNumber(invoice: InvoiceRecord) {
  return `${invoice.invoiceSeries}-${invoice.invoiceNumber
    .toString()
    .padStart(6, "0")}`;
}

function variableToken(variableName: string) {
  return `{${variableName}}`;
}

function FitText({
  children,
  className = "",
  maxSize = 14,
  minSize = 8,
}: {
  children: ReactNode;
  className?: string;
  maxSize?: number;
  minSize?: number;
}) {
  const textRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState(maxSize);

  useLayoutEffect(() => {
    const textElement = textRef.current;
    const parentElement = textElement?.parentElement;

    if (!textElement || !parentElement) {
      return;
    }

    const fitParentElement = parentElement;
    const fitTextElement = textElement;

    function resizeText() {
      const availableWidth = fitParentElement.clientWidth;

      if (availableWidth <= 0) {
        return;
      }

      let nextSize = maxSize;
      fitTextElement.style.fontSize = `${nextSize}px`;

      while (nextSize > minSize && fitTextElement.scrollWidth > availableWidth) {
        nextSize -= 0.5;
        fitTextElement.style.fontSize = `${nextSize}px`;
      }

      setFontSize(nextSize);
    }

    resizeText();

    const resizeObserver = new ResizeObserver(resizeText);
    resizeObserver.observe(fitParentElement);

    return () => resizeObserver.disconnect();
  }, [children, maxSize, minSize]);

  return (
    <span
      ref={textRef}
      className={`inline-block max-w-full whitespace-nowrap align-baseline leading-tight ${className}`}
      style={{ fontSize }}
    >
      {children}
    </span>
  );
}

function FakeQr() {
  return (
    <div className="grid h-28 w-28 grid-cols-7 grid-rows-7 gap-1 bg-white p-2">
      {Array.from({ length: 49 }).map((_, index) => {
        const active =
          index % 2 === 0 ||
          [0, 1, 2, 7, 14, 35, 42, 43, 44, 6, 13, 20, 41, 48].includes(index);

        return (
          <span
            key={index}
            className={active ? "bg-slate-950" : "bg-white"}
          />
        );
      })}
    </div>
  );
}

export default function InvoiceTemplatePage({
  invoice,
  lines,
  initialMode = "pre",
  allowModeSwitch = false,
}: InvoiceTemplatePageProps) {
  const [mode, setMode] = useState<TemplateMode>(initialMode);
  const [displayMode, setDisplayMode] = useState<TemplateDisplayMode>("data");
  const templateTitle =
    mode === "pre" ? "Plantilla pre-VeriFactu" : "Plantilla post-VeriFactu";
  const taxRows = useMemo(() => invoice.taxBreakdown, [invoice.taxBreakdown]);
  const showVariableNames = displayMode === "variables";

  function showValue(
    value: string | number,
    variableName: string,
    options?: { maxSize?: number; minSize?: number },
  ) {
    return (
      <FitText maxSize={options?.maxSize} minSize={options?.minSize}>
        {showVariableNames ? variableToken(variableName) : value}
      </FitText>
    );
  }

  function showVariable(
    variableName: string,
    options?: { maxSize?: number; minSize?: number },
  ) {
    return (
      <FitText maxSize={options?.maxSize} minSize={options?.minSize}>
        {variableToken(variableName)}
      </FitText>
    );
  }

  function handleDownloadPdf() {
    window.print();
  }

  return (
    <main className="min-h-screen bg-slate-200 px-4 py-6 text-slate-950 print:bg-white print:p-0">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 print:hidden">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-950">
              Volver al panel
            </Link>
            <h1 className="mt-2 text-2xl font-semibold">Plantillas de factura</h1>
          </div>
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="h-10 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Descargar PDF
          </button>
        </div>

        {allowModeSwitch ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("pre")}
              className={`rounded-md border px-4 py-2 text-sm font-medium ${
                mode === "pre"
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-300 bg-white text-slate-700"
              }`}
            >
              Pre-verifactu
            </button>
            <button
              type="button"
              onClick={() => setMode("post")}
              className={`rounded-md border px-4 py-2 text-sm font-medium ${
                mode === "post"
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-300 bg-white text-slate-700"
              }`}
            >
              Post-verifactu
            </button>
          </div>
        ) : null}

        <div className="inline-grid w-full max-w-md grid-cols-2 rounded-md border border-slate-300 bg-white p-1 text-sm font-medium">
          <button
            type="button"
            onClick={() => setDisplayMode("data")}
            className={`h-9 rounded px-3 transition-colors ${
              displayMode === "data"
                ? "bg-slate-950 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Mostrar como dato
          </button>
          <button
            type="button"
            onClick={() => setDisplayMode("variables")}
            className={`h-9 rounded px-3 transition-colors ${
              displayMode === "variables"
                ? "bg-slate-950 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Mostrar como variables
          </button>
        </div>
      </div>

      <article className="mx-auto mt-5 min-h-[1122px] w-full max-w-[794px] bg-white p-10 shadow-xl print:mt-0 print:min-h-screen print:max-w-none print:p-8 print:shadow-none">
        <header className="flex items-start justify-between gap-6 border-b-2 border-slate-950 pb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              {templateTitle}
            </p>
            <h2 className="mt-2 text-3xl font-bold">Factura</h2>
            <p className="mt-2 text-sm text-slate-600">
              Numero{" "}
              {showVariableNames ? (
                <FitText>
                  {variableToken("invoiceSeries")}-{variableToken("invoiceNumber")}
                </FitText>
              ) : (
                formatInvoiceNumber(invoice)
              )}
            </p>
          </div>
          {mode === "post" ? (
            <div className="text-center">
              {showVariableNames ? (
                <div className="flex h-28 w-28 items-center justify-center border border-slate-300 bg-white p-2 text-center text-xs font-semibold text-slate-950">
                  <FitText maxSize={12} minSize={7}>
                    {variableToken("verifactu.qrUrl")}
                  </FitText>
                </div>
              ) : (
                <FakeQr />
              )}
              <p className="mt-2 text-sm font-bold">
                {showValue(
                  invoice.verifactu?.visibleLegend ?? "VERI*FACTU",
                  "verifactu.visibleLegend",
                )}
              </p>
              <p className="mt-1 max-w-36 text-xs text-slate-500">
                {showValue(
                  invoice.verifactu?.qrUrl ?? "Sin URL QR en JSON",
                  "verifactu.qrUrl",
                )}
              </p>
            </div>
          ) : (
            <div className="rounded border border-dashed border-slate-300 px-4 py-3 text-right text-xs text-slate-500">
              Sin registro VeriFactu
            </div>
          )}
        </header>

        <section className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-bold uppercase text-slate-500">Emisor</h3>
            <p className="mt-2 font-semibold">
              {showValue(invoice.issuerName, "issuerName")}
            </p>
            <p className="text-sm">NIF {showValue(invoice.issuerNif, "issuerNif")}</p>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase text-slate-500">Cliente</h3>
            <p className="mt-2 font-semibold">
              {showValue(invoice.recipientName, "recipientName")}
            </p>
            <p className="text-sm">
              NIF {showValue(invoice.recipientNif, "recipientNif")}
            </p>
            <p className="text-sm">
              Pais {showValue(invoice.recipientCountry, "recipientCountry")}
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-4 border border-slate-200 bg-slate-50 p-4 text-sm sm:grid-cols-3">
          <div>
            <p className="font-semibold text-slate-500">Fecha emision</p>
            <p>
              {showValue(
                dateFormatter.format(new Date(invoice.issueDate)),
                "issueDate",
              )}
            </p>
          </div>
          <div>
            <p className="font-semibold text-slate-500">Tipo factura</p>
            <p>{showValue(invoice.invoiceType, "invoiceType")}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-500">Estado IVA</p>
            <p>{showValue(invoice.vatStatus, "vatStatus")}</p>
          </div>
        </section>

        <section className="mt-8">
          <table className="w-full table-fixed border-collapse text-sm">
            <thead>
              <tr className="bg-slate-950 text-left text-white">
                <th className="w-[24%] border border-slate-950 px-3 py-2">
                  Concepto
                </th>
                <th className="w-[11%] border border-slate-950 px-3 py-2 text-right">
                  Cant.
                </th>
                <th className="w-[17%] border border-slate-950 px-3 py-2 text-right">
                  Precio
                </th>
                <th className="w-[17%] border border-slate-950 px-3 py-2 text-right">
                  Dto.
                </th>
                <th className="w-[16%] border border-slate-950 px-3 py-2 text-right">
                  Base
                </th>
                <th className="w-[15%] border border-slate-950 px-3 py-2 text-right">
                  IVA
                </th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, index) => (
                <tr key={line.lineItemId}>
                  <td className="border border-slate-300 px-3 py-2">
                    {showValue(line.description, `lineItems.${index}.description`)}
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-right">
                    {showValue(line.quantity, `lineItems.${index}.quantity`, {
                      maxSize: 13,
                      minSize: 7,
                    })}
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-right">
                    {showValue(
                      currencyFormatter.format(line.unitPriceWithoutTax),
                      `lineItems.${index}.unitPriceWithoutTax`,
                      { maxSize: 13, minSize: 7 },
                    )}
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-right">
                    {showValue(
                      currencyFormatter.format(line.discountAmount),
                      `lineItems.${index}.discountAmount`,
                      { maxSize: 13, minSize: 7 },
                    )}
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-right">
                    {showValue(
                      currencyFormatter.format(line.taxableBase),
                      `lineItems.${index}.taxableBase`,
                      { maxSize: 13, minSize: 7 },
                    )}
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-right">
                    <FitText maxSize={13} minSize={7}>
                      {showVariableNames
                        ? `${variableToken(
                            `lineItems.${index}.vatRate`,
                          )} / ${variableToken(`lineItems.${index}.vatAmount`)}`
                        : `${line.vatRate}% / ${currencyFormatter.format(
                            line.vatAmount,
                          )}`}
                    </FitText>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-8 flex justify-end">
          <div className="w-full max-w-sm border border-slate-300 text-sm">
            <div className="flex justify-between border-b border-slate-300 px-4 py-2">
              <span>Base imponible</span>
              <strong>
                {showValue(
                  currencyFormatter.format(invoice.totalTaxableBase),
                  "totalTaxableBase",
                )}
              </strong>
            </div>
            <div className="flex justify-between border-b border-slate-300 px-4 py-2">
              <span>IVA</span>
              <strong>
                {showValue(
                  currencyFormatter.format(invoice.totalVatAmount),
                  "totalVatAmount",
                )}
              </strong>
            </div>
            <div className="flex justify-between bg-slate-950 px-4 py-3 text-white">
              <span>Total</span>
              <strong>
                {showValue(
                  currencyFormatter.format(invoice.totalAmount),
                  "totalAmount",
                )}
              </strong>
            </div>
          </div>
        </section>

        {mode === "post" ? (
          <section className="mt-8 border border-slate-300 p-4 text-xs">
            <h3 className="text-sm font-bold">Datos posteriores al proceso VeriFactu</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <p>
                <strong>Leyenda visible:</strong>{" "}
                {showValue(
                  invoice.verifactu?.visibleLegend ?? "No consta en JSON",
                  "verifactu.visibleLegend",
                )}
              </p>
              <p>
                <strong>Tipo registro:</strong>{" "}
                {showValue(
                  invoice.verifactu?.recordType ?? "No consta en JSON",
                  "verifactu.recordType",
                )}
              </p>
              <p>
                <strong>Fecha registro:</strong>{" "}
                {showValue(
                  invoice.verifactu?.recordGenerationDateTime ??
                    "No consta en JSON",
                  "verifactu.recordGenerationDateTime",
                )}
              </p>
              <p>
                <strong>Hash:</strong>{" "}
                {showValue(
                  invoice.verifactu?.hash ?? "No consta en JSON",
                  "verifactu.hash",
                )}
              </p>
              <p>
                <strong>Hash anterior:</strong>{" "}
                {showValue(
                  invoice.verifactu?.previousRecord.previousHash ??
                    "No consta en JSON",
                  "verifactu.previousRecord.previousHash",
                )}
              </p>
              <p>
                <strong>Software:</strong>{" "}
                {showValue(
                  invoice.verifactu?.systemInfo.softwareName ??
                    "No consta en JSON",
                  "verifactu.systemInfo.softwareName",
                )}
              </p>
              <p>
                <strong>QR requerido:</strong>{" "}
                {showValue(
                  invoice.verifactu?.qrRequired === false ? "No" : "Si",
                  "verifactu.qrRequired",
                )}
              </p>
            </div>
          </section>
        ) : (
          <section className="mt-8 border border-slate-300 p-4 text-xs text-slate-600">
            Esta plantilla representa la factura antes de generar QR, leyenda,
            hash, encadenamiento y metadatos del sistema VeriFactu.
          </section>
        )}

        <section className="mt-8 text-xs text-slate-600">
          {taxRows.map((tax, index) => (
            <p key={`${tax.taxType}-${tax.vatRate}`}>
              Desglose{" "}
              {showValue(tax.taxType, `taxBreakdown.${index}.taxType`)}{" "}
              {showVariableNames
                ? showVariable(`taxBreakdown.${index}.vatRate`, {
                    maxSize: 12,
                    minSize: 7,
                  })
                : `${tax.vatRate}%`}
              : base{" "}
              {showValue(
                currencyFormatter.format(tax.taxableBase),
                `taxBreakdown.${index}.taxableBase`,
              )}
              , cuota{" "}
              {showValue(
                currencyFormatter.format(tax.vatAmount),
                `taxBreakdown.${index}.vatAmount`,
              )}
              .
            </p>
          ))}
        </section>

        <section className="mt-8 border-t border-slate-200 pt-5 text-xs">
          <h3 className="text-sm font-bold text-slate-950">
            Variables usadas desde el JSON
          </h3>
          <div className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {[
              ["internalInvoiceId", invoice.internalInvoiceId],
              ["invoiceSeries", invoice.invoiceSeries],
              ["invoiceNumber", invoice.invoiceNumber],
              ["issueDate", invoice.issueDate],
              ["operationDate", invoice.operationDate],
              ["invoiceType", invoice.invoiceType],
              ["issuerName", invoice.issuerName],
              ["issuerNif", invoice.issuerNif],
              ["recipientName", invoice.recipientName],
              ["recipientCountry", invoice.recipientCountry],
              ["recipientNif", invoice.recipientNif],
              ["totalTaxableBase", invoice.totalTaxableBase],
              ["totalVatAmount", invoice.totalVatAmount],
              ["totalAmount", invoice.totalAmount],
              ["vatStatus", invoice.vatStatus],
              ["exemptionReason", invoice.exemptionReason],
              ["verifactu.qrUrl", invoice.verifactu?.qrUrl],
              ["verifactu.visibleLegend", invoice.verifactu?.visibleLegend],
              ["verifactu.recordType", invoice.verifactu?.recordType],
              [
                "verifactu.recordGenerationDateTime",
                invoice.verifactu?.recordGenerationDateTime,
              ],
              ["verifactu.hash", invoice.verifactu?.hash],
              [
                "verifactu.previousRecord.previousHash",
                invoice.verifactu?.previousRecord.previousHash,
              ],
              [
                "verifactu.systemInfo.softwareName",
                invoice.verifactu?.systemInfo.softwareName,
              ],
            ].map(([name, value]) => (
              <p key={name} className="flex justify-between gap-3 border-b border-slate-100 py-1">
                <strong className="text-slate-600">{name}</strong>
                <span className="break-all text-right text-slate-950">
                  {value === null || value === undefined ? "null" : String(value)}
                </span>
              </p>
            ))}
          </div>
        </section>
      </article>
    </main>
  );
}
