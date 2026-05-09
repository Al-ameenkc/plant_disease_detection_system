"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, LayoutDashboard, Camera, History, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/capture", label: "Analyze", icon: Camera },
  { href: "/history", label: "History", icon: History },
];

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  const handleLogout = async () => {
    onNavigate?.();
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 flex items-center space-x-3 mb-2">
          <div className="bg-green-100 p-2 rounded-lg shrink-0">
            <Leaf className="w-6 h-6 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight truncate">AgriScan</h1>
            <p className="text-xs text-gray-500 truncate">Monitoring System</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 px-3 sm:px-4 pb-4" aria-label="Main navigation">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;

            return (
              <Link key={link.href} href={link.href} onClick={() => onNavigate?.()} className="block">
                <div
                  className={cn(
                    "flex items-center space-x-3 px-3 sm:px-4 py-3 rounded-xl cursor-pointer transition-colors font-medium text-sm",
                    active
                      ? "bg-primary text-white"
                      : "text-gray-600 hover:bg-green-50 hover:text-green-700"
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{link.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="shrink-0 border-t border-gray-100 p-4 sm:p-6 space-y-3">
        <div className="border rounded-xl p-3 sm:p-4 flex flex-col items-start gap-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">System Status</span>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
            <span className="text-sm font-medium text-gray-700">Sensors Active</span>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-center gap-2 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}

/** Desktop sidebar — hidden on small screens (mobile uses drawer in ProtectedShell). */
export default function Sidebar() {
  return (
    <aside className="relative hidden h-full w-64 shrink-0 flex-col border-r border-gray-200 bg-white lg:flex">
      <SidebarContent />
    </aside>
  );
}
