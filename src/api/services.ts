import { apiRequest } from "./http";
import { ApiError } from "./http";
import type {
  ApiService,
  ApiSlot,
  ApiServiceForm,
  ApiServiceFormPayload,
} from "../types/Pages/Services.types";

export function listServices() {
  return apiRequest<ApiService[]>("/api/v1/admin/services");
}

export function getService(id: string) {
  return apiRequest<ApiService>(`/api/v1/admin/services/${id}`);
}

export function createService(payload: Partial<ApiService>) {
  return apiRequest<ApiService>(`/api/v1/admin/services`, {
    method: "POST",
    body: payload,
  });
}

export function updateService(id: string, payload: Partial<ApiService>) {
  return apiRequest<ApiService>(`/api/v1/admin/services/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteService(id: string) {
  return apiRequest<{ success: boolean }>(`/api/v1/admin/services/${id}`, {
    method: "DELETE",
  });
}

export function setServiceAvailability(id: string, available: boolean) {
  return apiRequest<ApiService>(`/api/v1/admin/services/${id}/availability`, {
    method: "PATCH",
    body: { available },
  });
}

export function addUnavailableDate(id: string, date: string) {
  return apiRequest<ApiService>(
    `/api/v1/admin/services/${id}/unavailable-dates`,
    {
      method: "PATCH",
      body: { date },
    },
  );
}

export function removeUnavailableDate(id: string, date: string) {
  return apiRequest<ApiService>(
    `/api/v1/admin/services/${id}/unavailable-dates/${date}`,
    {
      method: "DELETE",
    },
  );
}

export function listSlots(serviceId: string, date: string) {
  return apiRequest<ApiSlot[]>(
    `/api/v1/admin/services/${serviceId}/slots?date=${date}`,

  );
}

export function createSlot(
  serviceId: string,
  payload: { date: string; time: string },
) {
  return apiRequest<ApiService>(`/api/v1/admin/services/${serviceId}/slots`, {
    method: "POST",
    body: payload,
  });
}

export async function updateSlotStatus(
  serviceId: string,
  slotId: string,
  status: string,
) {
  return apiRequest<ApiService>(
    `/api/v1/admin/services/${encodeURIComponent(serviceId)}/slots/${encodeURIComponent(slotId)}`,
    { method: "PATCH", body: { status } },
  );
}

export function deleteSlot(serviceId: string, slotId: string) {
  return apiRequest<{ success: boolean }>(
    `/api/v1/admin/services/${serviceId}/slots/${encodeURIComponent(slotId)}`,
    { method: "DELETE" },
  );
}

export async function getServiceForm(
  serviceId: string,
): Promise<ApiServiceForm | null> {
  try {
    const res = await apiRequest<{ form: ApiServiceForm }>(
      `/api/v1/admin/service-form/${serviceId}/forms`,
    );
    return res.form ?? null;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function createServiceForm(
  serviceId: string,
  payload: ApiServiceFormPayload,
) {
  const res = await apiRequest<{ form: ApiServiceForm }>(
    `/api/v1/admin/service-form/${serviceId}/forms`,
    {
      method: "POST",
      body: payload,
    },
  );
  return res.form;
}

export async function updateServiceForm(
  serviceId: string,
  payload: ApiServiceFormPayload,
) {
  const res = await apiRequest<{ form: ApiServiceForm }>(
    `/api/v1/admin/service-form/${serviceId}/forms`,
    {
      method: "PATCH",
      body: payload,
    },
  );
  return res.form;
}