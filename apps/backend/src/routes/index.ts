import { Router } from "express";

import { categoryRouter } from "./category.routes.js";
import { expenseRouter } from "./expense.routes.js";
import { healthRouter } from "./health.routes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/categories", categoryRouter);
apiRouter.use("/expenses", expenseRouter);
