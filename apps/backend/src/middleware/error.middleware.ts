import type { ErrorRequestHandler } from "express";

import { env } from "../env.js";
import { AppError } from "../errors/app-error.js";

function isJsonParseError(error: unknown): boolean {
  return (
    error instanceof SyntaxError &&
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    error.status === 400
  );
}

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error(error);

  if (isJsonParseError(error)) {
    res.status(400).json({
      error: {
        message: "Invalid JSON request body",
        details: ["Request body must be valid JSON"]
      }
    });

    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: {
        message: error.message,
        details: error.details
      }
    });

    return;
  }

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
