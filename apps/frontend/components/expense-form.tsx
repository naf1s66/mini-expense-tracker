"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  ApiError,
  Category,
  Expense,
  createExpense,
  fetchCategories
} from "@/lib/api";
import {
  ExpenseFormErrors,
  ExpenseFormValues,
  todayDateOnly,
  validateExpenseForm
} from "@/lib/validation";
import {
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
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

const initialValues = (): ExpenseFormValues => ({
  amount: "",
  categoryId: "",
  note: "",
  expenseDate: todayDateOnly()
});

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

export function ExpenseForm() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [values, setValues] = useState<ExpenseFormValues>(() =>
    initialValues()
  );
  const [errors, setErrors] = useState<ExpenseFormErrors>({});
  const [serverError, setServerError] = useState<{
    message: string;
    details: string[];
  } | null>(null);
  const [createdExpense, setCreatedExpense] = useState<Expense | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCategoryName = useMemo(
    () =>
      categories.find((category) => category.id === createdExpense?.category.id)
        ?.name ?? createdExpense?.category.name,
    [categories, createdExpense]
  );

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

  function updateValue(field: keyof ExpenseFormValues, value: string) {
    setValues((current) => ({
      ...current,
      [field]: value
    }));
    setErrors((current) => ({
      ...current,
      [field]: undefined
    }));
    setServerError(null);
    setCreatedExpense(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateExpenseForm(values);
    setErrors(nextErrors);
    setServerError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const note = values.note.trim();
      const expense = await createExpense({
        amount: values.amount.trim(),
        categoryId: values.categoryId,
        note: note.length === 0 ? null : note,
        expenseDate: values.expenseDate
      });

      setCreatedExpense(expense);
      setValues({
        amount: "",
        categoryId: "",
        note: "",
        expenseDate: todayDateOnly()
      });
      setErrors({});
    } catch (error) {
      setServerError(formatServerError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      {createdExpense ? (
        <Alert variant="success">
          <AlertTitle>Expense created</AlertTitle>
          <AlertDescription>
            Added {createdExpense.amount} for {selectedCategoryName} on{" "}
            {createdExpense.expenseDate}.
          </AlertDescription>
        </Alert>
      ) : null}

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

      <Card>
        <CardHeader>
          <CardTitle>Expense details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground"
                  >
                    ৳
                  </span>
                  <Input
                    id="amount"
                    name="amount"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="12.50"
                    className="pl-8"
                    value={values.amount}
                    onChange={(event) =>
                      updateValue("amount", event.target.value)
                    }
                    aria-invalid={Boolean(errors.amount)}
                    aria-describedby={
                      errors.amount ? toFieldId("amount") : undefined
                    }
                    disabled={isSubmitting}
                  />
                </div>
                {errors.amount ? (
                  <p className="text-sm text-destructive" id={toFieldId("amount")}>
                    {errors.amount}
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
                  onChange={(event) =>
                    updateValue("expenseDate", event.target.value)
                  }
                  aria-invalid={Boolean(errors.expenseDate)}
                  aria-describedby={
                    errors.expenseDate ? toFieldId("expenseDate") : undefined
                  }
                  disabled={isSubmitting}
                />
                {errors.expenseDate ? (
                  <p
                    className="text-sm text-destructive"
                    id={toFieldId("expenseDate")}
                  >
                    {errors.expenseDate}
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
                    aria-invalid={Boolean(errors.categoryId)}
                    aria-describedby={
                      errors.categoryId ? toFieldId("categoryId") : undefined
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
              {errors.categoryId ? (
                <p
                  className="text-sm text-destructive"
                  id={toFieldId("categoryId")}
                >
                  {errors.categoryId}
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
                onChange={(event) => updateValue("note", event.target.value)}
                aria-invalid={Boolean(errors.note)}
                aria-describedby={errors.note ? toFieldId("note") : undefined}
                disabled={isSubmitting}
              />
              {errors.note ? (
                <p className="text-sm text-destructive" id={toFieldId("note")}>
                  {errors.note}
                </p>
              ) : null}
            </div>

            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={
                isSubmitting ||
                isLoadingCategories ||
                categories.length === 0
              }
            >
              {isSubmitting ? "Saving..." : "Add expense"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
