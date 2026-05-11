"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Camera, History, BarChart3 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { cn } from "@/lib/utils";

const mobileLinks = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/capture", label: "Analyze", icon: Camera },
  { href: "/history", label: "History", icon: History },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export default function ProtectedShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background text-foreground lg:h-screen lg:flex-row lg:overflow-hidden">
      <Sidebar />
      <div className="flex min-h-0 flex-1 flex-col">
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pb-20 lg:pb-0">{children}</main>
        <MobileBottomNav />
      </div>
    </div>
  );
}

function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur lg:hidden" aria-label="Bottom navigation">
      <div className="mx-auto flex h-16 max-w-xl items-center justify-around px-2">
        {mobileLinks.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className="flex min-w-0 flex-1 items-center justify-center">
              <span
                className={cn(
                  "flex flex-col items-center gap-1 text-[11px] font-medium",
                  active ? "text-emerald-600" : "text-gray-500"
                )}
              >
                <Icon className={cn("h-6 w-6", active ? "text-emerald-600" : "text-gray-400")} />
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
