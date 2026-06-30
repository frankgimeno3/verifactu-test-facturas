"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import PendingInvoicesScreen from "./components/screens/PendingInvoicesScreen";
import SentInvoicesScreen from "./components/screens/SentInvoicesScreen";
import TopNav, { type InvoiceTab } from "./components/TopNav";

const screens: Record<InvoiceTab, ReactNode> = {
  pending: <PendingInvoicesScreen />,
  sent: <SentInvoicesScreen />,
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<InvoiceTab>("pending");

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <TopNav activeTab={activeTab} onTabChange={setActiveTab} />
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        {screens[activeTab]}
      </section>
    </main>
  );
}
