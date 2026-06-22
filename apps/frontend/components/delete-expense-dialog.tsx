"use client";

import { useEffect, useState } from "react";

import { ApiError, Expense } from "@/lib/api";
import {
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

type DeleteExpenseDialogProps = {
  expense: Expense | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (expense: Expense) => Promise<void>;
};

function formatDeleteError(error: unknown): {
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
    message: "Something went wrong while deleting the expense.",
    details: []
  };
}

export function DeleteExpenseDialog({
  expense,
  open,
  onOpenChange,
  onConfirm
}: DeleteExpenseDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<{
    message: string;
    details: string[];
  } | null>(null);

  useEffect(() => {
    if (open) {
      setError(null);
      setIsDeleting(false);
    }
  }, [open, expense?.id]);

  async function handleDelete() {
    if (expense === null) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await onConfirm(expense);
    } catch (deleteError) {
      setError(formatDeleteError(deleteError));
      setIsDeleting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isDeleting && !nextOpen) {
          return;
        }

        onOpenChange(nextOpen);
      }}
    >
      <DialogContent onOpenChange={onOpenChange} showClose={!isDeleting}>
        <DialogHeader>
          <DialogTitle>Delete expense?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this expense entry? This removes it
            from your active expense list.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>{error.message}</AlertTitle>
            {error.details.length > 0 ? (
              <AlertDescription>
                <ul className="list-disc space-y-1 pl-5">
                  {error.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </AlertDescription>
            ) : (
              <AlertDescription>Try again in a moment.</AlertDescription>
            )}
          </Alert>
        ) : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleDelete}
            disabled={isDeleting || expense === null}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
