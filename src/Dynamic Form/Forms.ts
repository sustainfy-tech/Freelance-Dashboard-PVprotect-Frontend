import type { ApiForm, ApiSiteVisit, FieldValue, UploadedFile, ValidationErrorResponse } from "../types/Formtypes";

// Adjust this to match however your existing api/services.ts resolves its
// base URL / auth headers — kept minimal here since that file wasn't shared.
const BASE = import.meta.env.VITE_API_BASE_URL ?? "";

async function handle<T>(res: Response): Promise<T> {
  if (res.ok) return res.json() as Promise<T>;
  let body: Partial<ValidationErrorResponse> = {};
  try {
    body = await res.json();
  } catch {
    // response had no JSON body
  }
  const err = new Error(body.message ?? `Request failed (${res.status})`) as Error & {
    fieldErrors?: Record<string, string>;
  };
  if (body.errors) err.fieldErrors = body.errors;
  throw err;
}

/** GET the currently published (active) form schema for a service. */
export function getActiveForm(serviceId: string): Promise<ApiForm> {
  return fetch(`${BASE}/services/${serviceId}/form`).then((r) => handle<ApiForm>(r));
}

/** Ask the backend for a presigned S3 PUT url for one file. */
export function getUploadUrl(
  serviceId: string,
  file: { name: string; type: string; size: number }
): Promise<{ uploadUrl: string; fileKey: string; fileUrl: string }> {
  return fetch(`${BASE}/services/${serviceId}/uploads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(file),
  }).then((r) => handle(r));
}

/** PUT the raw file bytes straight to S3 using the presigned url. */
export async function uploadFileToS3(
  uploadUrl: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("Upload failed")));
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(file);
  });
}

/** Convenience wrapper: request a presigned url, upload, return the stored file reference. */
export async function uploadFile(
  serviceId: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<UploadedFile> {
  const { uploadUrl, fileKey, fileUrl } = await getUploadUrl(serviceId, {
    name: file.name,
    type: file.type,
    size: file.size,
  });
  await uploadFileToS3(uploadUrl, file, onProgress);
  return { key: fileKey, url: fileUrl, name: file.name, type: file.type, size: file.size };
}

/** Submit a completed site visit, pinned to the exact form version the technician filled in. */
export function submitSiteVisit(
  serviceId: string,
  payload: { formVersion: number; answers: Record<string, FieldValue> }
): Promise<ApiSiteVisit> {
  return fetch(`${BASE}/services/${serviceId}/site-visits`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((r) => handle<ApiSiteVisit>(r));
}