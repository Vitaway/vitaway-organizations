"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile drawer whenever the route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ——— Mobile overlay backdrop ——————————————————————————————————— */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ——— Sidebar ————————————————————————————————————————————————— */}
      {/*
        Mobile  : fixed, slides in from the left (z-50 above overlay)
        Desktop : static in the normal flow, always visible
      */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out lg:relative lg:z-auto lg:translate-x-0 lg:flex",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* ——— Main area ——————————————————————————————————————————————— */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

