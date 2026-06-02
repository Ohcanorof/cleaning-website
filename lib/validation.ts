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
  //iff true, preserves newlines (using it for my notes)
  keepNewlines?: boolean;
  //optional
  transform?: (v: string) => string;
};

type NumberRule = {
  type: "number";
  required?: boolean;
  min?: number;
  max?: number;
  //rounding
  decimals?: number;
};

type EnumRule<T extends string> = {
  type: "enum";
  required?: boolean;
  values: readonly T[];
};

type Rule = StringRule | NumberRule | EnumRule<string>;

export type Schema<T extends object> = {
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

export function validateStrict<T extends object>(
  raw: unknown,
  schema: Schema<T>
): ValidationResult<T> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, error: "Invalid JSON body." };
  }

  const obj = raw as Record<string, unknown>;

  //reject unexpected fields
  const allowed = new Set(Object.keys(schema));
  for (const key of Object.keys(obj)) {
    if (!allowed.has(key)) {
      return { ok: false, error: `Unexpected field: ${key}` };
    }
  }

  const out: Record<string, unknown> = {};
  const details: Record<string, string> = {};

  const schemaEntries = Object.entries(schema) as Array<[keyof T & string, Rule]>;

  for (const [key, rule] of schemaEntries) {
    const value = obj[key];
    const isMissing = value === undefined || value === null;

    if (isMissing) {
      if (rule.required) {
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
      let sanitizedValue = sanitizeString(value, rule.keepNewlines);
      sanitizedValue = clamp(sanitizedValue, rule.max);
      if (typeof rule.min === "number" && sanitizedValue.length < rule.min) {
        details[key] = `Must be at least ${rule.min} characters`;
        continue;
      }
      if (rule.pattern && !rule.pattern.test(sanitizedValue)) {
        details[key] = "Invalid format";
        continue;
      }
      if (rule.transform){
        sanitizedValue = rule.transform(sanitizedValue);
      }
      out[key] = sanitizedValue;
      continue;
    }

    if (rule.type === "number") {
      const parsedNumber =
        typeof value === "number" ? value : Number(value);

      if (!Number.isFinite(parsedNumber)) {
        details[key] = "Must be a number";
        continue;
      }

      let validatedNumber = parsedNumber;

      if (
        typeof rule.min === "number" &&
        validatedNumber < rule.min
      ) {
        details[key] = `Must be >= ${rule.min}`;
        continue;
      }

      if (
        typeof rule.max === "number" &&
        validatedNumber > rule.max
      ) {
        details[key] = `Must be <= ${rule.max}`;
        continue;
      }

      if (typeof rule.decimals === "number") {
        const multiplier = 10 ** rule.decimals;
        validatedNumber =
          Math.round(validatedNumber * multiplier) / multiplier;
      }

      out[key] = validatedNumber;
      continue;
    }

    if (rule.type === "enum") {
      if (typeof value !== "string" || !rule.values.includes(value)) {
        details[key] = `Must be one of: ${rule.values.join(", ")}`;
        continue;
      }

      out[key] = value;
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
  const normalizedPhone = `${hasPlus ? "+" : ""}${digits}`;
  const digitsOnly = normalizedPhone.replace(/[^\d]/g, "");

  if (digitsOnly.length < 10 || digitsOnly.length > 15) return null;

  return normalizedPhone;
}

export function isISODate(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}
