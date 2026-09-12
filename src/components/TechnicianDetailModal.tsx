import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import Modal from "./Modal";
import { updateTechnicianStatus } from "../api/technicians.js";
import type {
  ApiTechnicianDocument,
  Props,
  TechnicianRecord,
} from "../types/Pages/Technicians.types.js";

const HIDDEN_KEYS = new Set(["documents"]);

function formatLabel(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function normalizeDocuments(value: unknown): ApiTechnicianDocument[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object")
    return Object.values(value) as ApiTechnicianDocument[];
  return [];
}

const s = (v: unknown, fallback = ""): string =>
  v === null || v === undefined ? fallback : String(v);

export default function TechnicianDetailModal({
  technician,
  onClose,
  onApproved,
}: Props) {
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!technician) return null;
  const tech = technician as TechnicianRecord;

  const techId = s(tech.verifiedUserId ?? tech.id);
  const techName = s(tech.user_name ?? tech.name, "Technician");

  const infoEntries = Object.entries(tech).filter(
    ([key]) => !HIDDEN_KEYS.has(key),
  );
  const documents = normalizeDocuments(tech.documents);

  async function handleApprove() {
    setApproving(true);
    setError(null);
    try {
      await updateTechnicianStatus(techId, "approved");
      onApproved(techId);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to approve technician",
      );
    } finally {
      setApproving(false);
    }
  }

  console.log("documents", documents);

  const BUCKET_NAME = "pvprotech-bucket-new";
  return (
    <Modal title={techName} onClose={onClose}>
      <div className="max-h-[70vh] space-y-6 overflow-y-auto">
        <div>
          <h3 className="mb-2 font-mono text-[11px] uppercase tracking-wide text-faint">
            Technician info
          </h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
            {infoEntries.map(([key, value]) => (
              <div key={key} className="min-w-0">
                <dt className="font-mono text-[10px] uppercase tracking-wide text-faint">
                  {formatLabel(key)}
                </dt>
                <dd className="truncate text-sm text-lo">
                  {formatValue(value)}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <h3 className="mb-2 font-mono text-[11px] uppercase tracking-wide text-faint">
            Documents
          </h3>
          {documents.length === 0 ? (
            <p className="text-sm text-faint">No documents uploaded.</p>
          ) : (
            <ul className="space-y-2">
              {documents.map((doc, idx) => {
                const url = doc?.s3Key
                  ? `https://${BUCKET_NAME}.s3.amazonaws.com/${doc.s3Key}`
                  : "";

                return (
                  <li
                    key={doc?.id ?? doc?.s3Key ?? idx}
                    className="flex items-center justify-between border border-border px-3 py-2"
                  >
                    <span className="flex items-center gap-2 text-sm text-lo">
                      <FileText size={14} className="text-faint" />
                      {doc?.name ?? doc?.type ?? doc?.filename ?? "Document"}
                    </span>

                    <button
                      onClick={() =>
                        url && window.open(url, "_blank", "noopener,noreferrer")
                      }
                      disabled={!url}
                      className="border border-border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide text-lo transition-colors hover:border-gold hover:text-gold disabled:opacity-40"
                    >
                      View doc
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {error && (
          <div className="border border-red-500/30 bg-red-500/10 px-3 py-2 font-mono text-[12px] text-red-400">
            {error}
          </div>
        )}

        {s(tech.status) === "submit_for_review" && (
          <button
            onClick={handleApprove}
            disabled={approving}
            className="flex w-full items-center justify-center gap-2 rounded-sm bg-gold px-3.5 py-2 font-mono text-[11px] font-medium uppercase tracking-wide text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {approving ? <Loader2 size={14} className="animate-spin" /> : null}
            Approve technician
          </button>
        )}
      </div>
    </Modal>
  );
}
