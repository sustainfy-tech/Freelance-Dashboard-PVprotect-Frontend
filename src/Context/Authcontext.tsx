import { useEffect, useState, type ReactNode } from "react";
import { AuthContext } from "../types/context/AuthContext.types";
import type { AdminUser } from "../types/context/AuthContext.types";
import {
  verifySession,
  login as loginRequest,
  logout as logoutRequest,
} from "../api/auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      try {
        const { admin } = await verifySession();
        if (!cancelled) setAdmin(admin);
      } catch {
        if (!cancelled) setAdmin(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, []);

  async function login(email: string, password: string) {
    const { admin } = await loginRequest(email, password);
    setAdmin(admin);
  }

  async function logout() {
    try {
      await logoutRequest();
    } finally {
      setAdmin(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{ admin, isAuthenticated: !!admin, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
