import { useState, useEffect } from "react";
import { Plus, Calendar, Trash2, Power, Star, Pencil, ClipboardList, X, RefreshCw } from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import DataTable, { type Column } from "../components/DataTable";
import { ToolbarSearch } from "../components/Toolbar";
import { LoadingState, ErrorState } from "../components/AsyncStates";
import Modal from "../components/Modal";
import { useApiData } from "../hooks/useApiData";
import {
  listServices,
  createService,
  updateService,
  setServiceAvailability,
  deleteService,
  addUnavailableDate,
  removeUnavailableDate,
  listSlots,
  updateSlotStatus,
  getServiceForm,
  createServiceForm,
  updateServiceForm,
} from "../api/services";
import type { ApiService, ApiSlot } from "../api/types";
import type { ApiFormField, ApiFormFieldType, ApiServiceForm } from "../api/services";
import clsx from "clsx";

const TIME_RE = /^\d{2}:\d{2}$/;
const SLOT_STATUSES = ["open", "blocked", "booked"] as const;
type SlotStatus = (typeof SLOT_STATUSES)[number];

export default function Services() {
  const [query, setQuery] = useState("");
  const { data, loading, error, refetch } = useApiData(() => listServices(), []);
  const [detailServiceId, setDetailServiceId] = useState<string | null>(null);
  const [editServiceId, setEditServiceId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [formModalServiceId, setFormModalServiceId] = useState<string | null>(null);

  // serviceId -> form (or null once we've confirmed none exists). Undefined = not loaded yet.
  const [formsByService, setFormsByService] = useState<Record<string, ApiServiceForm | null>>({});

  const allServices = data ?? [];
  const services = allServices.filter((s) => !query || s.title?.toLowerCase().includes(query.toLowerCase()));
  const detailService = detailServiceId ? allServices.find((s) => s.serviceId === detailServiceId) ?? null : null;
  const editService = editServiceId ? allServices.find((s) => s.serviceId === editServiceId) ?? null : null;
  const formModalService = formModalServiceId
    ? allServices.find((s) => s.serviceId === formModalServiceId) ?? null
    : null;

  // Load form-existence for every service whenever the list (re)loads, so the
  // "Add form" / "Update form" label is correct without an extra click.
  useEffect(() => {
    if (!data) return;
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        data.map(async (s) => {
          const form = await getServiceForm(s.serviceId);
          return [s.serviceId, form] as const;
        })
      );
      if (!cancelled) setFormsByService(Object.fromEntries(entries));
    })();
    return () => {
      cancelled = true;
    };
  }, [data]);

  async function toggleAvailability(s: ApiService) {
    await setServiceAvailability(s.serviceId, !s.available);
    refetch();
  }

  async function handleDelete(s: ApiService) {
    if (!confirm(`Delete "${s.title}"? This can't be undone.`)) return;
    await deleteService(s.serviceId);
    refetch();
  }

  const columns: Column<ApiService>[] = [
    {
      id: "service",
      header: "Service",
      accessor: (s) => (
        <button
          className="flex items-center gap-1.5 text-left text-hi hover:text-gold"
          onClick={() => setDetailServiceId(s.serviceId)}
        >
          {s.title}
          {s.recommended && <Star size={12} className="fill-gold text-gold" />}
        </button>
      ),
    },
    {
      id: "duration",
      header: "Duration",
      accessor: (s) => <span className="font-mono text-lo">{s.duration ?? "—"}</span>,
    },
    {
      id: "price",
      header: "Price",
      accessor: (s) => <span className="font-mono">{s.price != null ? `₹${s.price.toLocaleString("en-IN")}` : "—"}</span>,
    },
    {
      id: "unavailableDates",
      header: "Unavailable dates",
      accessor: (s) => <span className="font-mono text-lo">{s.unavailableDates?.length ?? 0}</span>,
    },
    {
      id: "defaultTimesCount",
      header: "Default times",
      accessor: (s) => <span className="font-mono text-lo">{s.defaultTimes?.length ?? 0}</span>,
    },
    {
      id: "available",
      header: "Available",
      accessor: (s) => (
        <button
          onClick={() => toggleAvailability(s)}
          className={clsx(
            "flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide",
            s.available ? "border-teal-dim/40 bg-teal-soft text-teal" : "border-border bg-surface3 text-faint"
          )}
        >
          <Power size={11} /> {s.available ? "Active" : "Disabled"}
        </button>
      ),
    },
    {
      id: "form",
      header: "Form",
      accessor: (s) => {
        const loaded = Object.prototype.hasOwnProperty.call(formsByService, s.serviceId);
        const form = formsByService[s.serviceId];
        return (
          <button
            onClick={() => setFormModalServiceId(s.serviceId)}
            disabled={!loaded}
            className={clsx(
              "flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide disabled:opacity-50",
              form ? "border-teal-dim/40 bg-teal-soft text-teal" : "border-border bg-surface2 text-lo hover:text-hi"
            )}
          >
            <ClipboardList size={11} />
            {!loaded ? "Loading…" : form ? "Update form" : "Add form"}
          </button>
        );
      },
    },
    {
      id: "edit",
      header: "",
      accessor: (s) => (
        <button onClick={() => setEditServiceId(s.serviceId)} className="text-faint hover:text-hi" aria-label="Edit service">
          <Pencil size={14} />
        </button>
      ),
    },
    {
      id: "delete",
      header: "",
      accessor: (s) => (
        <button onClick={() => handleDelete(s)} className="text-faint hover:text-danger" aria-label="Delete service">
          <Trash2 size={14} />
        </button>
      ),
    },
  ];

  return (
    <div>
      <SectionHeader
        eyebrow="admin/services"
        title="Services"
        description="The service catalog clients book against — availability and slot management, wired to the Services API."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={refetch}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-sm border border-white/10 px-3.5 py-2 font-mono text-[11px] font-medium uppercase tracking-wide text-lo transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-1.5 rounded-sm bg-gold px-3.5 py-2 font-mono text-[11px] font-medium uppercase tracking-wide text-bg transition-opacity hover:opacity-90"
            >
              <Plus size={14} /> New service
            </button>
          </div>
        }
      />

      <div className="mb-4">
        <ToolbarSearch value={query} onChange={setQuery} placeholder="Search services…" />
      </div>

      {loading && <LoadingState label="Loading services…" />}
      {!loading && error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && (
        <>
          <DataTable columns={columns} rows={services} rowKey={(s) => s.serviceId} />
          <p className="mt-3 font-mono text-[11px] text-faint">
            Showing {services.length} of {allServices.length} services
          </p>
        </>
      )}

      {detailService && (
        <ServiceDetail
          service={detailService}
          onClose={() => setDetailServiceId(null)}
          onChanged={refetch}
        />
      )}

      {createOpen && (
        <CreateServiceModal
          onClose={() => setCreateOpen(false)}
          onCreated={() => {
            setCreateOpen(false);
            refetch();
          }}
        />
      )}

      {editService && (
        <EditServiceModal
          service={editService}
          onClose={() => setEditServiceId(null)}
          onSaved={() => {
            setEditServiceId(null);
            refetch();
          }}
        />
      )}

      {formModalServiceId && formModalService && (
        <ServiceFormModal
          service={formModalService}
          existingForm={formsByService[formModalServiceId] ?? null}
          onClose={() => setFormModalServiceId(null)}
          onSaved={(form) => {
            setFormsByService((prev) => ({ ...prev, [formModalServiceId]: form }));
            setFormModalServiceId(null);
          }}
        />
      )}
    </div>
  );
}

function CreateServiceModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");

  const [times, setTimes] = useState<string[]>([]);
  const [newTime, setNewTime] = useState("");
  const [timeErr, setTimeErr] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function addTime() {
    setTimeErr(null);
    if (!TIME_RE.test(newTime)) {
      setTimeErr("Use HH:mm, e.g. 09:00");
      return;
    }
    if (times.includes(newTime)) {
      setTimeErr("That time is already added.");
      return;
    }
    setTimes((prev) => [...prev, newTime].sort());
    setNewTime("");
  }

  function removeTime(t: string) {
    setTimes((prev) => prev.filter((x) => x !== t));
  }

  async function submit() {
    if (!title.trim()) {
      setErr("Title is required.");
      return;
    }
    if (!duration.trim()) {
      setErr("Duration is required.");
      return;
    }
    if (!price) {
      setErr("Price is required.");
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      await createService({
        title: title.trim(),
        icon: icon.trim() || undefined,
        price: Number(price),
        duration: duration.trim(),
        available: true,
        defaultTimes: times,
      });
      onCreated();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not create service.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="New service " onClose={onClose}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Title">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="input text-white" placeholder="Solar Panel Cleaning" />
          </Field>
          <Field label="Icon">
            <input value={icon} onChange={(e) => setIcon(e.target.value)} className="input text-white" placeholder="sunny-outline" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Price (₹)">
            <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" className="input text-white" />
          </Field>
          <Field label="Duration">
            <input value={duration} onChange={(e) => setDuration(e.target.value)} className="input text-white" placeholder="2-3 hours" />
          </Field>
        </div>

        <Field label="Default time slots">
          <div className="mb-2 flex flex-wrap gap-1.5 text-white">
            {times.length ? (
              times.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1 rounded-full border border-border bg-surface2 px-2.5 py-1 font-mono text-[11px] text-lo"
                >
                  {t}
                  <button type="button" onClick={() => removeTime(t)} className="text-faint hover:text-danger">
                    ×
                  </button>
                </span>
              ))
            ) : (
              <span className="text-[12px] text-faint">No time slots added yet</span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="input flex-1"
            />
            <button
              type="button"
              onClick={addTime}
              className="rounded-sm border border-border bg-surface2 px-3 py-2 font-mono text-[11px] uppercase text-lo hover:text-hi"
            >
              Add
            </button>
          </div>
          {timeErr && <p className="mt-1 text-[11px] text-danger">{timeErr}</p>}
        </Field>

        {err && <p className="text-[12px] text-danger">{err}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="rounded-sm border border-border px-3.5 py-2 font-mono text-[11px] uppercase tracking-wide text-lo hover:text-hi">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="rounded-sm bg-gold px-3.5 py-2 font-mono text-[11px] font-medium uppercase tracking-wide text-bg disabled:opacity-50"
          >
            {saving ? "Creating…" : "Create service"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Same shape as CreateServiceModal, but prefilled from an existing service
// and calling PATCH /services/:id via updateService() on submit.
function EditServiceModal({
  service,
  onClose,
  onSaved,
}: {
  service: ApiService;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(service.title ?? "");
  const [icon, setIcon] = useState(service.icon ?? "");
  const [price, setPrice] = useState(service.price != null ? String(service.price) : "");
  const [duration, setDuration] = useState(service.duration ?? "");

  const [times, setTimes] = useState<string[]>(service.defaultTimes ?? []);
  const [newTime, setNewTime] = useState("");
  const [timeErr, setTimeErr] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function addTime() {
    setTimeErr(null);
    if (!TIME_RE.test(newTime)) {
      setTimeErr("Use HH:mm, e.g. 09:00");
      return;
    }
    if (times.includes(newTime)) {
      setTimeErr("That time is already added.");
      return;
    }
    setTimes((prev) => [...prev, newTime].sort());
    setNewTime("");
  }

  function removeTime(t: string) {
    setTimes((prev) => prev.filter((x) => x !== t));
  }

  async function submit() {
    if (!title.trim()) {
      setErr("Title is required.");
      return;
    }
    if (!duration.trim()) {
      setErr("Duration is required.");
      return;
    }
    if (!price) {
      setErr("Price is required.");
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      await updateService(service.serviceId, {
        title: title.trim(),
        icon: icon.trim() || undefined,
        price: Number(price),
        duration: duration.trim(),
        defaultTimes: times,
      });
      onSaved();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not update service.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={`Edit ${service.title}`} onClose={onClose}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Title">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="Solar Panel Cleaning" />
          </Field>
          <Field label="Icon">
            <input value={icon} onChange={(e) => setIcon(e.target.value)} className="input" placeholder="sunny-outline" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Price (₹)">
            <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" className="input" />
          </Field>
          <Field label="Duration">
            <input value={duration} onChange={(e) => setDuration(e.target.value)} className="input" placeholder="2-3 hours" />
          </Field>
        </div>

        <Field label="Default time slots">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {times.length ? (
              times.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1 rounded-full border border-border bg-surface2 px-2.5 py-1 font-mono text-[11px] text-lo"
                >
                  {t}
                  <button type="button" onClick={() => removeTime(t)} className="text-faint hover:text-danger">
                    ×
                  </button>
                </span>
              ))
            ) : (
              <span className="text-[12px] text-faint">No time slots added yet</span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="input flex-1"
            />
            <button
              type="button"
              onClick={addTime}
              className="rounded-sm border border-border bg-surface2 px-3 py-2 font-mono text-[11px] uppercase text-lo hover:text-hi"
            >
              Add
            </button>
          </div>
          {timeErr && <p className="mt-1 text-[11px] text-danger">{timeErr}</p>}
        </Field>

        {err && <p className="text-[12px] text-danger">{err}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="rounded-sm border border-border px-3.5 py-2 font-mono text-[11px] uppercase tracking-wide text-lo hover:text-hi">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="rounded-sm bg-gold px-3.5 py-2 font-mono text-[11px] font-medium uppercase tracking-wide text-bg disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Service intake form builder — "Add form" / "Update form" modal
// ---------------------------------------------------------------------------

const FIELD_TYPES: { value: ApiFormFieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Textarea" },
  { value: "number", label: "Number" },
  { value: "select", label: "Select" },
  { value: "radio", label: "Radio" },
  { value: "multiselect", label: "Multi-select" },
  { value: "checkbox", label: "Checkbox" },
  { value: "date", label: "Date" },
  { value: "time", label: "Time" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "url", label: "URL" },
  { value: "photo", label: "Photo" },
  { value: "document", label: "Document" },
];

// Field types that need a configurable list of choices.
const OPTION_TYPES: ApiFormFieldType[] = ["select", "radio", "multiselect"];
// Field types that don't take free-text placeholder content.
const NO_PLACEHOLDER_TYPES: ApiFormFieldType[] = ["checkbox", "photo", "document"];

function genFieldId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `field_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function blankField(): ApiFormField {
  return { fieldId: genFieldId(), label: "", type: "text", required: false, placeholder: "" };
}

function ServiceFormModal({
  service,
  existingForm,
  onClose,
  onSaved,
}: {
  service: ApiService;
  existingForm: ApiServiceForm | null;
  onClose: () => void;
  onSaved: (form: ApiServiceForm) => void;
}) {
  const isEditing = !!existingForm;

  const [title, setTitle] = useState(existingForm?.title ?? `${service.title} — intake form`);
  const [fields, setFields] = useState<ApiFormField[]>(
    existingForm?.fields?.length ? existingForm.fields : [blankField()]
  );

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Draft text for the "add an option" input, per field, keyed by fieldId —
  // so each select/radio/multiselect field's option-composer is independent.
  const [newOptionByField, setNewOptionByField] = useState<Record<string, string>>({});

  function updateField(fieldId: string, patch: Partial<ApiFormField>) {
    setFields((prev) => prev.map((f) => (f.fieldId === fieldId ? { ...f, ...patch } : f)));
  }

  function addOption(fieldId: string) {
    const value = (newOptionByField[fieldId] ?? "").trim();
    if (!value) return;
    setFields((prev) =>
      prev.map((f) =>
        f.fieldId === fieldId
          ? { ...f, options: (f.options ?? []).includes(value) ? f.options : [...(f.options ?? []), value] }
          : f
      )
    );
    setNewOptionByField((prev) => ({ ...prev, [fieldId]: "" }));
  }

  function removeOption(fieldId: string, option: string) {
    setFields((prev) =>
      prev.map((f) => (f.fieldId === fieldId ? { ...f, options: (f.options ?? []).filter((o) => o !== option) } : f))
    );
  }

  function addField() {
    setFields((prev) => [...prev, blankField()]);
  }

  function removeField(fieldId: string) {
    setFields((prev) => prev.filter((f) => f.fieldId !== fieldId));
    setNewOptionByField((prev) => {
      const { [fieldId]: _drop, ...rest } = prev;
      return rest;
    });
  }

  async function submit() {
    if (!title.trim()) {
      setErr("Form title is required.");
      return;
    }
    if (fields.length === 0) {
      setErr("At least one field is required.");
      return;
    }
    for (const f of fields) {
      if (!f.label.trim()) {
        setErr("Every field needs a label.");
        return;
      }
      if (OPTION_TYPES.includes(f.type) && (!f.options || f.options.length === 0)) {
        setErr(`"${f.label}" needs at least one option.`);
        return;
      }
    }

    setSaving(true);
    setErr(null);
    try {
      const payload = {
        title: title.trim(),
        fields: fields.map((f) => ({
          ...f,
          label: f.label.trim(),
          placeholder: f.placeholder?.trim() || undefined,
        })),
      };
      const saved = isEditing
        ? await updateServiceForm(service.serviceId, payload)
        : await createServiceForm(service.serviceId, payload);
      onSaved(saved);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save form.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={isEditing ? `Update form — ${service.title}` : `Add form — ${service.title}`}
      onClose={onClose}
      widthClassName="max-w-3xl"
    >
      <div className="max-h-[70vh] space-y-4 overflow-y-auto">
        <Field label="Form title">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input text-white placeholder:text-white"
            placeholder="Intake details"
          />
        </Field>

        <div>
          <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wide text-faint">Fields</span>
          <div className="grid grid-cols-2 gap-3">
            {fields.map((f, i) => (
              <div key={f.fieldId} className="space-y-2 border border-border bg-surface2 p-3">
                <div
                  className="grid items-start gap-2"
                  style={{ gridTemplateColumns: "1fr 112px 20px" }}
                >
                  <input
                    value={f.label}
                    onChange={(e) => updateField(f.fieldId, { label: e.target.value })}
                    className="input w-full"
                    placeholder={`Field ${i + 1} label`}
                  />
                  <select
                    value={f.type}
                    onChange={(e) => updateField(f.fieldId, { type: e.target.value as ApiFormFieldType })}
                    className="input w-full"
                  >
                    {FIELD_TYPES.map((t) => (
                      <option key={t.value} value={t.value} className="text-black">
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeField(f.fieldId)}
                    disabled={fields.length === 1}
                    className="mt-2 text-faint hover:text-danger disabled:opacity-30"
                    aria-label="Remove field"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Placeholder text shown inside the field when rendered on the intake form.
                    Not applicable to checkbox or file-upload fields (photo/document). */}
                {!NO_PLACEHOLDER_TYPES.includes(f.type) && (
                  <input
                    value={f.placeholder ?? ""}
                    onChange={(e) => updateField(f.fieldId, { placeholder: e.target.value })}
                    className="input text-white placeholder:text-white"
                    placeholder="Placeholder text shown in the field (optional)"
                  />
                )}

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 font-mono text-[11px] text-lo">
                    <input
                      type="checkbox"
                      checked={!!f.required}
                      onChange={(e) => updateField(f.fieldId, { required: e.target.checked })}
                    />
                    Required
                  </label>
                </div>

                {/* Select / radio / multi-select — add choices one at a time as chips,
                    instead of a single comma-separated input. */}
                {OPTION_TYPES.includes(f.type) && (
                  <div>
                    <div className="mb-1.5 flex flex-wrap gap-1.5">
                      {(f.options ?? []).length ? (
                        (f.options ?? []).map((opt) => (
                          <span
                            key={opt}
                            className="flex items-center gap-1 rounded-full border border-border bg-surface3 px-2.5 py-1 font-mono text-[11px] text-white"
                          >
                            {opt}
                            <button
                              type="button"
                              onClick={() => removeOption(f.fieldId, opt)}
                              className="text-faint hover:text-danger"
                            >
                              ×
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="text-[12px] text-faint">No options added yet</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={newOptionByField[f.fieldId] ?? ""}
                        onChange={(e) =>
                          setNewOptionByField((prev) => ({ ...prev, [f.fieldId]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addOption(f.fieldId);
                          }
                        }}
                        className="input flex-1 text-white placeholder:text-white"
                        placeholder="e.g. Morning"
                      />
                      <button
                        type="button"
                        onClick={() => addOption(f.fieldId)}
                        className="rounded-sm border border-border bg-surface2 px-3 py-2 font-mono text-[11px] uppercase text-lo hover:text-hi"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addField}
            className="mt-2 flex items-center gap-1.5 rounded-sm border border-border bg-surface2 px-3 py-2 font-mono text-[11px] uppercase text-lo hover:text-hi"
          >
            <Plus size={12} /> Add field
          </button>
        </div>

        {err && <p className="text-[12px] text-danger">{err}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="rounded-sm border border-border px-3.5 py-2 font-mono text-[11px] uppercase tracking-wide text-lo hover:text-hi">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="rounded-sm bg-gold px-3.5 py-2 font-mono text-[11px] font-medium uppercase tracking-wide text-bg disabled:opacity-50"
          >
            {saving ? "Saving…" : isEditing ? "Update form" : "Create form"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wide text-faint">{label}</span>
      {children}
    </label>
  );
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

const STATUS_STYLES: Record<SlotStatus, string> = {
  open: "border-teal-dim/40 bg-teal-soft text-teal",
  blocked: "border-border bg-surface3 text-faint",
  booked: "border-gold/40 bg-gold/10 text-gold",
};

function SlotStatusControl({
  slot,
  busy,
  onChange,
}: {
  slot: ApiSlot;
  busy: boolean;
  onChange: (status: SlotStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const status = slot.status as SlotStatus;

  function pick(next: SlotStatus) {
    setOpen(false);
    if (next === status) return;
    if (status === "booked") {
      // Leaving a booked slot can cancel a real customer booking — confirm first.
      if (!confirm(`This slot is booked. Set it to "${next}" anyway? This will not notify the customer.`)) {
        return;
      }
    }
    onChange(next);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={busy}
        className={clsx(
          "rounded-full border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-wide disabled:opacity-50",
          STATUS_STYLES[status] ?? STATUS_STYLES.blocked
        )}
      >
        {status}
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-1 w-28 border border-border bg-surface2 shadow-lg">
          {SLOT_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => pick(s)}
              className={clsx(
                "block w-full px-2.5 py-1.5 text-left font-mono text-[10.5px] uppercase tracking-wide hover:bg-surface3",
                s === status ? "text-hi" : "text-lo"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ServiceDetail({
  service,
  onClose,
  onChanged,
}: {
  service: ApiService;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [newDate, setNewDate] = useState("");
  const [busy, setBusy] = useState(false);

  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [daySlots, setDaySlots] = useState<ApiSlot[]>([]);
  const [daySlotsLoading, setDaySlotsLoading] = useState(false);

  // const defaultTimes = service.defaultTimes ?? [];

  // Fetch computed slots whenever the selected date changes (or after any update)
  useEffect(() => {
    let cancelled = false;
    setDaySlotsLoading(true);
    listSlots(service.serviceId, selectedDate)
      .then((slots: ApiSlot[]) => {
        if (!cancelled) setDaySlots(slots);
      })
      .finally(() => {
        if (!cancelled) setDaySlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [service.serviceId, selectedDate, service.defaultTimes]);

  async function refetchDay() {
    const slots = await listSlots(service.serviceId, selectedDate);
    setDaySlots(slots);
  }

  async function addDate() {
    if (!newDate) return;
    setBusy(true);
    try {
      await addUnavailableDate(service.serviceId, newDate);
      setNewDate("");
      onChanged();
      await refetchDay();
    } finally {
      setBusy(false);
    }
  }

  async function removeDate(date: string) {
    setBusy(true);
    try {
      await removeUnavailableDate(service.serviceId, date);
      onChanged();
      await refetchDay();
    } finally {
      setBusy(false);
    }
  }

  async function setSlotStatus(slot: ApiSlot, status: SlotStatus) {
    setBusy(true);
    try {
      await updateSlotStatus(service.serviceId, slot.slotId, status);
      await refetchDay();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={service.title} onClose={onClose}>
      <div className="max-h-[70vh] space-y-6 overflow-y-auto">
        {/* Unavailable dates — whole days off, unchanged */}
        <section>
          <p className="mb-2 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-faint">
            <Calendar size={12} /> Unavailable dates
          </p>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {service.unavailableDates?.length ? (
              service.unavailableDates.map((d) => (
                <span
                  key={d}
                  className="flex items-center gap-1 rounded-full border border-border bg-surface2 px-2.5 py-1 font-mono text-[11px] text-lo"
                >
                  {new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  <button onClick={() => removeDate(d)} disabled={busy} className="text-faint hover:text-danger">
                    ×
                  </button>
                </span>
              ))
            ) : (
              <span className="text-[12px] text-faint">None set</span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="input flex-1"
            />
            <button
              onClick={addDate}
              disabled={busy}
              className="rounded-sm border border-border bg-surface2 px-3 py-2 font-mono text-[11px] uppercase text-lo hover:text-hi disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </section>

        {/* Default time slots — read-only display of the recurring template.
            Editing lives in the Edit modal now (title/icon/price/duration/
            defaultTimes); use "Manage a day" below for per-day exceptions. */}
        {/* <section>
          <p className="mb-2 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-faint">
            <Clock size={12} /> Default time slots
          </p>
          <div className="border border-border bg-surface2">
            {defaultTimes.length ? (
              defaultTimes.map((t, i) => (
                <div
                  key={t}
                  className={clsx(
                    "px-3 py-2",
                    i !== defaultTimes.length - 1 && "border-b border-border"
                  )}
                >
                  <span className="font-mono text-[12px] text-hi">{t}</span>
                </div>
              ))
            ) : (
              <p className="px-3 py-3 text-[12px] text-faint">No default times set.</p>
            )}
          </div>
        </section> */}

        {/* Per-day view — pick a date, set open/blocked/booked per slot as an exception */}
        <section>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-faint">Manage a day</p>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input mb-3 w-full"
          />

          {daySlotsLoading && <p className="text-[12px] text-faint">Loading slots…</p>}

          {!daySlotsLoading && (
            <div className="space-y-1.5">
              {daySlots.map((slot) => (
                <div key={slot.slotId} className="flex items-center justify-between border border-border bg-surface2 px-3 py-2">
                  <span className="font-mono text-[12px] text-hi">{slot.time}</span>
                  <SlotStatusControl
                    slot={slot}
                    busy={busy}
                    onChange={(status) => setSlotStatus(slot, status)}
                  />
                </div>
              ))}
              {daySlots.length === 0 && (
                <p className="text-[12px] text-faint">No default times set — add some above.</p>
              )}
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
}