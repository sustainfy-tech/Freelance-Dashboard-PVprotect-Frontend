import { apiRequest } from "./http";
import type {
  ApiTechnician,
  ApprovalStatus,
} from "../types/Pages/Technicians.types";
import type { ApiPlant } from "../types/Pages/Plant.types";
import type { TechnicianPage } from "../types/Pages/Technicians.types";



async function fetchTechniciansByStatus(
  status: ApprovalStatus | string
): Promise<ApiTechnician[]> {
  const matches: ApiTechnician[] = [];
  let lastKey: string | undefined;

  do {
    const res = await apiRequest<TechnicianPage | ApiTechnician[]>(
      "/api/v1/admin/app-users/all-technicians",
      { query: { role: "technician", limit: 100, lastKey } }
    );

    const items = Array.isArray(res) ? res : res.items ?? [];
    matches.push(...items.filter((t) => t.status === status));

    lastKey = Array.isArray(res) ? undefined : res.nextToken ?? undefined;
  } while (lastKey);

  return matches;
}

export function listTechniciansForAdmin() {
  return apiRequest<ApiTechnician[]>("/api/v1/admin/app-users/all-clients?role=client");
}

export function listAprovedTechnicians() {
  return fetchTechniciansByStatus("approved");
}

export function listAllTechnicians() {
  return apiRequest<ApiTechnician[]>("/api/v1/admin/app-users/all-technicians?role=technician");
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