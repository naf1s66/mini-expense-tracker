import { z } from "zod";

import { ValidationError } from "../errors/app-error.js";

const uuidSchema = z.uuid({
  message: "Must be a valid UUID"
});

const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
const amountPattern = /^\d+(\.\d{1,2})?$/;

export type ExpensePayload = {
  amount: string;
  categoryId: string;
  note: string | null;
  expenseDate: string;
};

export type ExpenseFilters = {
  from?: string;
  to?: string;
  categoryId?: string;
};

export type ExpenseValidationContext = {
  timeZone?: string;
};

function isValidDateOnly(value: string): boolean {
  if (!dateOnlyPattern.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isValidTimeZone(value: string): boolean {
  try {
    Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

function todayDateOnly(timeZone?: string): string {
  const now = new Date();
  const normalizedTimeZone = timeZone?.trim();

  if (normalizedTimeZone && isValidTimeZone(normalizedTimeZone)) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: normalizedTimeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(now);
    const year = parts.find((part) => part.type === "year")?.value;
    const month = parts.find((part) => part.type === "month")?.value;
    const day = parts.find((part) => part.type === "day")?.value;

    if (year && month && day) {
      return `${year}-${month}-${day}`;
    }
  }

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function normalizeAmount(value: string): string {
  const [integerPart, decimalPart = ""] = value.split(".");
  const normalizedInteger = integerPart.replace(/^0+(?=\d)/, "");
  const normalizedDecimal = decimalPart.padEnd(2, "0");

  return `${normalizedInteger}.${normalizedDecimal}`;
}

const amountSchema = z
  .string({
    error: "Amount is required and must be a string"
  })
  .trim()
  .min(1, "Amount is required")
  .refine((value) => amountPattern.test(value), {
    message:
      "Amount must be a decimal string with no more than 2 decimal places"
  })
  .transform(normalizeAmount)
  .refine((value) => value !== "0.00", {
    message: "Amount must be greater than 0"
  })
  .refine((value) => value.split(".")[0].length <= 8, {
    message: "Amount must be less than or equal to 99999999.99"
  });

const dateOnlySchema = z
  .string({
    error: "Date must be a YYYY-MM-DD string"
  })
  .trim()
  .refine(isValidDateOnly, {
    message: "Date must be a valid YYYY-MM-DD date"
  });

function expensePayloadSchema(context: ExpenseValidationContext = {}) {
  const expenseDateSchema = dateOnlySchema.refine(
    (value) => value <= todayDateOnly(context.timeZone),
    {
      message: "Expense date cannot be in the future"
    }
  );

  return z.object({
    amount: amountSchema,
    categoryId: uuidSchema,
    note: z
      .string({
        error: "Note must be a string"
      })
      .trim()
      .max(255, "Note must be 255 characters or less")
      .optional()
      .transform((value) =>
        value === undefined || value === "" ? null : value
      ),
    expenseDate: expenseDateSchema
  });
}

const expenseFiltersSchema = z
  .object({
    from: dateOnlySchema.optional(),
    to: dateOnlySchema.optional(),
    categoryId: uuidSchema.optional()
  })
  .refine(
    (filters) =>
      filters.from === undefined ||
      filters.to === undefined ||
      filters.from <= filters.to,
    {
      message: "From date must be before or equal to to date",
      path: ["from"]
    }
  );

const expenseIdParamsSchema = z.object({
  id: uuidSchema
});

function validationDetails(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.join(".");

    return path ? `${path}: ${issue.message}` : issue.message;
  });
}

export function parseExpensePayload(
  input: unknown,
  context: ExpenseValidationContext = {}
): ExpensePayload {
  const result = expensePayloadSchema(context).safeParse(input);

  if (!result.success) {
    throw new ValidationError(
      "Invalid expense payload",
      validationDetails(result.error)
    );
  }

  return result.data;
}

export function parseExpenseFilters(input: unknown): ExpenseFilters {
  const result = expenseFiltersSchema.safeParse(input);

  if (!result.success) {
    throw new ValidationError(
      "Invalid expense filters",
      validationDetails(result.error)
    );
  }

  return result.data;
}

export function parseExpenseId(input: unknown): string {
  const result = expenseIdParamsSchema.safeParse(input);

  if (!result.success) {
    throw new ValidationError(
      "Invalid expense id",
      validationDetails(result.error)
    );
  }

  return result.data.id;
}
