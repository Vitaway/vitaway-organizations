"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Activity,
  TrendingUp,
  FileText,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";

const navigation = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Population Health",
    href: "/dashboard/population-health",
    icon: Activity,
  },
  {
    name: "Engagement",
    href: "/dashboard/engagement",
    icon: TrendingUp,
  },
  {
    name: "Employees",
    href: "/dashboard/employees",
    icon: Users,
  },
  {
    name: "Reports",
    href: "/dashboard/reports",
    icon: FileText,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, organization, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex h-full w-64 flex-col bg-slate-800 dark:bg-slate-900 text-white shadow-xl">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center px-6 border-b border-slate-700 dark:border-slate-800">
        <h1 className="text-xl font-bold text-white">Vitaway</h1>
      </div>

      {/* Organization Info */}
      {organization && (
        <div className="px-6 py-4 bg-slate-700 dark:bg-slate-800 border-b border-slate-600 dark:border-slate-700">
          <p className="text-xs text-slate-300 dark:text-slate-400 uppercase tracking-wide font-medium">Organization</p>
          <p className="text-sm font-semibold text-white mt-1">{organization.name}</p>
          <p className="text-xs text-slate-300 dark:text-slate-400 mt-0.5">{organization.code}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-slate-700 dark:bg-slate-800 text-white shadow-md"
                  : "text-slate-200 hover:bg-slate-700 dark:hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-slate-700 dark:bg-slate-800" />

      {/* User Section */}
      <div className="p-4 bg-slate-700 dark:bg-slate-800">
        {user && (
          <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-600 dark:bg-slate-700 ring-2 ring-slate-500 dark:ring-slate-600">
              <span className="text-xs font-semibold text-white">
                {user.firstname.charAt(0)}
                {user.lastname.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.full_name}</p>
              <p className="text-xs text-slate-300 dark:text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 transition-all duration-200 hover:bg-slate-600 dark:hover:bg-slate-700 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
