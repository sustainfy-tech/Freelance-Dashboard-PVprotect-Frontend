export type BookingStatus =
  | "requested"
  | "assigned"
  | "en_route"
  | "in_progress"
  | "completed"
  | "payment_pending"
  | "closed"
  | "work_in_progress"
  | "rejected";

export interface AuditLogEntry {
  id: string;
  actor: string;
  actorRole: "client" | "technician" | "admin" | "system";
  action: string;
  target: string;
  timestamp: string;
  correlationId: string;
}

export type PaymentStatus =
  | "pending"
  | "received"
  | "otp_verified"
  | "verified"
  | "failed";

export type TechnicianStatus =
  | "available"
  | "on_job"
  | "off_duty"
  | "suspended";

export type ClientTier = "residential" | "commercial" | "utility";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  tier: ClientTier;
  plants: number;
  joined: string;
  status: "active" | "inactive";
  lifetimeValue: number;
}

export interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: TechnicianStatus;
  zone: string;
  rating: number;
  jobsCompleted: number;
  activeSince: string;
}

export interface Plant {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  capacityKw: number;
  panels: number;
  address: string;
  lastServiced: string;
  nextDue: string;
  healthScore: number;
}

export interface Booking {
  id: string;
  plantId: string;
  plantName: string;
  clientName: string;
  technician: string | null;
  status: BookingStatus;
  scheduledFor: string;
  createdAt: string;
  amount: number;
  serviceType: "cleaning" | "inspection" | "repair";
}

export interface Payment {
  id: string;
  bookingId: string;
  clientName: string;
  amount: number;
  status: PaymentStatus;
  otpVerified: boolean;
  method: "card" | "upi" | "bank_transfer" | "wallet";
  date: string;
}

export interface RevenuePoint {
  month: string;
  revenue: number;
  bookings: number;
}
