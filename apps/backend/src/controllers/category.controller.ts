import type { RequestHandler } from "express";

import { listActiveCategories } from "../services/category.service.js";

export const getCategories: RequestHandler = async (_req, res) => {
  const categories = await listActiveCategories();

  res.status(200).json({
    data: categories
  });
};
