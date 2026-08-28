import { apiRequest, ADMIN_BASE } from "./http";
import type { ApiPlant, ApiTechnician, ApprovalStatus } from "./types";

const BASE_URL = 'http://localhost:8000/api/v1'

// Used by the "Assign technician" dropdown (Bookings.tsx) — approved only.
// Left exactly as-is.
export function listTechniciansForAdmin() {
  return apiRequest<ApiTechnician[]>(ADMIN_BASE, "/app-users/approved");
}

// Used by the "Technicians" tab — every technician regardless of status.
// TODO: replace "/app-users/all" with your real "list all technicians" endpoint.
export function listAllTechnicians() {
  return apiRequest<ApiTechnician[]>(ADMIN_BASE, "/app-users/all");
}

// Used by the "Requests" tab — technicians awaiting approval only.
// TODO: replace "/app-users/requests" with your real "list requests" endpoint.
export function listTechnicianRequests() {
  return apiRequest<ApiTechnician[]>(ADMIN_BASE, "/app-users/requests");
}

export function getPlantsByClientId(userId: string) {
  return apiRequest<ApiPlant[]>(BASE_URL, `/plants/user/${userId}`);
}

export function updateTechnicianStatus(id: string, status: ApprovalStatus) {
  return apiRequest<ApiTechnician>(BASE_URL, `/app-users/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
}