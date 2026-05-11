"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <header className="flex flex-col gap-3 border-b border-transparent pb-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:border-none sm:pb-4 px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-bold tracking-tight text-green-900 sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-subtle-green sm:text-base leading-snug">{subtitle}</p>
      </div>

      <div ref={menuRef} className="relative flex shrink-0 items-center sm:pt-1">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="text-xs font-semibold text-green-900 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 sm:text-sm"
        >
          Admin
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full z-20 mt-2 w-32 rounded-lg border border-green-200 bg-white p-1 shadow-md">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 sm:text-sm"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
