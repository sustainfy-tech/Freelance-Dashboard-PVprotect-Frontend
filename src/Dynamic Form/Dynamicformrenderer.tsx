// import { useEffect, useState } from "react";
// import { AlertTriangle, CheckCircle2, Send, Loader2 } from "lucide-react";
// import { useApiData } from "../../hooks/useApiData";
// import { getActiveForm, submitSiteVisit, uploadFile } from "../../api/forms";
// import type { FieldValue } from "../../api/formTypes";
// import { validateForm } from "../../utils/formValidation";
// import { LoadingState, ErrorState } from "../AsyncStates";
// import FormField from "./FormField";

// export default function DynamicFormRenderer({ serviceId }: { serviceId: string }) {
//   const { data: form, loading, error, refetch } = useApiData(() => getActiveForm(serviceId), [serviceId]);
//   const [answers, setAnswers] = useState<Record<string, FieldValue>>({});
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [submitting, setSubmitting] = useState(false);
//   const [submitted, setSubmitted] = useState(false);
//   const [submitError, setSubmitError] = useState<string | null>(null);

//   // Reset local answers whenever a different (or newly republished) form version loads —
//   // an in-progress submission should never get silently pinned to a stale version.
//   useEffect(() => {
//     setAnswers({});
//     setErrors({});
//     setSubmitted(false);
//     setSubmitError(null);
//   }, [form?.formId, form?.version]);

//   function setAnswer(fieldId: string, value: FieldValue) {
//     setAnswers((prev) => ({ ...prev, [fieldId]: value }));
//     setErrors((prev) => {
//       if (!prev[fieldId]) return prev;
//       const next = { ...prev };
//       delete next[fieldId];
//       return next;
//     });
//   }

//   async function handleSubmit() {
//     if (!form) return;
//     const localErrors = validateForm(form.fields, answers);
//     if (Object.keys(localErrors).length > 0) {
//       setErrors(localErrors);
//       const firstBad = form.fields.find((f) => localErrors[f.fieldId]);
//       firstBad && document.getElementById(`field-${firstBad.fieldId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
//       return;
//     }

//     setSubmitting(true);
//     setSubmitError(null);
//     try {
//       // Signature fields hold a raw canvas data URL until submit time — turn each
//       // into an uploaded file reference just like the image/file fields.
//       const finalAnswers: Record<string, FieldValue> = { ...answers };
//       for (const field of form.fields) {
//         const current = finalAnswers[field.fieldId];
//         if (field.type === "signature" && typeof current === "string") {
//           const blob = await (await fetch(current)).blob();
//           const file = new File([blob], `signature-${field.fieldId}.png`, { type: "image/png" });
//           finalAnswers[field.fieldId] = [await uploadFile(serviceId, file)];
//         }
//       }

//       await submitSiteVisit(serviceId, { formVersion: form.version, answers: finalAnswers });
//       setSubmitted(true);
//     } catch (e) {
//       const err = e as Error & { fieldErrors?: Record<string, string> };
//       if (err.fieldErrors) {
//         // Backend re-validated and rejected specific fields — highlight those too.
//         setErrors((prev) => ({ ...prev, ...err.fieldErrors }));
//       }
//       setSubmitError(err.message || "Could not submit this visit. Check the highlighted fields and try again.");
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   if (loading) return <LoadingState label="Loading form…" />;
//   if (error) return <ErrorState message={error} onRetry={refetch} />;
//   if (!form) return null;

//   if (submitted) {
//     return (
//       <div className="flex flex-col items-center gap-2 rounded-sm border border-teal-dim/40 bg-teal-soft px-4 py-8 text-center">
//         <CheckCircle2 size={22} className="text-teal" />
//         <p className="font-mono text-[12px] uppercase tracking-wide text-teal">Submitted successfully</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       {form.title && <h2 className="text-lg font-medium text-hi">{form.title}</h2>}
//       <p className="font-mono text-[10.5px] uppercase tracking-wide text-faint">Form version {form.version}</p>

//       {form.fields.map((field) => (
//         <div id={`field-${field.fieldId}`} key={field.fieldId}>
//           <FormField
//             serviceId={serviceId}
//             field={field}
//             value={answers[field.fieldId] ?? null}
//             error={errors[field.fieldId]}
//             onChange={(v) => setAnswer(field.fieldId, v)}
//           />
//         </div>
//       ))}

//       {submitError && (
//         <p className="flex items-center gap-1.5 text-[12px] text-danger">
//           <AlertTriangle size={13} /> {submitError}
//         </p>
//       )}

//       <button
//         onClick={handleSubmit}
//         disabled={submitting}
//         className="flex w-full items-center justify-center gap-1.5 rounded-sm bg-gold px-3.5 py-2.5 font-mono text-[11px] font-medium uppercase tracking-wide text-bg disabled:opacity-50"
//       >
//         {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
//         {submitting ? "Submitting…" : "Submit site visit"}
//       </button>
//     </div>
//   );
// }