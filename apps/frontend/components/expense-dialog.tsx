"use client";

import { Expense, CreateExpensePayload } from "@/lib/api";
import { ExpenseForm } from "@/components/expense-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

type ExpenseDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  expense?: Expense | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateExpensePayload) => Promise<void>;
};

export function ExpenseDialog({
  open,
  mode,
  expense,
  onOpenChange,
  onSubmit
}: ExpenseDialogProps) {
  const initialValues =
    mode === "edit" && expense
      ? {
          amount: expense.amount,
          categoryId: expense.category.id,
          note: expense.note ?? "",
          expenseDate: expense.expenseDate
        }
      : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onOpenChange={onOpenChange}>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add expense" : "Edit expense"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Record an expense with the amount, category, optional note, and date."
              : "Update the saved amount, category, note, or expense date."}
          </DialogDescription>
        </DialogHeader>
        <ExpenseForm
          mode={mode}
          initialValues={initialValues}
          onCancel={() => onOpenChange(false)}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
