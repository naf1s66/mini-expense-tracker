"use client";

import { LayoutGrid, Table2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ExpenseViewMode = "table" | "cards";

type ViewToggleProps = {
  value: ExpenseViewMode;
  onValueChange: (value: ExpenseViewMode) => void;
};

export function ViewToggle({ value, onValueChange }: ViewToggleProps) {
  return (
    <div
      className="hidden rounded-md border border-border bg-card p-1 md:flex"
      aria-label="Expense list view"
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 gap-2 px-3",
          value === "table" && "bg-accent text-accent-foreground"
        )}
        aria-pressed={value === "table"}
        onClick={() => onValueChange("table")}
      >
        <Table2 className="h-4 w-4" aria-hidden="true" />
        Table
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 gap-2 px-3",
          value === "cards" && "bg-accent text-accent-foreground"
        )}
        aria-pressed={value === "cards"}
        onClick={() => onValueChange("cards")}
      >
        <LayoutGrid className="h-4 w-4" aria-hidden="true" />
        Cards
      </Button>
    </div>
  );
}
