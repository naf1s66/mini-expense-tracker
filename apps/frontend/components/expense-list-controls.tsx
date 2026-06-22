"use client";

import { RotateCcw } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ViewToggle, type ExpenseViewMode } from "@/components/view-toggle";

export const ALL_PERIOD_VALUE = "all";

export type MonthOption = {
  value: string;
  label: string;
};

type ExpenseListControlsProps = {
  month: string;
  year: string;
  monthOptions: MonthOption[];
  yearOptions: string[];
  hasActiveFilters: boolean;
  viewMode: ExpenseViewMode;
  onMonthChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onResetFilters: () => void;
  onViewModeChange: (value: ExpenseViewMode) => void;
};

export function ExpenseListControls({
  month,
  year,
  monthOptions,
  yearOptions,
  hasActiveFilters,
  viewMode,
  onMonthChange,
  onYearChange,
  onResetFilters,
  onViewModeChange
}: ExpenseListControlsProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="relative flex flex-col gap-3 pt-8 sm:flex-row sm:items-end sm:pt-0">
        <div className="absolute left-0 top-0 sm:hidden">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Date filters
          </p>
        </div>

        <div className="grid gap-1.5 sm:w-44">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Month
          </span>
          <Select value={month} onValueChange={onMonthChange}>
            <SelectTrigger aria-label="Filter by month">
              <SelectValue placeholder="All months" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_PERIOD_VALUE}>All months</SelectItem>
              {monthOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5 sm:w-36">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Year
          </span>
          <Select value={year} onValueChange={onYearChange}>
            <SelectTrigger aria-label="Filter by year">
              <SelectValue placeholder="All years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_PERIOD_VALUE}>All years</SelectItem>
              {yearOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          variant="outline"
          className="absolute right-0 top-0 h-10 w-10 p-0 sm:static"
          aria-label="Reset date filters"
          disabled={!hasActiveFilters}
          onClick={onResetFilters}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <ViewToggle value={viewMode} onValueChange={onViewModeChange} />
    </div>
  );
}
