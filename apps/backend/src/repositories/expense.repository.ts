import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma/client.js";

export type ExpenseFilters = {
  from?: Date;
  to?: Date;
  categoryId?: string;
};

export type ExpenseWriteInput = {
  amount: Prisma.Decimal;
  categoryId: string;
  note: string | null;
  expenseDate: Date;
};

export type ExpenseWithCategory = {
  id: string;
  amount: Prisma.Decimal;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  note: string | null;
  expenseDate: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type ExpenseSummaryRow = {
  categoryId: string;
  total: Prisma.Decimal;
};

const expenseSelect = {
  id: true,
  amount: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true
    }
  },
  note: true,
  expenseDate: true,
  createdAt: true,
  updatedAt: true
} satisfies Prisma.ExpenseSelect;

function buildExpenseWhere(
  filters: ExpenseFilters = {}
): Prisma.ExpenseWhereInput {
  return {
    deletedAt: null,
    categoryId: filters.categoryId,
    expenseDate: {
      gte: filters.from,
      lte: filters.to
    }
  };
}

export async function findExpenses(
  filters: ExpenseFilters = {}
): Promise<ExpenseWithCategory[]> {
  return prisma.expense.findMany({
    where: buildExpenseWhere(filters),
    orderBy: [{ expenseDate: "desc" }, { createdAt: "desc" }],
    select: expenseSelect
  });
}

export async function findActiveExpenseById(
  id: string
): Promise<ExpenseWithCategory | null> {
  return prisma.expense.findFirst({
    where: {
      id,
      deletedAt: null
    },
    select: expenseSelect
  });
}

export async function createExpense(
  data: ExpenseWriteInput
): Promise<ExpenseWithCategory> {
  return prisma.expense.create({
    data,
    select: expenseSelect
  });
}

export async function updateExpense(
  id: string,
  data: ExpenseWriteInput
): Promise<ExpenseWithCategory> {
  return prisma.expense.update({
    where: {
      id
    },
    data,
    select: expenseSelect
  });
}

export async function softDeleteExpense(id: string): Promise<void> {
  await prisma.expense.update({
    where: {
      id
    },
    data: {
      deletedAt: new Date()
    }
  });
}

export async function summarizeExpenses(filters: ExpenseFilters = {}): Promise<{
  totalSpend: Prisma.Decimal | null;
  categoryTotals: ExpenseSummaryRow[];
}> {
  const where = buildExpenseWhere(filters);
  const [total, categoryTotals] = await prisma.$transaction([
    prisma.expense.aggregate({
      where,
      _sum: {
        amount: true
      }
    }),
    prisma.expense.groupBy({
      by: ["categoryId"],
      where,
      orderBy: {
        categoryId: "asc"
      },
      _sum: {
        amount: true
      }
    })
  ]);

  return {
    totalSpend: total._sum.amount,
    categoryTotals: categoryTotals.reduce<ExpenseSummaryRow[]>((rows, row) => {
      const rowTotal = row._sum?.amount;

      if (rowTotal !== null && rowTotal !== undefined) {
        rows.push({
          categoryId: row.categoryId,
          total: rowTotal
        });
      }

      return rows;
    }, [])
  };
}
