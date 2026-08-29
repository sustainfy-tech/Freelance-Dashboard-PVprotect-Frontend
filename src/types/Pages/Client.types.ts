import type { ApiAppTechnicianTrainingModule } from "./Technicians.types";
export interface ClientRow {
  id: string;
  name: string;
  email: string;
  contact: string;
  plants?: number;
  joined?: string;
  payment?: number;
  status?: string;
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
  training?: ApiAppTechnicianTrainingModule;
  Total_Experience?: string;
  has_vehicle?: boolean;
  readyForPoliceVerification?: boolean;

  [key: string]: unknown;
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

export interface ApiAppUserDocumentFile {
  uploadedAt?: string;
  filename?: string;
  fileName?: string;
  s3Key?: string;
  contentType?: string;
  fileSize?: number;
}
