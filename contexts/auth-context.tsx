"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  login as apiLogin,
  verifyMfa as apiVerifyMfa,
  logout as apiLogout,
  getToken,
  clearAuthStorage,
  type AuthOrganization,
  type AuthUser,
  type LoginResult,
} from "@/lib/api-client";

interface AuthContextType {
  user: AuthUser | null;
  organization: AuthOrganization | null;
  role: string | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  verifyMfa: (challengeToken: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readStored<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function persistSession(session: Extract<LoginResult, { mfaRequired: false }>) {
  localStorage.setItem("user", JSON.stringify(session.user));
  if (session.organization) {
    localStorage.setItem("organization", JSON.stringify(session.organization));
  } else {
    localStorage.removeItem("organization");
  }
  localStorage.setItem("role", session.role);
  localStorage.setItem("permissions", JSON.stringify(session.permissions));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [organization, setOrganization] = useState<AuthOrganization | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in (run after hydration)
    const token = getToken();
    if (token) {
      const storedUser = readStored<AuthUser>("user");
      const storedOrg = readStored<AuthOrganization>("organization");
      const storedRole = localStorage.getItem("role");
      const storedPermissions = readStored<string[]>("permissions");

      if (storedUser) {
        setUser(storedUser);
        setOrganization(storedOrg);
        setRole(storedRole);
        setPermissions(storedPermissions ?? []);
      }
    }
    setIsLoading(false);
    setIsHydrated(true);
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

  const applySession = (session: Extract<LoginResult, { mfaRequired: false }>) => {
    setUser(session.user);
    setOrganization(session.organization);
    setRole(session.role);
    setPermissions(session.permissions);
    persistSession(session);
    router.push("/dashboard");
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiLogin(email, password);
      if (response.mfaRequired) return response;
      applySession(response);
      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const verifyMfa = async (challengeToken: string, code: string) => {
    try {
      const response = await apiVerifyMfa(challengeToken, code);
      if (response.mfaRequired) {
        throw new Error("Enter the 6-digit code we sent.");
      }
      applySession(response);
    } catch (error) {
      console.error("MFA error:", error);
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
    isLoading: isLoading || !isHydrated,
    login,
    verifyMfa,
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
