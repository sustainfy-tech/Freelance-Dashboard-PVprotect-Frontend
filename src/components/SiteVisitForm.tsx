import { useEffect, useState } from "react";
import FormField from "../DynamicForm/Formfield";
import { getActiveForm, submitSiteVisit } from "../api/forms";
import type {
  ApiForm,
  FieldValue,
} from "../types/Components/SitevisitForm.types";

export default function SiteVisitForm({
  serviceId,
  bookingId,
}: {
  serviceId: string;
  bookingId: string;
}) {
  const [form, setForm] = useState<ApiForm | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, FieldValue>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getActiveForm(serviceId)
      .then((f) => {
        if (!cancelled) setForm(f);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const apiErr = err as { message?: string };
          setLoadError(apiErr?.message ?? "Failed to load form.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [serviceId]);

  function handleChange(name: string, value: FieldValue) {
    setAnswers((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const rest = { ...prev };
      delete rest[name];
      return rest;
    });
  }

  async function handleSubmit() {
    if (!form) return;
    setSubmitting(true);
    setErrors({});
    try {
      await submitSiteVisit(serviceId, bookingId, answers);
      setSubmitted(true);
    } catch (err: unknown) {
      const apiErr = err as {
        errors?: Record<string, string>;
        message?: string;
      };
      if (apiErr?.errors) {
        setErrors(apiErr.errors);
      } else {
        setErrors({ _form: apiErr?.message ?? "Submission failed." });
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loadError) return <p className="text-danger">{loadError}</p>;
  if (!form) return <p className="text-faint">Loading form…</p>;
  if (submitted) return <p className="text-teal">Site visit submitted.</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">{form.title}</h2>

      {form.fields.map((field) => (
        <FormField
          key={field.fieldId}
          serviceId={serviceId}
          field={field}
          value={answers[field.name]}
          error={errors[field.name]}
          onChange={(v) => handleChange(field.name, v)}
        />
      ))}

      {errors._form && <p className="text-danger">{errors._form}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="rounded-sm bg-teal px-4 py-2 font-mono text-[11px] uppercase tracking-wide text-white disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Submit"}
      </button>
    </div>
  );
}
