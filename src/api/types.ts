/**
 * These types describe what the frontend expects back from your Services
 * and Admin Bookings routers. The `[key: string]: unknown` index signature
 * means extra fields your API actually returns won't break the build — but
 * tighten these further once every controller response shape is fully
 * confirmed, so typos get caught at compile time instead of at runtime.
 */

/**
 * Real shape returned by GET /services, confirmed from a live response:
 *   {
 *     available: true,
 *     createdAt: "2026-08-18T06:47:20.325Z",
 *     duration: "2-3 hours",
 *     icon: "sunny-outline",
 *     price: 2500,
 *     recommended: true,
 *     serviceId: "svc_27312476-...",
 *     slots: [{ date, createdAt, slotId, time, status, ... }],
 *     title: "Solar Panel Cleaning",
 *     unavailableDates: ["2026-08-20"]
 *   }
 * Slots are embedded directly on the service — no separate fetch needed
 * for the common case of displaying/managing a service's slots.
 */
export interface ApiService {
  serviceId: string;
  title: string;
  icon?: string;
  duration?: string;
  price?: number;
  available: boolean;
  recommended?: boolean;
  unavailableDates: string[];
  defaultTimes?: string[];
  slots?: ApiSlot[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

/**
 * Slot shape confirmed from the same response. slotId is a composite of
 * date + time (e.g. "2026-08-20#10:00"), and each slot is a single point
 * in time rather than a start/end range.
 */
export interface ApiSlot {
  slotId: string;
  date: string;
  slots: string;
  time: string;
  status: "open" | "booked" | "blocked" | string;
  capacity?: number;
  createdAt?: string;
  [key: string]: unknown;
}

export type BookingRequestStatus =
  | "pending"
  | "assigned"
  | "in_progress"
  | "completed"
  | "rejected"
  | string;

export interface ApiBookingRequest {
  bookingId: string;
  plantId?: string;
  plantName?: string;
  plantAddress?: string;
  serviceType?: string;
  status: BookingRequestStatus;
  preferredDate?: string;
  notes?: string;
  assignedTechnicianId?: string | null;
  assignedTechnicianName?: string | null;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

/**
 * Real shape returned by the "list all plants" endpoint, confirmed from a
 * live response ({ success, data: ApiPlant[] }). There is NO per-client
 * plants endpoint — filter this array client-side by matching userId to a
 * client's verifiedUserId.
 * 
 */

export interface ApiPlantAddress {
  city?: string;
  state?: string;
  pincode?: string;
  line1?: string;
  line2?: string;
  [key: string]: unknown;
}

export interface ApiPlant {
  plantId: string;
  plantname?: string;
  userId?: string;
  address?: ApiPlantAddress;
  capacityKw?: number;
  status?: "active" | "attention" | "inactive" | string;
  installDate?: string | null;
  lastServiceDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface ApiPlantsResponse {
  success: boolean;
  data: ApiPlant[];
}

/**
 * Technician record as used for job assignment (zone/availability lookup).
 * NOTE: this is a different shape from the technician entries returned by
 * GET /app-users/all — see ApiAppUser below for that endpoint's shape.
 */
//   // | "training_completed"

export type ApprovalStatus =
  | "pending"
  |"submit_for_review"
  | "approved"
  | "rejected";

export interface ApiTechnician {
  id: string;
  name: string;
  technicians: string;
  zone?: string;
  status: "available" | "busy" | "offline" | ApprovalStatus;
  phone: string;
  email: string;
  rating: number;
  jobsCompleted: number;
  activeSince: string;
  availabilityStatus?: string;
  s3Key: string;
  documents?: ApiTechnicianDocument[];
   address?: ApiAppUserAddress;
  [key: string]: unknown;
}

export interface ApiTechnicianDocument {
  id: string;
  name: string;
  type: string;
  url?: string;
  filename?: string;
  s3Key?: string;
}
/**
 * Shape returned by GET /app-users/all, confirmed from a live response.
 * The endpoint returns BOTH clients and technicians in one array under
 * `data.technicians` (misleading key name — it's really "all app users").
 * Use `role` to tell them apart: "technician" vs everything else (e.g. "client").
 *
 * Client rows only populate the common fields below. Technician rows also
 * populate the technician-only fields (specialization, training, etc.).
 */
export interface ApiAppUserDocumentFile {
  uploadedAt?: string;
  filename?: string;
  fileName?: string;
  s3Key?: string;
  contentType?: string;
  fileSize?: number;
}

export interface ApiAppUserDocuments {
  aadhar?: ApiAppUserDocumentFile;
  "driving-licence"?: ApiAppUserDocumentFile;
  photo?: ApiAppUserDocumentFile;
}

export interface ApiAppUserAddress {
  city?: string;
  pincode?: string;
  state?: string;
}

export interface ApiAppUserTrainingModule {
  attempts?: number;
  score?: number;
  status?: "passed" | "failed" | "pending" | string;
}

export interface ApiAppUserTraining {
  cleaning?: ApiAppUserTrainingModule;
  inspection?: ApiAppUserTrainingModule;
  safety?: ApiAppUserTrainingModule;
}

export interface ApiAppUser {
  // Common to all roles
  role?: "technician" | "client" | string;
  verifiedUserId?: string;
  user_name?: string;
  user_email?: string;
  contact_number?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  documents?: ApiAppUserDocuments;

  // Technician-only fields
  driving_Licence_Number?: string;
  specialization?: string;
  has_mobile_device?: boolean;
  certifications?: string;
  address?: ApiAppUserAddress;
  date_of_birth?: string;
  availability?: string;
  training?: ApiAppUserTraining;
  Total_Experience?: string;
  has_vehicle?: boolean;
  readyForPoliceVerification?: boolean;

  [key: string]: unknown;
}

export interface ApiAppUsersResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    technicians: ApiAppUser[];
    count: number;
    nextKey: string | null;
  };
}
