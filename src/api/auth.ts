import { apiRequest } from "./http";
import type { AuthPayload } from "../types/context/AuthContext.types";

export function login(verifiedUserId: string, password: string) {
  return apiRequest<AuthPayload>("/api/v1/admin/auth/login", {
    method: "POST",
    body: { verifiedUserId, password },
  });
}

export function logout() {
  return apiRequest<unknown>("/api/v1/admin/auth/logout", { method: "POST" });
}