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
  name: string;
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

export type FieldValue =
  | string
  | number
  | boolean
  | UploadedFile[]
  | LocationValue
  | null;

export interface ApiForm {
  serviceId: string;
  title: string;
  status: "draft" | "published";
  fields: ApiFormField[];
  createdAt: string;
  publishedAt?: string;
}

export interface ApiSiteVisit {
  visitId: string;
  serviceId: string;
  formVersion: number;
  answers: Record<string, FieldValue>;
  status: "submitted" | "pending" | "rejected";
  submittedAt: string;
}

export interface ValidationErrorResponse {
  message: string;
  errors: Record<string, string>;
}
