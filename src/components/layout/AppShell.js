"use client";

import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-[#05070a] text-white">
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />

          <main className="min-w-0 flex-1 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}