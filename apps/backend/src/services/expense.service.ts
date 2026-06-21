import { Prisma } from "@prisma/client";

import { NotFoundError, ValidationError } from "../errors/app-error.js";
import {
  findCategoryById,
  findCategoriesByIds
} from "../repositories/category.repository.js";
import {
  createExpense,
  findActiveExpenseById,
  findExpenses,
  softDeleteExpense,
  summarizeExpenses,
  updateExpense,
  type ExpenseFilters as RepositoryExpenseFilters,
  type ExpenseWithCategory,
  type ExpenseWriteInput
} from "../repositories/expense.repository.js";
import type {
  ExpenseFilters,
  ExpensePayload
} from "../validators/expense.validator.js";

type ExpenseResponse = {
  id: string;
  amount: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  note: string | null;
  expenseDate: string;
  createdAt: string;
  updatedAt: string;
};

type ExpenseSummaryResponse = {
  totalSpend: string;
  categories: {
    category: {
      id: string;
      name: string;
      slug: string;
    };
    total: string;
  }[];
};

function decimalToMoneyString(value: Prisma.Decimal | null): string {
  return (value ?? new Prisma.Decimal(0)).toFixed(2);
}

function dateOnlyToDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function dateToDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function toExpenseResponse(expense: ExpenseWithCategory): ExpenseResponse {
  return {
    id: expense.id,
    amount: decimalToMoneyString(expense.amount),
    category: expense.category,
    note: expense.note,
    expenseDate: dateToDateOnly(expense.expenseDate),
    createdAt: expense.createdAt.toISOString(),
    updatedAt: expense.updatedAt.toISOString()
  };
}

function toRepositoryFilters(filters: ExpenseFilters): RepositoryExpenseFilters {
  return {
    from: filters.from === undefined ? undefined : dateOnlyToDate(filters.from),
    to: filters.to === undefined ? undefined : dateOnlyToDate(filters.to),
    categoryId: filters.categoryId
  };
}

async function assertCategoryExists(categoryId: string): Promise<void> {
  const category = await findCategoryById(categoryId);

  if (category === null) {
    throw new ValidationError("Invalid expense filters", [
      "categoryId: Category does not exist"
    ]);
  }
}

async function assertCategoryIsActive(categoryId: string): Promise<void> {
  const category = await findCategoryById(categoryId);

  if (category === null || !category.isActive) {
    throw new ValidationError("Invalid expense payload", [
      "categoryId: Category must exist and be active"
    ]);
  }
}

function toExpenseWriteInput(payload: ExpensePayload): ExpenseWriteInput {
  return {
    amount: new Prisma.Decimal(payload.amount),
    categoryId: payload.categoryId,
    note: payload.note,
    expenseDate: dateOnlyToDate(payload.expenseDate)
  };
}

export async function listExpenses(
  filters: ExpenseFilters
): Promise<ExpenseResponse[]> {
  if (filters.categoryId !== undefined) {
    await assertCategoryExists(filters.categoryId);
  }

  const expenses = await findExpenses(toRepositoryFilters(filters));

  return expenses.map(toExpenseResponse);
}

export async function getExpense(id: string): Promise<ExpenseResponse> {
  const expense = await findActiveExpenseById(id);

  if (expense === null) {
    throw new NotFoundError("Expense not found");
  }

  return toExpenseResponse(expense);
}

export async function addExpense(
  payload: ExpensePayload
): Promise<ExpenseResponse> {
  await assertCategoryIsActive(payload.categoryId);

  const expense = await createExpense(toExpenseWriteInput(payload));

  return toExpenseResponse(expense);
}

export async function editExpense(
  id: string,
  payload: ExpensePayload
): Promise<ExpenseResponse> {
  const expense = await findActiveExpenseById(id);

  if (expense === null) {
    throw new NotFoundError("Expense not found");
  }

  await assertCategoryIsActive(payload.categoryId);

  const updatedExpense = await updateExpense(id, toExpenseWriteInput(payload));

  return toExpenseResponse(updatedExpense);
}

export async function deleteExpense(id: string): Promise<{ id: string; deleted: true }> {
  const expense = await findActiveExpenseById(id);

  if (expense === null) {
    throw new NotFoundError("Expense not found");
  }

  await softDeleteExpense(id);

  return {
    id,
    deleted: true
  };
}

export async function getExpenseSummary(
  filters: ExpenseFilters
): Promise<ExpenseSummaryResponse> {
  if (filters.categoryId !== undefined) {
    await assertCategoryExists(filters.categoryId);
  }

  const summary = await summarizeExpenses(toRepositoryFilters(filters));
  const categoryIds = summary.categoryTotals.map((row) => row.categoryId);
  const categories = await findCategoriesByIds(categoryIds);
  const totalByCategoryId = new Map(
    summary.categoryTotals.map((row) => [row.categoryId, row.total])
  );

  return {
    totalSpend: decimalToMoneyString(summary.totalSpend),
    categories: categories
      .map((category) => {
        const total = totalByCategoryId.get(category.id);

        if (total === undefined) {
          return null;
        }

        return {
          category: {
            id: category.id,
            name: category.name,
            slug: category.slug
          },
          total: decimalToMoneyString(total)
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null)
  };
}
