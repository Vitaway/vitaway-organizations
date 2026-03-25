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
  BookOpen,
  CalendarDays,
  UserCircle,
  ShieldCheck,
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
  {
    name: "Programs",
    href: "/dashboard/programs",
    icon: BookOpen,
  },
  {
    name: "Appointments",
    href: "/dashboard/appointments",
    icon: CalendarDays,
  },
  {
    name: "Audit Logs",
    href: "/dashboard/audit",
    icon: ShieldCheck,
  },
  {
    name: "Profile",
    href: "/dashboard/profile",
    icon: UserCircle,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, organization, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground shadow-xl">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-foreground">Vitaway</h1>
      </div>

      {/* Organization Info */}
      {organization && (
        <div className="px-6 py-4 bg-sidebar-accent border-b border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/60 uppercase tracking-wide font-medium">Organization</p>
          <p className="text-sm font-semibold text-sidebar-foreground mt-1">{organization.name}</p>
          <p className="text-xs text-sidebar-foreground/60 mt-0.5">{organization.code}</p>
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
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-md"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* User Section */}
      <div className="p-4 bg-sidebar-accent">
        {user && (
          <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-border ring-2 ring-sidebar-foreground/20">
              <span className="text-xs font-semibold text-sidebar-foreground">
                {user.firstname.charAt(0)}
                {user.lastname.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">{user.full_name}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-all duration-200 hover:bg-sidebar-border hover:text-sidebar-foreground"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
