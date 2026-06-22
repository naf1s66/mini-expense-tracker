"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";

import {
  ApiError,
  CreateExpensePayload,
  Expense,
  createExpense,
  deleteExpense,
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
import { ExpenseViewMode, ViewToggle } from "@/components/view-toggle";

type Feedback = {
  title: string;
  message: string;
};

function formatApiError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.details.length > 0
      ? `${error.message}: ${error.details.join("; ")}`
      : error.message;
  }

  return fallback;
}

function describeExpense(expense: Expense): string {
  return `${formatMoney(expense.amount)} for ${expense.category.name} on ${formatDateOnly(
    expense.expenseDate
  )}`;
}

export function ExpenseManager() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
  const [expenseError, setExpenseError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ExpenseViewMode>("table");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const loadExpenses = useCallback(async () => {
    setIsLoadingExpenses(true);
    setExpenseError(null);

    try {
      const data = await fetchExpenses();
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
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  async function handleCreate(payload: CreateExpensePayload) {
    const expense = await createExpense(payload);
    setIsCreateOpen(false);
    setFeedback({
      title: "Expense added",
      message: `Added ${describeExpense(expense)}.`
    });
    await loadExpenses();
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
    await loadExpenses();
  }

  async function handleDelete(expense: Expense) {
    await deleteExpense(expense.id);
    setDeletingExpense(null);
    setFeedback({
      title: "Expense deleted",
      message: "The expense was removed from your active expense list."
    });
    await loadExpenses();
  }

  return (
    <>
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 sm:py-10 lg:py-12">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">
              Mini Expense Tracker
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
              Expenses
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              Add, edit, delete, and review your saved expense entries.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ViewToggle value={viewMode} onValueChange={setViewMode} />
            <Button
              type="button"
              className="h-10 min-w-10 px-3 sm:px-4"
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
        </header>

        {feedback ? (
          <Alert variant="success" className="mb-5">
            <AlertTitle>{feedback.title}</AlertTitle>
            <AlertDescription>{feedback.message}</AlertDescription>
          </Alert>
        ) : null}

        <ExpenseList
          expenses={expenses}
          error={expenseError}
          isLoading={isLoadingExpenses}
          viewMode={viewMode}
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
