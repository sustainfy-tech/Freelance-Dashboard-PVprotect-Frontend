import { apiRequest, adminPath } from "./http";
import type { AuthPayload } from "../types/context/AuthContext.types";

/**
 * Maps to Routes/admin.route.js:
 *   GET  /admin/auth/verify
 *   POST /admin/auth/login
 *   POST /admin/auth/logout
 */

export function verifySession() {
  return apiRequest<AuthPayload>(adminPath("/auth/verify"));
}

export function login(email: string, password: string) {
  return apiRequest<AuthPayload>(adminPath("/auth/login"), {
    method: "POST",
    body: { email, password },
  });
}

export function logout() {
  return apiRequest<unknown>(adminPath("/auth/logout"), { method: "POST" });
}