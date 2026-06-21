import type { ErrorRequestHandler } from "express";

import { env } from "../env.js";

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error(error);

  const responseBody: {
    error: {
      message: string;
      stack?: string;
    };
  } = {
    error: {
      message: "Internal server error"
    }
  };

  if (env.NODE_ENV !== "production" && error instanceof Error) {
    responseBody.error.stack = error.stack;
  }

  res.status(500).json(responseBody);
};
