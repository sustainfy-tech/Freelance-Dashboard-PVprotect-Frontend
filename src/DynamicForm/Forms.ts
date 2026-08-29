import { apiRequest, servicesPath, ApiError } from "../api/http";
import type {
  ApiForm,
  ApiSiteVisit,
  FieldValue,
  UploadedFile,
} from "../types/Components/SitevisitForm.types";

export function getActiveForm(serviceId: string) {
  return apiRequest<ApiForm>(servicesPath(`/${serviceId}/form`));
}

export function getUploadUrl(
  serviceId: string,
  file: { name: string; type: string; size: number },
) {
  return apiRequest<{ uploadUrl: string; fileKey: string; fileUrl: string }>(
    servicesPath(`/${serviceId}/uploads`),
    { method: "POST", body: file },
  );
}

export async function uploadFileToS3(
  uploadUrl: string,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream",
    );
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error("Upload failed"));
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(file);
  });
}

export async function uploadFile(
  serviceId: string,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<UploadedFile> {
  const { uploadUrl, fileKey, fileUrl } = await getUploadUrl(serviceId, {
    name: file.name,
    type: file.type,
    size: file.size,
  });
  await uploadFileToS3(uploadUrl, file, onProgress);
  return {
    key: fileKey,
    url: fileUrl,
    name: file.name,
    type: file.type,
    size: file.size,
  };
}

export function submitSiteVisit(
  serviceId: string,
  payload: { formVersion: number; answers: Record<string, FieldValue> },
) {
  return apiRequest<ApiSiteVisit>(servicesPath(`/${serviceId}/site-visits`), {
    method: "POST",
    body: payload,
  });
}

export { ApiError };
