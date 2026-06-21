import { Router } from "express";

import {
  createExpense,
  getExpenseById,
  getExpenses,
  getSummary,
  removeExpense,
  updateExpense
} from "../controllers/expense.controller.js";

export const expenseRouter = Router();

expenseRouter.get("/", getExpenses);
expenseRouter.post("/", createExpense);
expenseRouter.get("/summary", getSummary);
expenseRouter.get("/:id", getExpenseById);
expenseRouter.put("/:id", updateExpense);
expenseRouter.delete("/:id", removeExpense);
