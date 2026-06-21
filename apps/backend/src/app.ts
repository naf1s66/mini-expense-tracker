import cors from "cors";
import express from "express";

import { env } from "./env.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { notFoundMiddleware } from "./middleware/not-found.middleware.js";
import { apiRouter } from "./routes/index.js";

export const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN
  })
);
app.use(express.json());

app.use("/api", apiRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
