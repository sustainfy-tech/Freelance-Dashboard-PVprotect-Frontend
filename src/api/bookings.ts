import { apiRequest, ADMIN_BASE } from "./http";
import type { ApiBookingRequest, ApiPlant, BookingRequestStatus } from "./types";

/**
 * Maps to Routes/admin.route.js:
 *   GET   /admin/bookings/requests?status=pending
 *   PATCH /admin/bookings/:bookingId/assign
 *   GET   /admin/bookings/:bookingId/plant
 */

export function listBookingRequestsForAdmin(status?: BookingRequestStatus) {
  return apiRequest<ApiBookingRequest[]>(ADMIN_BASE, "/bookings/requests", {
    query: { status },
  });
}

export function assignTechnician(
  bookingId: string,
  technicianId: string,
  technicianName: string,
) {
  return apiRequest<ApiBookingRequest>(
    ADMIN_BASE,
    `/bookings/${bookingId}/assign`,
    {
      method: "PATCH",
      body: {
        technicianId,
        technicianName,
      },
    },
  );
}

export function getPlantForBooking(bookingId: string) {
  return apiRequest<ApiPlant>(ADMIN_BASE, `/bookings/${bookingId}/plant`);
}