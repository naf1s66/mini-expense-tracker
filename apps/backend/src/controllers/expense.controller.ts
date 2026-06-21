import type { RequestHandler } from "express";

import {
  addExpense,
  deleteExpense,
  editExpense,
  getExpense,
  getExpenseSummary,
  listExpenses
} from "../services/expense.service.js";
import {
  parseExpenseFilters,
  parseExpenseId,
  parseExpensePayload
} from "../validators/expense.validator.js";

export const getExpenses: RequestHandler = async (req, res) => {
  const filters = parseExpenseFilters(req.query);
  const expenses = await listExpenses(filters);

  res.status(200).json({
    data: expenses
  });
};

export const createExpense: RequestHandler = async (req, res) => {
  const payload = parseExpensePayload(req.body);
  const expense = await addExpense(payload);

  res.status(201).json({
    data: expense
  });
};

export const getExpenseById: RequestHandler = async (req, res) => {
  const id = parseExpenseId(req.params);
  const expense = await getExpense(id);

  res.status(200).json({
    data: expense
  });
};

export const updateExpense: RequestHandler = async (req, res) => {
  const id = parseExpenseId(req.params);
  const payload = parseExpensePayload(req.body);
  const expense = await editExpense(id, payload);

  res.status(200).json({
    data: expense
  });
};

export const removeExpense: RequestHandler = async (req, res) => {
  const id = parseExpenseId(req.params);
  const result = await deleteExpense(id);

  res.status(200).json({
    data: result
  });
};

export const getSummary: RequestHandler = async (req, res) => {
  const filters = parseExpenseFilters(req.query);
  const summary = await getExpenseSummary(filters);

  res.status(200).json({
    data: summary
  });
};
