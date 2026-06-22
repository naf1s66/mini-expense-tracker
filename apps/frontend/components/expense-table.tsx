"use client";

import { Pencil, Trash2 } from "lucide-react";

import { Expense } from "@/lib/api";
import { formatDateOnly, formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";

type ExpenseTableProps = {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
};

export function ExpenseTable({
  expenses,
  onEdit,
  onDelete
}: ExpenseTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-soft">
      <table className="min-w-[760px] w-full border-collapse text-left text-sm">
        <thead className="bg-secondary text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-5 py-3 font-medium">Amount</th>
            <th className="px-5 py-3 font-medium">Category</th>
            <th className="px-5 py-3 font-medium">Note</th>
            <th className="px-5 py-3 font-medium">Date</th>
            <th className="px-5 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr
              key={expense.id}
              className="group border-t border-border transition-colors hover:bg-accent/45 focus-within:bg-accent/45"
            >
              <td className="whitespace-nowrap px-5 py-4 font-semibold text-foreground">
                {formatMoney(expense.amount)}
              </td>
              <td className="px-5 py-4 text-foreground">
                {expense.category.name}
              </td>
              <td className="max-w-[18rem] px-5 py-4 text-muted-foreground">
                {expense.note ? (
                  <span className="line-clamp-2">{expense.note}</span>
                ) : (
                  <span className="text-muted-foreground/70">No note</span>
                )}
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                {formatDateOnly(expense.expenseDate)}
              </td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-2 opacity-100 transition-opacity xl:opacity-0 xl:group-hover:opacity-100 xl:group-focus-within:opacity-100">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
