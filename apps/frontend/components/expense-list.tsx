"use client";

import { Receipt } from "lucide-react";

import { Expense } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ExpenseCardList } from "@/components/expense-card-list";
import { ExpenseTable } from "@/components/expense-table";
import { ExpenseViewMode } from "@/components/view-toggle";

type ExpenseListProps = {
  expenses: Expense[];
  error: string | null;
  isLoading: boolean;
  viewMode: ExpenseViewMode;
  emptyTitle?: string;
  emptyMessage?: string;
  onRetry: () => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
};

function ExpenseListLoading() {
  return (
    <div className="space-y-3">
      <div className="hidden overflow-hidden rounded-lg border border-border bg-card md:block">
        <div className="grid grid-cols-5 gap-4 bg-secondary px-5 py-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-4 w-full" />
          ))}
        </div>
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-5 gap-4 border-t border-border px-5 py-4"
          >
            {Array.from({ length: 5 }).map((__, cellIndex) => (
              <Skeleton key={cellIndex} className="h-5 w-full" />
            ))}
          </div>
        ))}
      </div>
      <div className="grid gap-3 md:hidden">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="space-y-3 p-4">
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function ExpenseList({
  expenses,
  error,
  isLoading,
  viewMode,
  emptyTitle = "No expenses yet",
  emptyMessage = "Add your first expense to start building the list.",
  onRetry,
  onEdit,
  onDelete
}: ExpenseListProps) {
  if (isLoading) {
    return <ExpenseListLoading />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Could not load expenses</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>{error}</p>
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center px-6 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Receipt className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-lg font-semibold tracking-normal">
            {emptyTitle}
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            {emptyMessage}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div className="md:hidden">
        <ExpenseCardList
          expenses={expenses}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>

      <div
        className={cn(
          "hidden md:block",
          viewMode === "table" ? "md:block" : "md:hidden"
        )}
      >
        <ExpenseTable
          expenses={expenses}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>

      <div
        className={cn(
          "hidden md:block",
          viewMode === "cards" ? "md:block" : "md:hidden"
        )}
      >
        <ExpenseCardList
          expenses={expenses}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
