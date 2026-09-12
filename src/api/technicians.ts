import { apiRequest } from "./http";
import type {
  ApiTechnician,
  ApprovalStatus,
} from "../types/Pages/Technicians.types";
import type { ApiPlant } from "../types/Pages/Plant.types";

export function listTechniciansForAdmin() {
  return apiRequest<ApiTechnician[]>("/api/v1/admin/app-users/all?role=client");
}

export function listAprovedTechnicians() {
  return apiRequest<ApiTechnician[]>("/api/v1/admin/app-users/all?status=approved&role=technician");
}

export function listAllTechnicians() {
  return apiRequest<ApiTechnician[]>("/api/v1/admin/app-users/all?role=technician");
}

export function listTechnicianRequests() {
  return apiRequest<ApiTechnician[]>("/api/v1/admin/app-users/all?status=submit_for_review&role=technician");
}

export function getPlantsByClientId(userId: string) {
  return apiRequest<ApiPlant[]>(`/api/v1/plants/user/${userId}`);
}

export function updateTechnicianStatus(id: string, status: ApprovalStatus) {
  return apiRequest<ApiTechnician>(`/api/v1/admin/app-users/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
}
