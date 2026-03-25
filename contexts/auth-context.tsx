"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { login as apiLogin, logout as apiLogout, getToken, clearAuthStorage } from "@/lib/api-client";

interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  full_name: string;
}

interface Organization {
  id: number;
  name: string;
  code: string;
  type: string;
}

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  role: string | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const token = getToken();
    if (token) {
      // Optionally validate token or fetch user data
      const storedUser = localStorage.getItem("user");
      const storedOrg = localStorage.getItem("organization");
      const storedRole = localStorage.getItem("role");
      const storedPermissions = localStorage.getItem("permissions");

      if (storedUser && storedOrg) {
        setUser(JSON.parse(storedUser));
        setOrganization(JSON.parse(storedOrg));
        setRole(storedRole);
        setPermissions(storedPermissions ? JSON.parse(storedPermissions) : []);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setOrganization(null);
      setRole(null);
      setPermissions([]);
      clearAuthStorage();
      router.push("/login");
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [router]);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiLogin(email, password);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        setOrganization(response.data.organization);
        setRole(response.data.role);
        setPermissions(response.data.permissions || []);

        // Store in localStorage
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("organization", JSON.stringify(response.data.organization));
        localStorage.setItem("role", response.data.role);
        localStorage.setItem("permissions", JSON.stringify(response.data.permissions || []));

        router.push("/dashboard");
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } finally {
      setUser(null);
      setOrganization(null);
      setRole(null);
      setPermissions([]);

      // Clear localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("organization");
      localStorage.removeItem("role");
      localStorage.removeItem("permissions");

      router.push("/login");
    }
  };

  const value = {
    user,
    organization,
    role,
    permissions,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
