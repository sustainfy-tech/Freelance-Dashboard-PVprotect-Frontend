import { apiRequest } from "./http";
import type {
  ApiBookingRequest,
  BookingRequestStatus,
} from "../types/Pages/Bookings.types";
import type { ApiPlant } from "../types/Pages/Plant.types";

export function listBookingRequestsForAdmin(status?: BookingRequestStatus) {
  return apiRequest<ApiBookingRequest[]>("/api/v1/admin/bookings/requests", {
    query: { status },
  });
}

export function assignTechnician(
  bookingId: string,
  technicianId: string,
  technicianName: string,
) {
  return apiRequest<ApiBookingRequest>(
    `/api/v1/admin/bookings/${bookingId}/assign`,
    {
      method: "PATCH",
      body: { technicianId, technicianName },
    },
  );
}

export function getPlantForBooking(bookingId: string) {
  return apiRequest<ApiPlant>(`/api/v1/admin/bookings/${bookingId}/plant`);
}
