"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import {
  ApiError,
  type CreateExpensePayload,
  type Expense,
  type ExpenseQueryFilters,
  type ExpenseSummary as ExpenseSummaryData,
  createExpense,
  deleteExpense,
  fetchExpenseSummary,
  fetchExpenses,
  updateExpense
} from "@/lib/api";
import { formatDateOnly, formatMoney } from "@/lib/format";
import {
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DeleteExpenseDialog } from "@/components/delete-expense-dialog";
import { ExpenseDialog } from "@/components/expense-dialog";
import { ExpenseList } from "@/components/expense-list";
import {
  ALL_PERIOD_VALUE,
  ExpenseListControls,
  type MonthOption
} from "@/components/expense-list-controls";
import { ExpenseSummary as ExpenseSummarySection } from "@/components/expense-summary";
import type { ExpenseViewMode } from "@/components/view-toggle";

type Feedback = {
  title: string;
  message: string;
};

const MONTH_OPTIONS: MonthOption[] = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" }
];
const DEFAULT_YEAR_OPTION_COUNT = 10;

function formatApiError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.details.length > 0
      ? `${error.message}: ${error.details.join("; ")}`
      : error.message;
  }

  return fallback;
}

function padDatePart(value: number): string {
  return String(value).padStart(2, "0");
}

function expenseYear(expense: Expense): string {
  return expense.expenseDate.slice(0, 4);
}

function buildDateFilters(year: string, month: string): ExpenseQueryFilters {
  if (year === ALL_PERIOD_VALUE) {
    return {};
  }

  const numericYear = Number(year);

  if (!Number.isInteger(numericYear)) {
    return {};
  }

  if (month === ALL_PERIOD_VALUE) {
    return {
      from: `${numericYear}-01-01`,
      to: `${numericYear}-12-31`
    };
  }

  const numericMonth = Number(month);

  if (!Number.isInteger(numericMonth) || numericMonth < 1 || numericMonth > 12) {
    return {};
  }

  const lastDayOfMonth = new Date(numericYear, numericMonth, 0).getDate();

  return {
    from: `${numericYear}-${padDatePart(numericMonth)}-01`,
    to: `${numericYear}-${padDatePart(numericMonth)}-${padDatePart(
      lastDayOfMonth
    )}`
  };
}

function describeExpense(expense: Expense): string {
  return `${formatMoney(expense.amount)} for ${expense.category.name} on ${formatDateOnly(
    expense.expenseDate
  )}`;
}

export function ExpenseManager() {
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [availableExpenseYears, setAvailableExpenseYears] = useState<string[]>(
    []
  );
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
  const [expenseError, setExpenseError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ExpenseSummaryData | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(ALL_PERIOD_VALUE);
  const [selectedYear, setSelectedYear] = useState(ALL_PERIOD_VALUE);
  const [viewMode, setViewMode] = useState<ExpenseViewMode>("table");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const hasActiveFilters =
    selectedMonth !== ALL_PERIOD_VALUE || selectedYear !== ALL_PERIOD_VALUE;
  const dateFilters = useMemo(
    () => buildDateFilters(selectedYear, selectedMonth),
    [selectedMonth, selectedYear]
  );
  const yearOptions = useMemo(() => {
    const years = new Set(
      Array.from({ length: DEFAULT_YEAR_OPTION_COUNT }, (_, index) =>
        String(currentYear - index)
      )
    );

    availableExpenseYears.forEach((year) => years.add(year));

    if (selectedYear !== ALL_PERIOD_VALUE) {
      years.add(selectedYear);
    }

    return Array.from(years).sort((left, right) => Number(right) - Number(left));
  }, [availableExpenseYears, currentYear, selectedYear]);

  const loadExpenses = useCallback(async () => {
    setIsLoadingExpenses(true);
    setExpenseError(null);

    try {
      const data = await fetchExpenses(dateFilters);
      setExpenses(data);
    } catch (error) {
      setExpenseError(
        formatApiError(
          error,
          "Unable to reach the backend API. Check that the backend server is running."
        )
      );
    } finally {
      setIsLoadingExpenses(false);
    }
  }, [dateFilters]);

  const loadAvailableExpenseYears = useCallback(async () => {
    const data = await fetchExpenses();
    const years = new Set(data.map(expenseYear));

    setAvailableExpenseYears(
      Array.from(years).sort((left, right) => Number(right) - Number(left))
    );
  }, []);

  const loadSummary = useCallback(async () => {
    setIsLoadingSummary(true);
    setSummaryError(null);

    try {
      const data = await fetchExpenseSummary(dateFilters);
      setSummary(data);
    } catch (error) {
      setSummaryError(
        formatApiError(
          error,
          "Unable to reach the backend API. Check that the backend server is running."
        )
      );
    } finally {
      setIsLoadingSummary(false);
    }
  }, [dateFilters]);

  const loadExpenseData = useCallback(async () => {
    await Promise.all([
      loadExpenses(),
      loadSummary(),
      loadAvailableExpenseYears()
    ]);
  }, [loadAvailableExpenseYears, loadExpenses, loadSummary]);

  useEffect(() => {
    loadExpenseData();
  }, [loadExpenseData]);

  function handleMonthChange(value: string) {
    setSelectedMonth(value);

    if (value !== ALL_PERIOD_VALUE && selectedYear === ALL_PERIOD_VALUE) {
      setSelectedYear(String(currentYear));
    }
  }

  function handleYearChange(value: string) {
    setSelectedYear(value);

    if (value === ALL_PERIOD_VALUE) {
      setSelectedMonth(ALL_PERIOD_VALUE);
    }
  }

  function handleResetFilters() {
    setSelectedMonth(ALL_PERIOD_VALUE);
    setSelectedYear(ALL_PERIOD_VALUE);
  }

  async function handleCreate(payload: CreateExpensePayload) {
    const expense = await createExpense(payload);
    setIsCreateOpen(false);
    setFeedback({
      title: "Expense added",
      message: `Added ${describeExpense(expense)}.`
    });
    await loadExpenseData();
  }

  async function handleUpdate(payload: CreateExpensePayload) {
    if (editingExpense === null) {
      return;
    }

    const expense = await updateExpense(editingExpense.id, payload);
    setEditingExpense(null);
    setFeedback({
      title: "Expense updated",
      message: `Saved ${describeExpense(expense)}.`
    });
    await loadExpenseData();
  }

  async function handleDelete(expense: Expense) {
    await deleteExpense(expense.id);
    setDeletingExpense(null);
    setFeedback({
      title: "Expense deleted",
      message: "The expense was removed from your active expense list."
    });
    await loadExpenseData();
  }

  return (
    <>
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 sm:py-10 lg:py-12">
        <header className="mb-6">
          <div className="w-full">
            <p className="text-sm font-medium text-primary">
              Mini Expense Tracker
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
              Expenses
            </h1>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                Add, edit, delete, and review your saved expense entries.
              </p>

              <Button
                type="button"
                className="h-10 min-w-10 shrink-0 px-3 sm:px-4"
                aria-label="Add expense"
                onClick={() => {
                  setFeedback(null);
                  setIsCreateOpen(true);
                }}
              >
                <Plus className="h-4 w-4 sm:hidden" aria-hidden="true" />
                <span className="hidden sm:inline lg:hidden">Add</span>
                <span className="hidden lg:inline">Add expense</span>
              </Button>
            </div>
          </div>
        </header>

        {feedback ? (
          <Alert variant="success" className="mb-5">
            <AlertTitle>{feedback.title}</AlertTitle>
            <AlertDescription>{feedback.message}</AlertDescription>
          </Alert>
        ) : null}

        <div className="mb-5">
          <ExpenseSummarySection
            summary={summary}
            error={summaryError}
            isLoading={isLoadingSummary}
            onRetry={loadSummary}
          />
        </div>

        <div className="mb-4">
          <ExpenseListControls
            month={selectedMonth}
            year={selectedYear}
            monthOptions={MONTH_OPTIONS}
            yearOptions={yearOptions}
            hasActiveFilters={hasActiveFilters}
            viewMode={viewMode}
            onMonthChange={handleMonthChange}
            onYearChange={handleYearChange}
            onResetFilters={handleResetFilters}
            onViewModeChange={setViewMode}
          />
        </div>

        <ExpenseList
          expenses={expenses}
          error={expenseError}
          isLoading={isLoadingExpenses}
          viewMode={viewMode}
          emptyTitle={
            hasActiveFilters ? "No expenses found" : "No expenses yet"
          }
          emptyMessage={
            hasActiveFilters
              ? "Try a different month or year, or reset the date filters."
              : "Add your first expense to start building the list."
          }
          onRetry={loadExpenses}
          onEdit={(expense) => {
            setFeedback(null);
            setEditingExpense(expense);
          }}
          onDelete={(expense) => {
            setFeedback(null);
            setDeletingExpense(expense);
          }}
        />
      </section>

      <ExpenseDialog
        open={isCreateOpen}
        mode="create"
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreate}
      />

      <ExpenseDialog
        open={editingExpense !== null}
        mode="edit"
        expense={editingExpense}
        onOpenChange={(open) => {
          if (!open) {
            setEditingExpense(null);
          }
        }}
        onSubmit={handleUpdate}
      />

      <DeleteExpenseDialog
        open={deletingExpense !== null}
        expense={deletingExpense}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingExpense(null);
          }
        }}
        onConfirm={handleDelete}
      />
    </>
  );
}
