import { apiRequest } from "./http";
import type {
  ApiTechnician,
  ApprovalStatus,
} from "../types/Pages/Technicians.types";
import type { ApiPlant } from "../types/Pages/Plant.types";

interface TechnicianPage {
  items: ApiTechnician[];
  count?: number;
  nextToken?: string | null;
}

/**
 * Fetches technicians by role only (the backend index has no `status` sort key,
 * so sending `status` causes a DynamoDB ValidationException) and filters by
 * status here. Follows nextToken so later pages are not missed.
 * Handles both a plain array response and a { items, nextToken } page.
 */
async function fetchTechniciansByStatus(
  status: ApprovalStatus | string
): Promise<ApiTechnician[]> {
  const matches: ApiTechnician[] = [];
  let lastKey: string | undefined;

  do {
    const res = await apiRequest<TechnicianPage | ApiTechnician[]>(
      "/api/v1/admin/app-users/all",
      { query: { role: "technician", limit: 100, lastKey } }
    );

    const items = Array.isArray(res) ? res : res.items ?? [];
    matches.push(...items.filter((t) => t.status === status));

    lastKey = Array.isArray(res) ? undefined : res.nextToken ?? undefined;
  } while (lastKey);

  return matches;
}

export function listTechniciansForAdmin() {
  return apiRequest<ApiTechnician[]>("/api/v1/admin/app-users/all?role=client");
}

export function listAprovedTechnicians() {
  return fetchTechniciansByStatus("approved");
}

export function listAllTechnicians() {
  return apiRequest<ApiTechnician[]>("/api/v1/admin/app-users/all?role=technician");
}

export function listTechnicianRequests() {
  return fetchTechniciansByStatus("submit_for_review");
}

export function getPlantsByClientId(userId: string) {
  return apiRequest<ApiPlant[]>(`/api/v1/plants/user/${userId}`);
}

export function updateTechnicianStatus(id: string, status: ApprovalStatus) {
  return apiRequest<ApiTechnician>(`/api/v1/app-users/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
}