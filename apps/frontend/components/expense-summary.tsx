"use client";

import { useEffect, useMemo, useState } from "react";

import type { ExpenseSummary as ExpenseSummaryData } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type ExpenseSummaryProps = {
  summary: ExpenseSummaryData | null;
  error: string | null;
  isLoading: boolean;
  onRetry: () => void;
};

function toNumber(amount: string): number {
  const value = Number(amount);

  return Number.isFinite(value) ? value : 0;
}

export function ExpenseSummary({
  summary,
  error,
  isLoading,
  onRetry
}: ExpenseSummaryProps) {
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setShowAll(false);
  }, [summary]);

  const sortedCategories = useMemo(() => {
    return [...(summary?.categories ?? [])].sort(
      (left, right) => toNumber(right.total) - toNumber(left.total)
    );
  }, [summary]);

  const visibleCategories = showAll
    ? sortedCategories
    : sortedCategories.slice(0, 3);
  const totalSpend = toNumber(summary?.totalSpend ?? "0");
  const maxCategoryTotal = Math.max(
    ...sortedCategories.map((row) => toNumber(row.total)),
    0
  );

  if (isLoading) {
    return (
      <section className="rounded-lg border border-border bg-card p-4 shadow-soft sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-3 h-9 w-44" />
          </div>
          <div className="w-full space-y-3 sm:max-w-md">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between gap-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Could not load summary</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>{error}</p>
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (summary === null || sortedCategories.length === 0 || totalSpend <= 0) {
    return (
      <section className="rounded-lg border border-border bg-card p-4 shadow-soft sm:p-5">
        <p className="text-sm font-medium text-muted-foreground">
          Total spend
        </p>
        <p className="mt-2 text-3xl font-semibold tracking-normal text-foreground">
          {formatMoney("0")}
        </p>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          No spending summary is available for the selected period.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-soft sm:p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">
            Total spend
          </p>
          <p className="mt-2 break-words text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
            {formatMoney(summary.totalSpend)}
          </p>
        </div>

        <div className="w-full space-y-3 lg:max-w-xl">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold tracking-normal text-foreground">
              Category breakdown
            </h2>
            {sortedCategories.length > 3 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => setShowAll((current) => !current)}
              >
                {showAll ? "Show less" : "Show all"}
              </Button>
            ) : null}
          </div>

          <div className="space-y-3">
            {visibleCategories.map((row) => {
              const categoryTotal = toNumber(row.total);
              const share =
                totalSpend > 0
                  ? Math.round((categoryTotal / totalSpend) * 100)
                  : 0;
              const barWidth =
                maxCategoryTotal > 0
                  ? Math.max((categoryTotal / maxCategoryTotal) * 100, 4)
                  : 0;

              return (
                <div key={row.category.id} className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate font-medium text-foreground">
                      {row.category.name}
                    </span>
                    <span className="shrink-0 text-muted-foreground">
                      {formatMoney(row.total)} - {share}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn(
                        "h-full rounded-full bg-primary",
                        barWidth === 0 && "hidden"
                      )}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
