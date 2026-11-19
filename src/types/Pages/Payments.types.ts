export type PaymentRow = {
  rowId: string;
  bookingId: string;
  clientName: string;
  amount: number;
  method: string | null;
  date: string | null;
  status: PaymentStatus;
};

export type PaymentStatus =
  | "pending"
  | "received"
  | "otp_verified"
  | "verified"
  | "failed";

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

