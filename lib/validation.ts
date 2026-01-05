//some validation
export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; details?: Record<string, string> };

type StringRule = {
  type: "string";
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  //ff true, preserves newlines (useful for notes)
  keepNewlines?: boolean;
  //optional transform after sanitization
  transform?: (v: string) => string;
};

type NumberRule = {
  type: "number";
  required?: boolean;
  min?: number;
  max?: number;
  //round to this many decimal places
  decimals?: number;
};

type EnumRule<T extends string> = {
  type: "enum";
  required?: boolean;
  values: readonly T[];
};

type Rule = StringRule | NumberRule | EnumRule<any>;

export type Schema<T extends Record<string, any>> = {
  [K in keyof T]: Rule;
};

function sanitizeString(input: string, keepNewlines = false) {
  //remove control chars (except newline if requested) + trim
  const control = keepNewlines ? /[\u0000-\u0009\u000B-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g;
  return input.replace(control, "").trim();
}

function clamp(v: string, max?: number) {
  if (typeof max !== "number") return v;
  return v.length > max ? v.slice(0, max) : v;
}

export function validateStrict<T extends Record<string, any>>(
  raw: unknown,
  schema: Schema<T>
): ValidationResult<T> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, error: "Invalid JSON body." };
  }

  const obj = raw as Record<string, unknown>;

  //reject unexpected fields
  const allowed = new Set(Object.keys(schema));
  for (const k of Object.keys(obj)) {
    if (!allowed.has(k)) {
      return { ok: false, error: `Unexpected field: ${k}` };
    }
  }

  const out: Record<string, any> = {};
  const details: Record<string, string> = {};

  for (const [key, rule] of Object.entries(schema)) {
    const value = obj[key];
    const isMissing = value === undefined || value === null;

    if (isMissing) {
      if ((rule as any).required) {
        details[key] = "Required";
      }
      out[key] = undefined;
      continue;
    }

    if (rule.type === "string") {
      if (typeof value !== "string") {
        details[key] = "Must be a string";
        continue;
      }
      let v = sanitizeString(value, rule.keepNewlines);
      v = clamp(v, rule.max);
      if (typeof rule.min === "number" && v.length < rule.min) {
        details[key] = `Must be at least ${rule.min} characters`;
        continue;
      }
      if (rule.pattern && !rule.pattern.test(v)) {
        details[key] = "Invalid format";
        continue;
      }
      if (rule.transform) v = rule.transform(v);
      out[key] = v;
      continue;
    }

    if (rule.type === "number") {
      const n = typeof value === "number" ? value : Number(value);
      if (!Number.isFinite(n)) {
        details[key] = "Must be a number";
        continue;
      }
      let v = n;
      if (typeof rule.min === "number" && v < rule.min) {
        details[key] = `Must be >= ${rule.min}`;
        continue;
      }
      if (typeof rule.max === "number" && v > rule.max) {
        details[key] = `Must be <= ${rule.max}`;
        continue;
      }
      if (typeof rule.decimals === "number") {
        const p = Math.pow(10, rule.decimals);
        v = Math.round(v * p) / p;
      }
      out[key] = v;
      continue;
    }

    if (rule.type === "enum") {
      if (typeof value !== "string" || !(rule.values as readonly string[]).includes(value)) {
        details[key] = `Must be one of: ${(rule.values as readonly string[]).join(", ")}`;
        continue;
      }
      out[key] = value;
      continue;
    }
  }

  if (Object.keys(details).length > 0) {
    return { ok: false, error: "Validation failed", details };
  }

  return { ok: true, data: out as T };
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 254;
}

export function normalizePhone(input: string) {
  const trimmed = input.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/[^\d]/g, "");
  const out = (hasPlus ? "+" : "") + digits;
  const digitsOnly = out.replace(/[^\d]/g, "");
  if (digitsOnly.length < 10 || digitsOnly.length > 15) return null;
  return out;
}

export function isISODate(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}
