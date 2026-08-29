import { useState } from "react";
import { UploadCloud, MapPin, X, Loader2, Check } from "lucide-react";
import clsx from "clsx";
import type {
  ApiFormField,
  FieldValue,
  LocationValue,
  UploadedFile,
} from "../types/Components/SitevisitForm.types";
import { uploadFile } from "../DynamicForm/Forms";
import SignaturePad from "../DynamicForm/Signaturepad";

export default function FormField({
  serviceId,
  field,
  value,
  error,
  onChange,
}: {
  serviceId: string;
  field: ApiFormField;
  value: FieldValue;
  error?: string;
  onChange: (value: FieldValue) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [locating, setLocating] = useState(false);

  const inputClasses = clsx(
    "input w-full",
    error && "border-danger/60 focus:border-danger/60",
  );

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    setUploadPct(0);
    try {
      const existing = (value as UploadedFile[]) ?? [];
      const uploaded: UploadedFile[] = [];
      for (const file of Array.from(fileList)) {
        uploaded.push(await uploadFile(serviceId, file, setUploadPct));
      }
      onChange(field.maxFiles === 1 ? uploaded : [...existing, ...uploaded]);
    } catch {
    } finally {
      setUploading(false);
    }
  }

  function removeFile(key: string) {
    const existing = (value as UploadedFile[]) ?? [];
    onChange(existing.filter((f) => f.key !== key));
  }

  function captureLocation() {
    if (!("geolocation" in navigator)) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: LocationValue = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        onChange(loc);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 font-mono text-[11px] uppercase tracking-wide text-faint">
        {field.label}
        {field.required && <span className="text-danger">*</span>}
      </span>

      {field.type === "text" && (
        <input
          className={inputClasses}
          value={(value as string) ?? ""}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.type === "textarea" && (
        <textarea
          className={clsx(inputClasses, "min-h-22 resize-y")}
          value={(value as string) ?? ""}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.type === "number" && (
        <input
          type="number"
          className={inputClasses}
          value={value == null ? "" : (value as number)}
          min={field.min}
          max={field.max}
          onChange={(e) =>
            onChange(e.target.value === "" ? null : Number(e.target.value))
          }
        />
      )}

      {field.type === "date" && (
        <input
          type="date"
          className={inputClasses}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.type === "select" && (
        <select
          className={inputClasses}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="" disabled>
            Choose…
          </option>
          {(field.options ?? []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}

      {field.type === "boolean" && (
        <button
          type="button"
          onClick={() => onChange(!value)}
          className={clsx(
            "flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide",
            value
              ? "border-teal-dim/40 bg-teal-soft text-teal"
              : "border-border bg-surface3 text-faint",
          )}
        >
          {value ? <Check size={12} /> : null}
          {value ? "Yes" : "No"}
        </button>
      )}

      {(field.type === "image" || field.type === "file") && (
        <div>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {((value as UploadedFile[]) ?? []).map((f) => (
              <span
                key={f.key}
                className="flex items-center gap-1 rounded-full border border-border bg-surface2 px-2.5 py-1 font-mono text-[11px] text-lo"
              >
                {f.name}
                <button
                  type="button"
                  onClick={() => removeFile(f.key)}
                  className="text-faint hover:text-danger"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
          <label
            className={clsx(
              "flex cursor-pointer items-center justify-center gap-1.5 rounded-sm border border-dashed border-border bg-surface2 px-3 py-3 font-mono text-[11px] uppercase tracking-wide text-lo hover:text-hi",
              uploading && "pointer-events-none opacity-60",
            )}
          >
            {uploading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <UploadCloud size={14} />
            )}
            {uploading
              ? `Uploading… ${uploadPct}%`
              : field.type === "image"
                ? "Add photo"
                : "Add file"}
            <input
              type="file"
              accept={
                field.accept ?? (field.type === "image" ? "image/*" : undefined)
              }
              multiple={field.maxFiles !== 1}
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        </div>
      )}

      {field.type === "location" && (
        <div>
          {value && (
            <div className="mb-2 flex items-center gap-1.5 font-mono text-[11px] text-lo">
              <MapPin size={12} className="text-teal" />
              {(value as LocationValue).lat.toFixed(5)},{" "}
              {(value as LocationValue).lng.toFixed(5)}
            </div>
          )}
          <button
            type="button"
            onClick={captureLocation}
            disabled={locating}
            className="flex items-center gap-1.5 rounded-sm border border-border bg-surface2 px-3 py-2 font-mono text-[11px] uppercase tracking-wide text-lo hover:text-hi disabled:opacity-50"
          >
            {locating ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <MapPin size={12} />
            )}
            {value ? "Recapture location" : "Capture location"}
          </button>
        </div>
      )}

      {field.type === "signature" && (
        <SignaturePad onChange={(dataUrl) => onChange(dataUrl)} />
      )}

      {field.helpText && !error && (
        <p className="mt-1 text-[11px] text-faint">{field.helpText}</p>
      )}
      {error && <p className="mt-1 text-[11px] text-danger">{error}</p>}
    </label>
  );
}
