export class AppError extends Error {
  readonly statusCode: number;
  readonly details?: string[];

  constructor(message: string, statusCode: number, details?: string[]) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: string[]) {
    super(message, 400, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
  }
}
