import { apiRequest, SERVICES_BASE, ADMIN_BASE } from "./http";
import type { ApiService, ApiSlot } from "./types";

export function listServices() {
  return apiRequest<ApiService[]>(SERVICES_BASE, "/jdn");
}

export function getService(id: string) {
  return apiRequest<ApiService>(ADMIN_BASE, `/services/${id}`);
}

export function createService(payload: Partial<ApiService>) {
  return apiRequest<ApiService>(ADMIN_BASE, '/services', { method: "POST", body: payload });
}

export function updateService(id: string, payload: Partial<ApiService>) {
  return apiRequest<ApiService>(ADMIN_BASE, `/services/${id}`, { method: "PATCH", body: payload });
}

export function deleteService(id: string) {
  return apiRequest<{ success: boolean }>(ADMIN_BASE, `/services/${id}`, { method: "DELETE" });
}

export function setServiceAvailability(id: string, available: boolean) {
  return apiRequest<ApiService>(ADMIN_BASE, `/services/${id}/availability`, {
    method: "PATCH",
    body: { available },
  });
}

export function addUnavailableDate(id: string, date: string) {
  return apiRequest<ApiService>(ADMIN_BASE, `/services/${id}/unavailable-dates`, {
    method: "PATCH",
    body: { date },
  });
}

export function removeUnavailableDate(id: string, date: string) {
  return apiRequest<ApiService>(ADMIN_BASE, `/services/${id}/unavailable-dates/${date}`, {
    method: "DELETE",
  });
}

export function listSlots(serviceId: string, date: string) {
  return apiRequest<ApiSlot[]>(ADMIN_BASE, `/services/${serviceId}/slots?date=${date}`);
}

export function createSlot(serviceId: string, payload: { date: string; time: string }) {
  return apiRequest<ApiService>(ADMIN_BASE, `/services/${serviceId}/slots`, {
    method: "POST",
    body: payload,
  });
}

export function updateSlotStatus(serviceId: string, slotId: string, status: string) {
  // slotId is a composite like "2026-08-20#10:00" — the "#" must be
  // percent-encoded or it gets parsed as a URL fragment and silently
  // dropped from the request path.
  return apiRequest<ApiService>(ADMIN_BASE, `/services/${serviceId}/slots/${encodeURIComponent(slotId)}`, {
    method: "PATCH",
    body: { status },
  });
}

export function deleteSlot(serviceId: string, slotId: string) {
  return apiRequest<{ success: boolean }>(ADMIN_BASE, `/services/${serviceId}/slots/${encodeURIComponent(slotId)}`, {
    method: "DELETE",
  });
}

// ---------------------------------------------------------------------------
// Service intake forms
//
// Backend routes (mounted under ADMIN_BASE + /services, mergeParams: true):
//   GET    /:serviceId/forms  -> getserviceform
//   POST   /:serviceId/forms  -> createserviceform
//   PATCH  /:serviceId/forms  -> updateserviceform
// ---------------------------------------------------------------------------

export type ApiFormFieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "radio"
  | "multiselect"
  | "checkbox"
  | "date"
  | "time"
  | "email"
  | "phone"
  | "url"
  | "photo"
  | "document";

export interface ApiFormField {
  fieldId: string;
  label: string;
  type: ApiFormFieldType;
  required?: boolean;
  /** Only used when type is select / radio / multiselect */
  options?: string[];
  placeholder?: string;
}

export interface ApiServiceForm {
  serviceId: string;
  title: string;
  fields: ApiFormField[];
  createdAt: string;
  updatedAt?: string;
}

export interface ApiServiceFormPayload {
  title: string;
  fields: ApiFormField[];
}

/**
 * Returns the form for a service, or `null` if none has been created yet.
 * apiRequest throws ApiError with a `.status` property on non-2xx
 * responses (see http.ts), so a 404 here just means "no form yet".
 */
export async function getServiceForm(serviceId: string): Promise<ApiServiceForm | null> {
  try {
    return await apiRequest<ApiServiceForm>(ADMIN_BASE, `/service-form/${serviceId}/forms`);
  } catch (e) {
    const status = (e as { status?: number })?.status;
    if (status === 404) return null;
    throw e;
  }
}

export function createServiceForm(serviceId: string, payload: ApiServiceFormPayload) {
  return apiRequest<ApiServiceForm>(ADMIN_BASE, `/service-form/${serviceId}/forms`, {
    method: "POST",
    body: payload,
  });
}

export function updateServiceForm(serviceId: string, payload: ApiServiceFormPayload) {
  return apiRequest<ApiServiceForm>(ADMIN_BASE, `/service-form/${serviceId}/forms`, {
    method: "PATCH",
    body: payload,
  });
}