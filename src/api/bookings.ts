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



// {
//   "bookingId": {
//     "S": "2c3d6767-9d8d-423b-bb08-9a2a714526c6"
//   },
//   "assignment": {
//     "M": {
//       "technicianId": {
//         "NULL": true
//       },
//       "technicianName": {
//         "NULL": true
//       }
//     }
//   },
//   "bookingStatus": {
//     "S": "pending"
//   },
//   "createdAt": {
//     "S": "2026-09-08T09:54:13.453Z"
//   },
//   "notes": {
//     "S": "Preferred slot: 04:00 PM"
//   },
//   "payment": {
//     "M": {
//       "amount": {
//         "N": "5000"
//       },
//       "mode": {
//         "NULL": true
//       },
//       "status": {
//         "S": "unpaid"
//       },
//       "updatedAt": {
//         "NULL": true
//       }
//     }
//   },
//   "plant": {
//     "M": {
//       "address": {
//         "S": "Bqb"
//       },
//       "capacityKw": {
//         "N": "616"
//       },
//       "name": {
//         "S": "Lol"
//       }
//     }
//   },
//   "plantId": {
//     "S": "d09e0fc5-bfb2-421f-a534-17768ff5ef3b"
//   },
//   "rejection": {
//     "M": {
//       "reason": {
//         "NULL": true
//       },
//       "updatedAt": {
//         "NULL": true
//       }
//     }
//   },
//   "schedule": {
//     "M": {
//       "preferredDate": {
//         "S": "2026-09-11"
//       }
//     }
//   },
//   "service": {
//     "M": {
//       "id": {
//         "S": "svc_440ff712-5ae8-4ec5-b4c5-a81775a36242"
//       },
//       "type": {
//         "S": "Solar Panel Cleaning"
//       }
//     }
//   },
//   "updatedAt": {
//     "S": "2026-09-08T09:54:13.453Z"
//   },
//   "userId": {
//     "S": "pva53fdef59"
//   },
//   "visit": {
//     "M": {
//       "data": {
//         "NULL": true
//       },
//       "status": {
//         "S": "not_started"
//       }
//     }
//   }
// }