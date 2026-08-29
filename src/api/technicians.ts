import { apiRequest, adminPath } from "./http";
import type {
  ApiTechnician,
  ApprovalStatus,
} from "../types/Pages/Technicians.types";
import type { ApiPlant } from "../types/Pages/Plant.types";

export function listTechniciansForAdmin() {
  return apiRequest<ApiTechnician[]>(adminPath("/app-users/approved"));
}

export function listAllTechnicians() {
  return apiRequest<ApiTechnician[]>(adminPath("/app-users/all"));
}

export function listTechnicianRequests() {
  return apiRequest<ApiTechnician[]>(adminPath("/app-users/requests"));
}

export function getPlantsByClientId(userId: string) {
  return apiRequest<ApiPlant[]>(`/plants/user/${userId}`);
}

export function updateTechnicianStatus(id: string, status: ApprovalStatus) {
  return apiRequest<ApiTechnician>(`/app-users/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
}
