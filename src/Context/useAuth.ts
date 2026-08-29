import { useContext } from "react";
import { AuthContext } from "../types/context/AuthContext.types";
import type { AuthContextValue } from "../types/context/AuthContext.types";

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
