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
  | "image"
  | "document";

export interface ApiFormField {
  name: string;
  label: string;
  type: ApiFormFieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export interface ApiServiceForm {
  serviceId: string;
  title: string;
  status?: string;
  fields: ApiFormField[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiServiceFormPayload {
  title: string;
  fields: ApiFormField[];
}


export const SLOT_STATUSES = ["open", "blocked", "booked"] as const;
export type SlotStatus = (typeof SLOT_STATUSES)[number];

export interface ApiSlotOverride {
  time: string;
  status: SlotStatus;
}

// Keyed by date (e.g. "2026-09-11") -> list of slot overrides for that date.
export type ApiSlotOverrides = Record<string, ApiSlotOverride[]>;

export interface ApiService {
  slotOverrides?: ApiSlotOverrides;
  serviceId: string;
  title: string;
  icon?: string;
  price?: number;
  duration?: string;
  recommended?: boolean;
  available?: boolean;
  defaultTimes?: string[];
  unavailableDates?: string[];
}

export interface ApiSlot {
  slotId: string;
  time: string;
  status: string;
}

export type ServicesApiResponse =
  | ApiService[]
  | { items?: ApiService[] }
  | null
  | undefined;

export type DisplaySlot = ApiSlot & { isVirtual?: boolean };
export type EditableField = ApiFormField & { _key: string };