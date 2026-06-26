"use client";

import { useEffect, useState } from "react";
import projectInstructions from "./instructions/project_instructions.json";
import verifactuRequirements from "./instructions/verifactu_requirements.json";

export type InvoiceTab = "pending" | "processing" | "sent";

type TopNavProps = {
  activeTab: InvoiceTab;
  onTabChange: (tab: InvoiceTab) => void;
};

type InstructionsTab = "projectInstructions" | "verifactuRequirements";
type InstructionContent = {
  title: string;
  items: string[];
  source?: {
    label: string;
    url: string;
  };
  fieldNotesTitle?: string;
  fieldNotes?: Array<{
    title: string;
    items: string[];
  }>;
  exampleInvoiceTitle?: string;
  exampleInvoice?: unknown;
  internationalDifferencesTitle?: string;
  internationalDifferences?: string[];
};

const tabs: Array<{ id: InvoiceTab; label: string }> = [
  { id: "pending", label: "Facturas pre-verifactu" },
  { id: "processing", label: "En proceso" },
  { id: "sent", label: "Facturas enviadas" },
];

const instructionTabs: Array<{ id: InstructionsTab; label: string }> = [
  { id: "projectInstructions", label: "Instrucciones para el proyecto" },
  { id: "verifactuRequirements", label: "Requerimientos VeriFactu" },
];

const instructions: Record<InstructionsTab, InstructionContent> = {
  projectInstructions,
  verifactuRequirements,
};

function PaperIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 3.75h7.25L19 8.5v11.75H7A2 2 0 0 1 5 18.25V5.75a2 2 0 0 1 2-2Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 4v5h5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 13h7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 16h7" />
    </svg>
  );
}

export default function TopNav({ activeTab, onTabChange }: TopNavProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeInstructionsTab, setActiveInstructionsTab] =
    useState<InstructionsTab>("projectInstructions");
  const activeInstructionContent = instructions[activeInstructionsTab];

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

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Panel VeriFactu</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-950">
              Gestion de facturas
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100"
          >
            <PaperIcon />
            <span>Instrucciones</span>
          </button>
        </div>

        <nav className="flex gap-2 overflow-x-auto" aria-label="Estados de facturas">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`shrink-0 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {isModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="instructions-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsModalOpen(false);
            }
          }}
        >
          <section className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Ayuda</p>
                <h2 id="instructions-title" className="text-xl font-semibold text-slate-950">
                  Instrucciones
                </h2>
              </div>
              <button
                type="button"
                aria-label="Cerrar instrucciones"
                onClick={() => setIsModalOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-lg leading-none text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
              >
                x
              </button>
            </div>

            <div className="border-b border-slate-200 px-5 pt-4">
              <div className="flex gap-2 overflow-x-auto">
                {instructionTabs.map((tab) => {
                  const isActive = activeInstructionsTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveInstructionsTab(tab.id)}
                      className={`shrink-0 rounded-t-md border border-b-0 px-4 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "border-slate-200 bg-white text-slate-950"
                          : "border-transparent text-slate-500 hover:text-slate-950"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="overflow-y-auto px-5 py-5">
              <h3 className="text-lg font-semibold text-slate-950">
                {activeInstructionContent.title}
              </h3>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                {activeInstructionContent.items.map((item) => (
                  <li key={item} className="rounded-md border border-slate-100 bg-slate-50 p-3">
                    {item}
                  </li>
                ))}
              </ul>
              {activeInstructionContent.source ? (
                <div className="mt-5 rounded-md border border-slate-200 bg-white p-4 text-sm">
                  <p className="font-semibold text-slate-950">Fuente</p>
                  <a
                    href={activeInstructionContent.source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 block break-words text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-950"
                  >
                    {activeInstructionContent.source.label}
                  </a>
                </div>
              ) : null}
              {activeInstructionContent.fieldNotes ? (
                <div className="mt-5 rounded-md border border-slate-200 bg-white p-4">
                  <h4 className="text-sm font-semibold text-slate-950">
                    {activeInstructionContent.fieldNotesTitle ?? "Notas"}
                  </h4>
                  <div className="mt-4 space-y-4">
                    {activeInstructionContent.fieldNotes.map((section) => (
                      <section
                        key={section.title}
                        className="rounded-md border border-slate-100 bg-slate-50 p-4"
                      >
                        <h5 className="text-sm font-semibold text-slate-950">
                          {section.title}
                        </h5>
                        <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                          {section.items.map((item) => (
                            <li key={item} className="border-l-2 border-slate-300 pl-3">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </section>
                    ))}
                  </div>
                </div>
              ) : null}
              {activeInstructionContent.exampleInvoice ? (
                <div className="mt-5 rounded-md border border-slate-200 bg-slate-950 p-4 text-sm text-slate-100">
                  <p className="mb-3 font-semibold">
                    {activeInstructionContent.exampleInvoiceTitle ?? "Ejemplo"}
                  </p>
                  <pre className="max-h-96 overflow-auto text-xs leading-5">
                    {JSON.stringify(activeInstructionContent.exampleInvoice, null, 2)}
                  </pre>
                </div>
              ) : null}
              {activeInstructionContent.internationalDifferences ? (
                <div className="mt-5 rounded-md border border-slate-200 bg-white p-4">
                  <h4 className="text-sm font-semibold text-slate-950">
                    {activeInstructionContent.internationalDifferencesTitle ??
                      "Facturas internacionales"}
                  </h4>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                    {activeInstructionContent.internationalDifferences.map((item) => (
                      <li key={item} className="border-l-2 border-slate-300 pl-3">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}
    </header>
  );
}
