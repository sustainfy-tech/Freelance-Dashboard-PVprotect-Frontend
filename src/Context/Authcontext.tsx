import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

interface AdminUser {
  email: string;
  role: string;
  name: string;
}

interface AuthContextValue {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function verifySession() {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/auth/verify`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("No valid session");
        const json = await res.json();
        setAdmin(json.data.admin);
      } catch {
        setAdmin(null);
      } finally {
        setIsLoading(false);
      }
    }
    verifySession();
  }, []);

  async function login(email: string, password: string) {
    const res = await fetch(`${API_BASE_URL}/admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.message ?? "Login failed");
    }

    setAdmin(json.data.admin);
  }

  async function logout() {
    try {
      await fetch(`${API_BASE_URL}/admin/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
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

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}