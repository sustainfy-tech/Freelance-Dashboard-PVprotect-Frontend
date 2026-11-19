export type Booking = {
  id: string;
  plantName: string;
  address?: string;
  clientName: string;
  status: string;
};

export type MonthlyRevenue = {
  month: string;
  revenue: number;
  bookings: number;
};

export type ApiBookingItem = {
  bookingId?: string;
  name?: string;
  userId?: string;
  id?: string;
  bookingStatus?: string;
  status?: string;
  updatedAt?: string | null;
  payment?: {
    amount?: number;
    finalAmount?: number;
    status?: string;
    updatedAt?: string | null;
  };
  plant?: {
    name?: string;
    address?: string;
    plantOwnerName?: string;
    plantOwnerContact?: string;
    verifiedUserName?: string;
    userId?: string;
  };
  clientName?: string;
  userName?: string;
  user?: { name?: string };
};

export type TechnicianLite = {
  status?: string;
  onDuty?: boolean;
};

export type PipelineRaw = {
  status: string;
  value: string;
  count: number;
};