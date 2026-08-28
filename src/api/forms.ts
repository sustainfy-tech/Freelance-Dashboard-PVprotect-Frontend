import type { ApiForm } from "../types/Formtypes.ts";

const API_BASE = "http://localhost:8000/api/v1";

export async function getActiveForm(serviceId: string): Promise<ApiForm> {
  const res = await fetch(`${API_BASE}/service-form/${serviceId}/form`);
  if (res.status === 404) {
    throw new Error("No published form for this service yet.");
  }
  if (!res.ok) {
    throw new Error(`Failed to load form (${res.status})`);
  }
  return res.json();
}

export async function submitSiteVisit(
  serviceId: string,
  bookingId: string,
  answers: Record<string, unknown>
): Promise<unknown> {
  const res = await fetch(`${API_BASE}/service-form/${serviceId}/site-visits`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookingId, answers }),
  });
  const data = await res.json();
  if (!res.ok) {
    // 400 with field errors, 404 booking/form not found, etc.
    throw data;
  }
  return data;
}