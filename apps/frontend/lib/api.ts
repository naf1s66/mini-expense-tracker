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

export type UpdateExpensePayload = CreateExpensePayload;

export type ExpenseQueryFilters = {
  from?: string;
  to?: string;
};

export type DeleteExpenseResult = {
  id: string;
  deleted: true;
};

export type ExpenseSummary = {
  totalSpend: string;
  categories: {
    category: {
      id: string;
      name: string;
      slug: string;
    };
    total: string;
  }[];
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

function browserTimeZone(): string | undefined {
  if (typeof Intl === "undefined") {
    return undefined;
  }

  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

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
  const headers = new Headers(init?.headers);
  const timeZone = browserTimeZone();

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (timeZone) {
    headers.set("X-Time-Zone", timeZone);
  }

  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers
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

function buildQueryString(filters: ExpenseQueryFilters = {}): string {
  const params = new URLSearchParams();

  if (filters.from !== undefined) {
    params.set("from", filters.from);
  }

  if (filters.to !== undefined) {
    params.set("to", filters.to);
  }

  const queryString = params.toString();

  return queryString.length > 0 ? `?${queryString}` : "";
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

export function fetchExpenses(
  filters: ExpenseQueryFilters = {}
): Promise<Expense[]> {
  return request<Expense[]>(`/expenses${buildQueryString(filters)}`, {
    method: "GET",
    cache: "no-store"
  });
}

export function fetchExpenseSummary(
  filters: ExpenseQueryFilters = {}
): Promise<ExpenseSummary> {
  return request<ExpenseSummary>(
    `/expenses/summary${buildQueryString(filters)}`,
    {
      method: "GET",
      cache: "no-store"
    }
  );
}

export function updateExpense(
  id: string,
  payload: UpdateExpensePayload
): Promise<Expense> {
  return request<Expense>(`/expenses/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteExpense(id: string): Promise<DeleteExpenseResult> {
  return request<DeleteExpenseResult>(`/expenses/${id}`, {
    method: "DELETE"
  });
}
