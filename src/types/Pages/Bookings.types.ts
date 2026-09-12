export type VisitFileValue = {
  name: string;
  s3key: string;
  size: number;
  type: string;
};

export type VisitFieldValue = string | number | boolean | VisitFileValue;

export interface VisitAction {
  status?: string;
  updatedAt?: string;
  reason?: string;
}
export interface BookingRequestWithVisitData extends ApiBookingRequest {
  visitData?: Record<string, VisitFieldValue> | null;
  action?: VisitAction | null;
  plantName: string;
  assignedTechnicianName: string;
  assignedTechnicianId: string;
  bookingId: string;
  rejectionReason?: string;
  reason?: string;
}

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

export type BookingRequestStatus =
  | "pending"
  | "assigned"
  | "in_progress"
  | "completed"
  | "rejected"
  | string;

  export interface RawBookingItem {
  bookingId: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  notes?: string | null;
  plantId: string;
  bookingStatus: string;
  service?: { type?: string | null; id?: string | null } | null;
  schedule?: { preferredDate?: string | null } | null;
  plant?: {
    name?: string | null;
    address?: string | null;
    capacityKw?: number | null;
  } | null;
  assignment?: {
    technicianId?: string | null;
    technicianName?: string | null;
    assignedAt?: string | null;
  } | null;
  visit?: {
    status?: string | null;
    data?: Record<string, VisitFieldValue> | null;
  } | null;
  rejection?: { reason?: string | null; updatedAt?: string | null } | null;
  payment?: {
    mode?: string | null;
    status?: string | null;
    amount?: number | null;
    updatedAt?: string | null;
  } | null;
}

export interface RawBookingListResponse {
  items: RawBookingItem[];
  count?: number;
  nextToken?: string | null;
}
