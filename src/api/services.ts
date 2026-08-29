import { apiRequest, adminPath, servicesPath } from "./http";
import { ApiError } from "./http";
import type {
  ApiService,
  ApiSlot,
  ApiServiceForm,
  ApiServiceFormPayload,
} from "../types/Pages/Services.types";

export function listServices() {
  return apiRequest<ApiService[]>(servicesPath("/"));
}

export function getService(id: string) {
  return apiRequest<ApiService>(adminPath(`/services/${id}`));
}

export function createService(payload: Partial<ApiService>) {
  return apiRequest<ApiService>(adminPath("/services"), {
    method: "POST",
    body: payload,
  });
}

export function updateService(id: string, payload: Partial<ApiService>) {
  return apiRequest<ApiService>(adminPath(`/services/${id}`), {
    method: "PATCH",
    body: payload,
  });
}

export function deleteService(id: string) {
  return apiRequest<{ success: boolean }>(adminPath(`/services/${id}`), {
    method: "DELETE",
  });
}

export function setServiceAvailability(id: string, available: boolean) {
  return apiRequest<ApiService>(adminPath(`/services/${id}/availability`), {
    method: "PATCH",
    body: { available },
  });
}

export function addUnavailableDate(id: string, date: string) {
  return apiRequest<ApiService>(
    adminPath(`/services/${id}/unavailable-dates`),
    {
      method: "PATCH",
      body: { date },
    },
  );
}

export function removeUnavailableDate(id: string, date: string) {
  return apiRequest<ApiService>(
    adminPath(`/services/${id}/unavailable-dates/${date}`),
    {
      method: "DELETE",
    },
  );
}

export function listSlots(serviceId: string, date: string) {
  return apiRequest<ApiSlot[]>(
    adminPath(`/services/${serviceId}/slots?date=${date}`),
  );
}

export function createSlot(
  serviceId: string,
  payload: { date: string; time: string },
) {
  return apiRequest<ApiService>(adminPath(`/services/${serviceId}/slots`), {
    method: "POST",
    body: payload,
  });
}

export function updateSlotStatus(
  serviceId: string,
  slotId: string,
  status: string,
) {
  return apiRequest<ApiService>(
    adminPath(`/services/${serviceId}/slots/${encodeURIComponent(slotId)}`),
    { method: "PATCH", body: { status } },
  );
}

export function deleteSlot(serviceId: string, slotId: string) {
  return apiRequest<{ success: boolean }>(
    adminPath(`/services/${serviceId}/slots/${encodeURIComponent(slotId)}`),
    { method: "DELETE" },
  );
}

export async function getServiceForm(
  serviceId: string,
): Promise<ApiServiceForm | null> {
  try {
    return await apiRequest<ApiServiceForm>(
      adminPath(`/service-form/${serviceId}/forms`),
    );
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export function createServiceForm(
  serviceId: string,
  payload: ApiServiceFormPayload,
) {
  return apiRequest<ApiServiceForm>(
    adminPath(`/service-form/${serviceId}/forms`),
    {
      method: "POST",
      body: payload,
    },
  );
}

export function updateServiceForm(
  serviceId: string,
  payload: ApiServiceFormPayload,
) {
  return apiRequest<ApiServiceForm>(
    adminPath(`/service-form/${serviceId}/forms`),
    {
      method: "PATCH",
      body: payload,
    },
  );
}
