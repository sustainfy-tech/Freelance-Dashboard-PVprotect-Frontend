import type { ApiAppUserAddress } from "./Client.types";
export type Tab = "technicians" | "requests";

export interface TechniciansEnvelope {
  data?: {
    technicians?: ApiTechnician[];
  } & Partial<{ [key: string]: unknown }>;
  technicians?: ApiTechnician[];
}

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

export type ApprovalStatus =
  | "pending"
  | "submit_for_review"
  | "approved"
  | "rejected";

export interface ApiTechnicianDocument {
  id: string;
  name: string;
  type: string;
  url?: string;
  filename?: string;
  s3Key?: string;
}

export interface ApiAppTechniciaTraining {
  cleaning?: ApiAppTechnicianTrainingModule;
  inspection?: ApiAppTechnicianTrainingModule;
  safety?: ApiAppTechnicianTrainingModule;
}

export interface ApiAppTechnicianTrainingModule {
  attempts?: number;
  score?: number;
  status?: "passed" | "failed" | "pending" | string;
}

export interface Props {
  technician: ApiTechnician | null;
  onClose: () => void;
  onApproved: (id: string) => void;
}

export type TechniciansResponse =
  | ApiTechnician[]
  | TechniciansEnvelope
  | null
  | undefined;

export type TechnicianRecord = ApiTechnician & Record<string, unknown>;
