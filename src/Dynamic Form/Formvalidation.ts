import type { ApiFormField, FieldValue, LocationValue, UploadedFile } from "../types/Formtypes";

/** Validates a single answer against its field definition. Returns an error message, or null if valid. */
export function validateField(field: ApiFormField, value: FieldValue): string | null {
  const isEmpty =
    value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0);

  if (field.required && isEmpty) {
    return "This field is required.";
  }
  if (isEmpty) return null; // optional and empty — nothing else to check

  switch (field.type) {
    case "text":
    case "textarea": {
      const str = String(value);
      if (field.minLength != null && str.length < field.minLength) {
        return `Must be at least ${field.minLength} characters.`;
      }
      if (field.maxLength != null && str.length > field.maxLength) {
        return `Must be at most ${field.maxLength} characters.`;
      }
      if (field.pattern && !new RegExp(field.pattern).test(str)) {
        return "Doesn't match the expected format.";
      }
      return null;
    }
    case "number": {
      const num = Number(value);
      if (Number.isNaN(num)) return "Must be a number.";
      if (field.min != null && num < field.min) return `Must be at least ${field.min}.`;
      if (field.max != null && num > field.max) return `Must be at most ${field.max}.`;
      return null;
    }
    case "select": {
      if (field.options && !field.options.includes(String(value))) {
        return "Choose one of the listed options.";
      }
      return null;
    }
    case "date": {
      if (Number.isNaN(Date.parse(String(value)))) return "Enter a valid date.";
      return null;
    }
    case "image":
    case "file": {
      const files = value as UploadedFile[];
      if (field.maxFiles != null && files.length > field.maxFiles) {
        return `Attach at most ${field.maxFiles} file(s).`;
      }
      return null;
    }
    case "location": {
      const loc = value as LocationValue;
      if (typeof loc.lat !== "number" || typeof loc.lng !== "number") {
        return "Location wasn't captured — try again.";
      }
      return null;
    }
    case "signature":
    case "boolean":
    default:
      return null;
  }
}

/** Validates every field in a form against the current answers, returning a fieldId -> message map. */
export function validateForm(fields: ApiFormField[], answers: Record<string, FieldValue>): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    const msg = validateField(field, answers[field.fieldId] ?? null);
    if (msg) errors[field.fieldId] = msg;
  }
  return errors;
}