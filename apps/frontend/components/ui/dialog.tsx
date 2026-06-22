"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

function Dialog({ open, onOpenChange, children }: DialogProps) {
  React.useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onOpenChange, open]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center px-4 py-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-foreground/35"
        aria-label="Close dialog"
        onClick={() => onOpenChange(false)}
      />
      {children}
    </div>,
    document.body
  );
}

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    onOpenChange?: (open: boolean) => void;
    showClose?: boolean;
  }
>(({ className, children, onOpenChange, showClose = true, ...props }, ref) => (
  <div
    ref={ref}
    role="dialog"
    aria-modal="true"
    className={cn(
      "relative z-10 max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-popover p-6 text-popover-foreground shadow-soft",
      className
    )}
    onClick={(event) => event.stopPropagation()}
    {...props}
  >
    {showClose && onOpenChange ? (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-3 top-3 h-8 w-8 p-0"
        aria-label="Close dialog"
        onClick={() => onOpenChange(false)}
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </Button>
    ) : null}
    {children}
  </div>
));
DialogContent.displayName = "DialogContent";

const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mb-5 space-y-1.5 pr-8", className)}
    {...props}
  />
));
DialogHeader.displayName = "DialogHeader";

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-xl font-semibold tracking-normal", className)}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm leading-6 text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

const DialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
      className
    )}
    {...props}
  />
));
DialogFooter.displayName = "DialogFooter";

export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
};
