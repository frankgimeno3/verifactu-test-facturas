"use client";

import Link from "next/link";

export type InvoiceTab = "pending" | "sent";

type TopNavProps = {
  activeTab: InvoiceTab;
  onTabChange: (tab: InvoiceTab) => void;
};

const tabs: Array<{ id: InvoiceTab; label: string }> = [
  { id: "pending", label: "Facturas pre-verifactu" },
  { id: "sent", label: "Facturas post-verifactu" },
];

function TemplateIcon() {
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
        d="M4.75 5.75A2 2 0 0 1 6.75 3.75h10.5a2 2 0 0 1 2 2v12.5a2 2 0 0 1-2 2H6.75a2 2 0 0 1-2-2V5.75Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 8h8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 11.5h8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 15h4.5" />
    </svg>
  );
}

export default function TopNav({ activeTab, onTabChange }: TopNavProps) {
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
          <div className="flex flex-wrap gap-2">
            <Link
              href="/plantillas"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100"
            >
              <TemplateIcon />
              <span>Plantillas</span>
            </Link>
          </div>
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
    </header>
  );
}
