"use client";

import { Pencil, Trash2 } from "lucide-react";

import { Expense } from "@/lib/api";
import { formatDateOnly, formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ExpenseCardListProps = {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
};

export function ExpenseCardList({
  expenses,
  onEdit,
  onDelete
}: ExpenseCardListProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {expenses.map((expense) => (
        <Card
          key={expense.id}
          className="group transition duration-200 hover:scale-[1.03] hover:bg-accent focus-within:bg-accent"
        >
          <CardContent className="flex min-h-44 flex-col p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 px-2.5">
                <p className="text-xl font-semibold text-foreground">
                  {formatMoney(expense.amount)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatDateOnly(expense.expenseDate)}
                </p>
              </div>
              <div className="flex gap-1 opacity-100 transition-opacity xl:opacity-0 xl:group-hover:opacity-100 xl:group-focus-within:opacity-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => onEdit(expense)}
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Edit expense</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => onDelete(expense)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Delete expense</span>
                </Button>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 px-2.5">
              <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary ring-1 ring-primary/15">
                {expense.category.name}
              </span>
            </div>

            {expense.note ? (
              <p className="mt-4 line-clamp-3 px-2.5 text-sm leading-6 text-muted-foreground">
                {expense.note}
              </p>
            ) : (
              <p className="mt-4 px-2.5 text-sm leading-6 text-muted-foreground/70">
                No note
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
