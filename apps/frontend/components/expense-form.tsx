"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  ApiError,
  Category,
  CreateExpensePayload,
  fetchCategories
} from "@/lib/api";
import {
  ExpenseFormErrors,
  ExpenseFormValues,
  normalizeExpenseFormValues,
  todayDateOnly,
  validateExpenseForm
} from "@/lib/validation";
import {
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

export const defaultExpenseFormValues = (): ExpenseFormValues => ({
  amount: "",
  categoryId: "",
  note: "",
  expenseDate: todayDateOnly()
});

type ExpenseFormProps = {
  mode: "create" | "edit";
  initialValues?: ExpenseFormValues;
  onCancel: () => void;
  onSubmit: (payload: CreateExpensePayload) => Promise<void>;
};

function toFieldId(field: keyof ExpenseFormValues) {
  return `${field}-error`;
}

function formatServerError(error: unknown): {
  message: string;
  details: string[];
} {
  if (error instanceof ApiError) {
    return {
      message: error.message,
      details: error.details
    };
  }

  return {
    message: "Something went wrong while saving the expense.",
    details: []
  };
}

function hasErrors(errors: ExpenseFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function ExpenseForm({
  mode,
  initialValues,
  onCancel,
  onSubmit
}: ExpenseFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [values, setValues] = useState<ExpenseFormValues>(
    () => initialValues ?? defaultExpenseFormValues()
  );
  const [visibleErrors, setVisibleErrors] = useState<ExpenseFormErrors>({});
  const [serverError, setServerError] = useState<{
    message: string;
    details: string[];
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setValues(initialValues ?? defaultExpenseFormValues());
    setVisibleErrors({});
    setServerError(null);
  }, [initialValues]);

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      try {
        const data = await fetchCategories();

        if (isMounted) {
          setCategories(data);
          setCategoryError(null);
        }
      } catch (error) {
        if (isMounted) {
          const formatted = formatServerError(error);
          setCategoryError(
            formatted.details.length > 0
              ? `${formatted.message}: ${formatted.details.join("; ")}`
              : formatted.message
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingCategories(false);
        }
      }
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentErrors = useMemo(() => validateExpenseForm(values), [values]);
  const normalizedValues = useMemo(
    () => normalizeExpenseFormValues(values),
    [values]
  );
  const normalizedInitialValues = useMemo(
    () =>
      initialValues === undefined
        ? null
        : normalizeExpenseFormValues(initialValues),
    [initialValues]
  );
  const isDirty =
    mode === "create" ||
    normalizedInitialValues === null ||
    normalizedValues.amount !== normalizedInitialValues.amount ||
    normalizedValues.categoryId !== normalizedInitialValues.categoryId ||
    normalizedValues.note !== normalizedInitialValues.note ||
    normalizedValues.expenseDate !== normalizedInitialValues.expenseDate;
  const isValid = !hasErrors(currentErrors);
  const submitLabel = mode === "create" ? "Add expense" : "Save";

  function updateValue(field: keyof ExpenseFormValues, value: string) {
    setValues((current) => ({
      ...current,
      [field]: value
    }));
    setVisibleErrors((current) => ({
      ...current,
      [field]: undefined
    }));
    setServerError(null);
  }

  function showFieldError(field: keyof ExpenseFormValues) {
    setVisibleErrors((current) => ({
      ...current,
      [field]: currentErrors[field]
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setVisibleErrors(currentErrors);
    setServerError(null);

    if (hasErrors(currentErrors) || !isDirty) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(normalizedValues);
    } catch (error) {
      setServerError(formatServerError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  const isSubmitDisabled =
    isSubmitting ||
    isLoadingCategories ||
    categories.length === 0 ||
    (mode === "edit" && (!isValid || !isDirty));

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      {serverError ? (
        <Alert variant="destructive">
          <AlertTitle>{serverError.message}</AlertTitle>
          {serverError.details.length > 0 ? (
            <AlertDescription>
              <ul className="list-disc space-y-1 pl-5">
                {serverError.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </AlertDescription>
          ) : (
            <AlertDescription>
              Check the form values and try again.
            </AlertDescription>
          )}
        </Alert>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground"
            >
              Tk
            </span>
            <Input
              id="amount"
              name="amount"
              inputMode="decimal"
              autoComplete="off"
              placeholder="12.50"
              className="pl-9"
              value={values.amount}
              onBlur={() => showFieldError("amount")}
              onChange={(event) => updateValue("amount", event.target.value)}
              aria-invalid={Boolean(visibleErrors.amount)}
              aria-describedby={
                visibleErrors.amount ? toFieldId("amount") : undefined
              }
              disabled={isSubmitting}
            />
          </div>
          {visibleErrors.amount ? (
            <p className="text-sm text-destructive" id={toFieldId("amount")}>
              {visibleErrors.amount}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="expenseDate">Expense date</Label>
          <Input
            id="expenseDate"
            name="expenseDate"
            type="date"
            max={todayDateOnly()}
            value={values.expenseDate}
            onBlur={() => showFieldError("expenseDate")}
            onChange={(event) =>
              updateValue("expenseDate", event.target.value)
            }
            aria-invalid={Boolean(visibleErrors.expenseDate)}
            aria-describedby={
              visibleErrors.expenseDate
                ? toFieldId("expenseDate")
                : undefined
            }
            disabled={isSubmitting}
          />
          {visibleErrors.expenseDate ? (
            <p
              className="text-sm text-destructive"
              id={toFieldId("expenseDate")}
            >
              {visibleErrors.expenseDate}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryId">Category</Label>
        {isLoadingCategories ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <p className="text-sm text-muted-foreground">
              Loading categories...
            </p>
          </div>
        ) : (
          <Select
            value={values.categoryId}
            onValueChange={(value) => updateValue("categoryId", value)}
            disabled={isSubmitting || categories.length === 0}
          >
            <SelectTrigger
              id="categoryId"
              aria-invalid={Boolean(visibleErrors.categoryId)}
              aria-describedby={
                visibleErrors.categoryId ? toFieldId("categoryId") : undefined
              }
            >
              <SelectValue placeholder="Choose a category" />
            </SelectTrigger>
            <SelectContent
              align="start"
              avoidCollisions={false}
              className="data-[side=bottom]:translate-y-0"
              collisionPadding={12}
              side="bottom"
              sideOffset={0}
            >
              <SelectGroup>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
        {categoryError ? (
          <p className="text-sm text-destructive">{categoryError}</p>
        ) : null}
        {visibleErrors.categoryId ? (
          <p
            className="text-sm text-destructive"
            id={toFieldId("categoryId")}
          >
            {visibleErrors.categoryId}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="note">Note</Label>
          <span className="text-xs text-muted-foreground">
            {values.note.trim().length}/255
          </span>
        </div>
        <Textarea
          id="note"
          name="note"
          placeholder="Optional note"
          maxLength={255}
          value={values.note}
          onBlur={() => showFieldError("note")}
          onChange={(event) => updateValue("note", event.target.value)}
          aria-invalid={Boolean(visibleErrors.note)}
          aria-describedby={visibleErrors.note ? toFieldId("note") : undefined}
          disabled={isSubmitting}
        />
        {visibleErrors.note ? (
          <p className="text-sm text-destructive" id={toFieldId("note")}>
            {visibleErrors.note}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitDisabled}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
