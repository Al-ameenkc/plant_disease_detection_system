"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar, { SidebarContent } from "@/components/Sidebar";

export default function ProtectedShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background text-foreground lg:h-screen lg:flex-row lg:overflow-hidden">
      <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            className="rounded-lg p-2 text-gray-700 hover:bg-gray-100"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="truncate font-bold text-gray-900">AgriScan</span>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 flex h-full w-[min(20rem,calc(100vw-2rem))] max-w-[85vw] flex-col border-r border-gray-200 bg-white shadow-xl">
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3">
              <span className="font-semibold text-gray-900">Menu</span>
              <button
                type="button"
                aria-label="Close menu"
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>
      )}

      <Sidebar />
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">{children}</main>
    </div>
  );
}
