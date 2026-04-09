"use client";

import { Bell, Search, Moon, Sun, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/theme-context";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex h-16 items-center justify-between border-b border-sidebar-border bg-sidebar-accent px-4 sm:px-6 shadow-sm gap-4">
      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden flex-shrink-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
        onClick={onMenuClick}
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Search */}
      <div className="flex items-center gap-2 flex-1 min-w-0 max-w-xl">
        <Search className="h-5 w-5 text-sidebar-foreground/60 flex-shrink-0 hidden sm:block" />
        <Input
          type="search"
          placeholder="Search employees, programs, reports…"
          className="border-0 focus-visible:ring-0 bg-white/10 text-sidebar-foreground placeholder:text-sidebar-foreground/50 min-w-0"
        />
      </div>

      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>

        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-400" />
        </Button>
      </div>
    </header>
  );
}
