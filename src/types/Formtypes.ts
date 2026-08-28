// // Types for the Dynamic Form Renderer + Site Visit submission feature.
// // Merge these into your existing `api/types.ts` alongside ApiService / ApiSlot —
// // kept in a separate file here only so nothing in your existing file is overwritten.

export type FormFieldType =
  | "text"
  | "number"
  | "textarea"
  | "select"
  | "boolean"
  | "date"
  | "image"
  | "file"
  | "location"
  | "signature";

export interface ApiFormField {
  fieldId: string;
  name:string;
  type: FormFieldType;
  label: string;
  helpText?: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  min?: number; 
  max?: number;
  minLength?: number; 
  maxLength?: number; 
  pattern?: string;
  accept?: string; 
  maxFiles?: number; 
}

// /** The published, versioned form schema for a service — GET /services/:id/form. */
// export interface ApiForm {
//   formId: string;
//   serviceId: string;
//   version: number;
//   title?: string;
//   fields: ApiFormField[];
//   createdAt: string;
// }

export interface UploadedFile {
  key: string;
  url: string;
  name: string;
  type: string;
  size: number;
}

export interface LocationValue {
  lat: number;
  lng: number;
  accuracy?: number;
}

export type FieldValue = string | number | boolean | UploadedFile[] | LocationValue | null;

// /** A submitted site visit, always pinned to the exact form version it was filled against. */
export interface ApiSiteVisit {
  visitId: string;
  serviceId: string;
  formVersion: number;
  answers: Record<string, FieldValue>;
  status: "submitted" | "pending" | "rejected";
  submittedAt: string;
}

// /** Shape the backend returns on a 400 validation failure — mirrors the
//  *  client-side validator so both sides highlight the same fields. */
export interface ValidationErrorResponse {
  message: string;
  errors: Record<string, string>;
}

export interface ApiForm {
  serviceId: string;
  title: string;
  status: "draft" | "published";
  fields: ApiFormField[];
  createdAt: string;
  publishedAt?: string;
}