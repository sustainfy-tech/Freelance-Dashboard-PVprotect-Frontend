export const SLOT_STATUSES = ["open", "blocked", "booked"] as const;
export type SlotStatus = (typeof SLOT_STATUSES)[number];
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

export interface ApiFormField {
  fieldId: string;
  label: string;
  type: ApiFormFieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

export interface ApiServiceForm {
  serviceId: string;
  title: string;
  fields: ApiFormField[];
  createdAt: string;
  updatedAt?: string;
}

export interface ApiServiceFormPayload {
  title: string;
  fields: ApiFormField[];
}

export type ApiFormFieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "radio"
  | "multiselect"
  | "checkbox"
  | "date"
  | "time"
  | "email"
  | "phone"
  | "url"
  | "photo"
  | "document";
