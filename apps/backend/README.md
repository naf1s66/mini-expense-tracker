# Backend API

This package contains the Express API and Prisma/PostgreSQL data layer for the Mini Expense Tracker backend.

## Setup

1. Copy `apps/backend/.env.example` to `apps/backend/.env`.
2. Set `DATABASE_URL` to a running PostgreSQL database.
3. Adjust `PORT` and `CORS_ORIGIN` if the defaults do not match your local setup.
4. Run the Prisma commands from the repo root:

```sh
npm run backend:prisma:generate
npm run backend:prisma:migrate
npm run backend:prisma:seed
```

The initial migration includes the PostgreSQL `CHECK ("amount" > 0)` constraint for expenses. Category seeding is idempotent and uses slugs as stable identifiers.

## Development

Run the backend API locally:

```sh
npm run backend:dev
```

Available endpoints:

```text
GET /api/health
GET /api/categories
GET /api/expenses
POST /api/expenses
GET /api/expenses/summary
GET /api/expenses/:id
PUT /api/expenses/:id
DELETE /api/expenses/:id
```

`GET /api/categories` returns active categories only, ordered by `sortOrder`, and exposes `id`, `name`, `slug`, and `sortOrder`.

`GET /api/expenses` and `GET /api/expenses/summary` support optional `from`, `to`, and `categoryId` query parameters. Date filters use `YYYY-MM-DD` values and filter by `expenseDate`.

Expense create and update payloads use this shape:

```json
{
  "amount": "12.50",
  "categoryId": "category-id",
  "note": "Lunch",
  "expenseDate": "2026-06-21"
}
```

Amounts are accepted as strings, stored with Prisma/PostgreSQL decimal storage, and returned as strings. Deletes are soft deletes and normal expense reads, lists, and summaries exclude deleted rows.

Live category and expense endpoint verification requires PostgreSQL to be running with migrations applied and the category seed completed.

## Checks

Run these commands from the repo root:

```sh
npm run backend:typecheck
npm run backend:build
npm run backend:prisma:generate
npm run backend:prisma:validate
```
