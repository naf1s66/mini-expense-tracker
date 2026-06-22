export type Category = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
};

export type Expense = {
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

export type CreateExpensePayload = {
  amount: string;
  categoryId: string;
  note?: string | null;
  expenseDate: string;
};

type ApiSuccess<T> = {
  data: T;
};

type ApiErrorBody = {
  error?: {
    message?: string;
    details?: string[];
  };
};

export class ApiError extends Error {
  details: string[];
  status?: number;

  constructor(message: string, details: string[] = [], status?: number) {
    super(message);
    this.name = "ApiError";
    this.details = details;
    this.status = status;
  }
}

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

async function parseApiError(response: Response): Promise<ApiError> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    const message = body.error?.message ?? "Request failed.";
    const details = Array.isArray(body.error?.details)
      ? body.error.details
      : [];

    return new ApiError(message, details, response.status);
  } catch {
    return new ApiError("Request failed.", [], response.status);
  }
}

async function request<T>(
  path: string,
  init?: RequestInit,
  expectedStatus?: number
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers
      }
    });
  } catch {
    throw new ApiError(
      "Unable to reach the backend API. Check that the backend server is running."
    );
  }

  if (
    !response.ok ||
    (expectedStatus !== undefined && response.status !== expectedStatus)
  ) {
    throw await parseApiError(response);
  }

  const body = (await response.json()) as ApiSuccess<T>;

  return body.data;
}

export function fetchCategories(): Promise<Category[]> {
  return request<Category[]>("/categories", {
    method: "GET",
    cache: "no-store"
  });
}

export function createExpense(payload: CreateExpensePayload): Promise<Expense> {
  return request<Expense>(
    "/expenses",
    {
      method: "POST",
      body: JSON.stringify(payload)
    },
    201
  );
}
