import { apiRequest } from "./http";
import type { ApiForm } from "../types/Components/SitevisitForm.types";

export function getActiveForm(serviceId: string) {
  return apiRequest<ApiForm>(`/service-form/${serviceId}/form`);
}

export function submitSiteVisit(
  serviceId: string,
  bookingId: string,
  answers: Record<string, unknown>,
) {
  return apiRequest<unknown>(`/service-form/${serviceId}/site-visits`, {
    method: "POST",
    body: { bookingId, answers },
  });
}
