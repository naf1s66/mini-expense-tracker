export type ExpenseFormValues = {
  amount: string;
  categoryId: string;
  note: string;
  expenseDate: string;
};

export type ExpenseFormErrors = Partial<Record<keyof ExpenseFormValues, string>>;

const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
const amountPattern = /^\d+(\.\d{1,2})?$/;

export function todayDateOnly(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isValidDateOnly(value: string): boolean {
  if (!dateOnlyPattern.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function validateExpenseForm(
  values: ExpenseFormValues
): ExpenseFormErrors {
  const errors: ExpenseFormErrors = {};
  const amount = values.amount.trim();
  const note = values.note.trim();
  const normalizedAmount = amount.replace(/^0+(?=\d)/, "");

  if (amount.length === 0) {
    errors.amount = "Amount is required.";
  } else if (!amountPattern.test(amount)) {
    errors.amount =
      "Enter a decimal amount with no more than 2 decimal places.";
  } else if (
    normalizedAmount === "0" ||
    normalizedAmount === "0.0" ||
    normalizedAmount === "0.00"
  ) {
    errors.amount = "Amount must be greater than 0.";
  } else if (normalizedAmount.split(".")[0].length > 8) {
    errors.amount = "Amount must be less than or equal to 99999999.99.";
  }

  if (values.categoryId.length === 0) {
    errors.categoryId = "Choose a category.";
  }

  if (note.length > 255) {
    errors.note = "Note must be 255 characters or less.";
  }

  if (values.expenseDate.length === 0) {
    errors.expenseDate = "Expense date is required.";
  } else if (!isValidDateOnly(values.expenseDate)) {
    errors.expenseDate = "Enter a valid date.";
  } else if (values.expenseDate > todayDateOnly()) {
    errors.expenseDate = "Expense date cannot be in the future.";
  }

  return errors;
}
