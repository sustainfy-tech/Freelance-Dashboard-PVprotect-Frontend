import { createContext } from "react";

export interface AdminUser {
  email: string;
  role: string;
  name: string;
}

export interface AuthPayload {
  admin: AdminUser;
}

export interface AuthContextValue {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
