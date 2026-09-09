import { useEffect, useState, type ReactNode } from "react";
import { AuthContext } from "../types/context/AuthContext.types";
import type { AdminUser } from "../types/context/AuthContext.types";
import { login as loginRequest, logout as logoutRequest } from "../api/auth";

const ADMIN_STORAGE_KEY = "pvprotect_admin";

function readStoredAdmin(): AdminUser | null {
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

function storeAdmin(admin: AdminUser | null) {
  if (admin) {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admin));
  } else {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(() => readStoredAdmin());
  const isLoading = false;

  // Keep other tabs in sync if the admin logs in/out elsewhere.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === ADMIN_STORAGE_KEY) {
        setAdmin(readStoredAdmin());
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  async function login(verifiedUserId: string, password: string) {
    const { admin } = await loginRequest(verifiedUserId, password);
    setAdmin(admin);
    storeAdmin(admin);
  }

  async function logout() {
    try {
      await logoutRequest();
    } finally {
      setAdmin(null);
      storeAdmin(null);
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