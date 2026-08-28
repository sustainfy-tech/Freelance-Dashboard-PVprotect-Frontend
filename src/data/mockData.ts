import type {
  Client,
  Technician,
  Plant,
  Booking,
  Payment,
  AuditLogEntry,
  RevenuePoint,
} from "../types";

export const clients: Client[] = [
  { id: "CL-1042", name: "Rohan Deshmukh", email: "rohan.d@gmail.com", phone: "+91 98221 34455", tier: "residential", plants: 1, joined: "2024-11-02", status: "active", lifetimeValue: 18400 },
  { id: "CL-1043", name: "Meridian Textiles Pvt Ltd", email: "ops@meridiantex.in", phone: "+91 90210 88110", tier: "commercial", plants: 4, joined: "2024-08-14", status: "active", lifetimeValue: 412000 },
  { id: "CL-1044", name: "Aditi Kulkarni", email: "aditi.kulkarni@outlook.com", phone: "+91 88888 11223", tier: "residential", plants: 1, joined: "2025-01-19", status: "active", lifetimeValue: 9200 },
  { id: "CL-1045", name: "Sunrise Solar Utility Co-op", email: "admin@sunriseutility.coop", phone: "+91 79999 22110", tier: "utility", plants: 12, joined: "2023-06-30", status: "active", lifetimeValue: 1840000 },
  { id: "CL-1046", name: "Vikram Rathod", email: "vikram.rathod@yahoo.com", phone: "+91 97654 33210", tier: "residential", plants: 2, joined: "2025-03-05", status: "active", lifetimeValue: 15600 },
  { id: "CL-1047", name: "Greenfield Warehousing", email: "facilities@greenfieldwh.com", phone: "+91 90112 44556", tier: "commercial", plants: 3, joined: "2024-12-11", status: "inactive", lifetimeValue: 76000 },
  { id: "CL-1048", name: "Priya Nair", email: "priya.nair@gmail.com", phone: "+91 96334 77812", tier: "residential", plants: 1, joined: "2025-05-22", status: "active", lifetimeValue: 4100 },
  { id: "CL-1049", name: "Deccan Cold Storage", email: "contact@deccancold.in", phone: "+91 88112 99001", tier: "commercial", plants: 2, joined: "2024-09-27", status: "active", lifetimeValue: 154000 },
];

export const technicians: Technician[] = [
  { id: "TC-201", name: "Suresh Patil", email: "suresh.p@pvprotect.in", phone: "+91 90909 12345", status: "on_job", zone: "Pune West", rating: 4.8, jobsCompleted: 312, activeSince: "2023-02-11" },
  { id: "TC-202", name: "Farhan Sheikh", email: "farhan.s@pvprotect.in", phone: "+91 91234 56780", status: "available", zone: "Pune East", rating: 4.6, jobsCompleted: 201, activeSince: "2023-07-19" },
  { id: "TC-203", name: "Ganesh Jadhav", email: "ganesh.j@pvprotect.in", phone: "+91 92345 61234", status: "available", zone: "Pimpri-Chinchwad", rating: 4.9, jobsCompleted: 405, activeSince: "2022-11-04" },
  { id: "TC-204", name: "Imran Qureshi", email: "imran.q@pvprotect.in", phone: "+91 93456 71234", status: "off_duty", zone: "Hinjewadi", rating: 4.4, jobsCompleted: 156, activeSince: "2024-01-22" },
  { id: "TC-205", name: "Ravindra Shinde", email: "ravindra.s@pvprotect.in", phone: "+91 94567 81234", status: "on_job", zone: "Kothrud", rating: 4.7, jobsCompleted: 278, activeSince: "2023-04-30" },
  { id: "TC-206", name: "Amol Chavan", email: "amol.c@pvprotect.in", phone: "+91 95678 91234", status: "suspended", zone: "Wagholi", rating: 3.9, jobsCompleted: 89, activeSince: "2024-06-08" },
];

export const plants: Plant[] = [
  { id: "PLT-501", name: "Deshmukh Residence Rooftop", clientId: "CL-1042", clientName: "Rohan Deshmukh", capacityKw: 5.4, panels: 14, address: "Baner, Pune", lastServiced: "2026-07-02", nextDue: "2026-09-02", healthScore: 92 },
  { id: "PLT-502", name: "Meridian Unit A Roof Array", clientId: "CL-1043", clientName: "Meridian Textiles Pvt Ltd", capacityKw: 120, panels: 312, address: "MIDC Bhosari, Pune", lastServiced: "2026-08-01", nextDue: "2026-09-01", healthScore: 87 },
  { id: "PLT-503", name: "Meridian Unit B Ground Mount", clientId: "CL-1043", clientName: "Meridian Textiles Pvt Ltd", capacityKw: 80, panels: 208, address: "MIDC Bhosari, Pune", lastServiced: "2026-08-01", nextDue: "2026-09-01", healthScore: 90 },
  { id: "PLT-504", name: "Kulkarni Terrace Array", clientId: "CL-1044", clientName: "Aditi Kulkarni", capacityKw: 3.2, panels: 8, address: "Kothrud, Pune", lastServiced: "2026-06-18", nextDue: "2026-08-18", healthScore: 78 },
  { id: "PLT-505", name: "Sunrise Feeder Station 4", clientId: "CL-1045", clientName: "Sunrise Solar Utility Co-op", capacityKw: 950, panels: 2480, address: "Solapur Highway", lastServiced: "2026-08-10", nextDue: "2026-09-10", healthScore: 95 },
  { id: "PLT-506", name: "Sunrise Feeder Station 7", clientId: "CL-1045", clientName: "Sunrise Solar Utility Co-op", capacityKw: 780, panels: 2040, address: "Solapur Highway", lastServiced: "2026-07-29", nextDue: "2026-08-29", healthScore: 83 },
  { id: "PLT-507", name: "Rathod Farmhouse Array", clientId: "CL-1046", clientName: "Vikram Rathod", capacityKw: 6.0, panels: 16, address: "Lonavala Road", lastServiced: "2026-08-05", nextDue: "2026-10-05", healthScore: 88 },
  { id: "PLT-508", name: "Deccan Cold Storage Roof", clientId: "CL-1049", clientName: "Deccan Cold Storage", capacityKw: 45, panels: 118, address: "Katraj, Pune", lastServiced: "2026-07-14", nextDue: "2026-08-14", healthScore: 65 },
];

export const bookings: Booking[] = [
  { id: "BK-9001", plantId: "PLT-508", plantName: "Deccan Cold Storage Roof", clientName: "Deccan Cold Storage", technician: "Ganesh Jadhav", status: "in_progress", scheduledFor: "2026-08-18T10:00:00", createdAt: "2026-08-15T09:12:00", amount: 8200, serviceType: "cleaning" },
  { id: "BK-9002", plantId: "PLT-502", plantName: "Meridian Unit A Roof Array", clientName: "Meridian Textiles Pvt Ltd", technician: "Suresh Patil", status: "assigned", scheduledFor: "2026-08-19T08:30:00", createdAt: "2026-08-16T11:40:00", amount: 24500, serviceType: "cleaning" },
  { id: "BK-9003", plantId: "PLT-504", plantName: "Kulkarni Terrace Array", clientName: "Aditi Kulkarni", technician: null, status: "requested", scheduledFor: "2026-08-21T09:00:00", createdAt: "2026-08-17T14:05:00", amount: 2100, serviceType: "inspection" },
  { id: "BK-9004", plantId: "PLT-505", plantName: "Sunrise Feeder Station 4", clientName: "Sunrise Solar Utility Co-op", technician: "Ravindra Shinde", status: "payment_pending", scheduledFor: "2026-08-17T07:00:00", createdAt: "2026-08-12T10:00:00", amount: 68000, serviceType: "cleaning" },
  { id: "BK-9005", plantId: "PLT-501", plantName: "Deshmukh Residence Rooftop", clientName: "Rohan Deshmukh", technician: "Farhan Sheikh", status: "closed", scheduledFor: "2026-08-10T09:00:00", createdAt: "2026-08-07T16:20:00", amount: 1800, serviceType: "cleaning" },
  { id: "BK-9006", plantId: "PLT-507", plantName: "Rathod Farmhouse Array", clientName: "Vikram Rathod", technician: null, status: "rejected", scheduledFor: "2026-08-20T11:00:00", createdAt: "2026-08-16T08:50:00", amount: 2600, serviceType: "repair" },
  { id: "BK-9007", plantId: "PLT-506", plantName: "Sunrise Feeder Station 7", clientName: "Sunrise Solar Utility Co-op", technician: "Suresh Patil", status: "en_route", scheduledFor: "2026-08-18T13:00:00", createdAt: "2026-08-14T09:30:00", amount: 54000, serviceType: "cleaning" },
  { id: "BK-9008", plantId: "PLT-503", plantName: "Meridian Unit B Ground Mount", clientName: "Meridian Textiles Pvt Ltd", technician: "Ravindra Shinde", status: "completed", scheduledFor: "2026-08-16T09:00:00", createdAt: "2026-08-11T12:15:00", amount: 19800, serviceType: "cleaning" },
  { id: "BK-9009", plantId: "PLT-508", plantName: "Deccan Cold Storage Roof", clientName: "Deccan Cold Storage", technician: "Ganesh Jadhav", status: "closed", scheduledFor: "2026-07-14T10:00:00", createdAt: "2026-07-10T09:00:00", amount: 7600, serviceType: "cleaning" },
  { id: "BK-9010", plantId: "PLT-502", plantName: "Meridian Unit A Roof Array", clientName: "Meridian Textiles Pvt Ltd", technician: null, status: "requested", scheduledFor: "2026-08-23T08:00:00", createdAt: "2026-08-17T18:02:00", amount: 24500, serviceType: "inspection" },
];

export const payments: Payment[] = [
  { id: "PAY-7001", bookingId: "BK-9005", clientName: "Rohan Deshmukh", amount: 1800, status: "verified", otpVerified: true, method: "upi", date: "2026-08-10T11:20:00" },
  { id: "PAY-7002", bookingId: "BK-9008", clientName: "Meridian Textiles Pvt Ltd", amount: 19800, status: "received", otpVerified: false, method: "bank_transfer", date: "2026-08-16T15:40:00" },
  { id: "PAY-7003", bookingId: "BK-9004", clientName: "Sunrise Solar Utility Co-op", amount: 68000, status: "pending", otpVerified: false, method: "bank_transfer", date: "2026-08-17T09:00:00" },
  { id: "PAY-7004", bookingId: "BK-9009", clientName: "Deccan Cold Storage", amount: 7600, status: "verified", otpVerified: true, method: "card", date: "2026-07-14T13:10:00" },
  { id: "PAY-7005", bookingId: "BK-9001", clientName: "Deccan Cold Storage", amount: 8200, status: "otp_verified", otpVerified: true, method: "upi", date: "2026-08-18T10:45:00" },
  { id: "PAY-7006", bookingId: "BK-9006", clientName: "Vikram Rathod", amount: 2600, status: "failed", otpVerified: false, method: "wallet", date: "2026-08-16T09:05:00" },
];

export const auditLogs: AuditLogEntry[] = [
  { id: "AL-30012", actor: "Admin: S. Kulkarni", actorRole: "admin", action: "ASSIGNED_TECHNICIAN", target: "BK-9002 → Suresh Patil", timestamp: "2026-08-16T11:41:12", correlationId: "corr-88a1" },
  { id: "AL-30011", actor: "System", actorRole: "system", action: "PAYMENT_OTP_SENT", target: "PAY-7005 (BK-9001)", timestamp: "2026-08-18T10:44:02", correlationId: "corr-77f3" },
  { id: "AL-30010", actor: "Technician: Ganesh Jadhav", actorRole: "technician", action: "WORK_STARTED", target: "BK-9001", timestamp: "2026-08-18T10:02:55", correlationId: "corr-77f3" },
  { id: "AL-30009", actor: "Technician: Amol Chavan", actorRole: "technician", action: "BOOKING_REJECTED", target: "BK-9006", timestamp: "2026-08-16T09:02:40", correlationId: "corr-65c2" },
  { id: "AL-30008", actor: "Admin: R. Mehta", actorRole: "admin", action: "REASSIGN_REQUESTED", target: "BK-9006", timestamp: "2026-08-16T09:03:10", correlationId: "corr-65c2" },
  { id: "AL-30007", actor: "Client: Aditi Kulkarni", actorRole: "client", action: "BOOKING_CREATED", target: "BK-9003", timestamp: "2026-08-17T14:05:22", correlationId: "corr-51d9" },
  { id: "AL-30006", actor: "System", actorRole: "system", action: "PAYMENT_VERIFIED", target: "PAY-7001 (BK-9005)", timestamp: "2026-08-10T11:22:47", correlationId: "corr-40a7" },
  { id: "AL-30005", actor: "Client: Rohan Deshmukh", actorRole: "client", action: "SERVICE_REVIEW_SUBMITTED", target: "BK-9005 — 5 stars", timestamp: "2026-08-10T11:25:03", correlationId: "corr-40a7" },
  { id: "AL-30004", actor: "Admin: S. Kulkarni", actorRole: "admin", action: "PLANT_ADDED", target: "PLT-508 · Deccan Cold Storage Roof", timestamp: "2026-08-01T10:15:00", correlationId: "corr-22e0" },
  { id: "AL-30003", actor: "System", actorRole: "system", action: "AUTH_LOGIN_FAILED", target: "admin: r.mehta@pvprotect.in (3rd attempt)", timestamp: "2026-08-17T08:55:19", correlationId: "corr-11b6" },
];

export const revenueSeries: RevenuePoint[] = [
  { month: "Mar", revenue: 412000, bookings: 61 },
  { month: "Apr", revenue: 468000, bookings: 68 },
  { month: "May", revenue: 501000, bookings: 74 },
  { month: "Jun", revenue: 489000, bookings: 71 },
  { month: "Jul", revenue: 556000, bookings: 82 },
  { month: "Aug", revenue: 402000, bookings: 59 },
];

export const bookingStatusBreakdown = [
  { status: "Requested", count: 2, color: "#9AA5B1" },
  { status: "Assigned", count: 1, color: "#E3A542" },
  { status: "En route / In progress", count: 2, color: "#E3A542" },
  { status: "Payment pending", count: 1, color: "#F0555B" },
  { status: "Completed / Closed", count: 3, color: "#2FD6C4" },
  { status: "Rejected", count: 1, color: "#5B6572" },
];
