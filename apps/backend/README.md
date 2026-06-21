# Backend data layer

This package contains the Prisma/PostgreSQL schema foundation for the Mini Expense Tracker backend. It intentionally does not include Express routes or frontend code yet.

## Setup

1. Copy `apps/backend/.env.example` to `apps/backend/.env`.
2. Set `DATABASE_URL` to a running PostgreSQL database.
3. Run the Prisma commands from the repo root:

```sh
npm run backend:prisma:generate
npm run backend:prisma:migrate
npm run backend:prisma:seed
```

The initial migration includes the PostgreSQL `CHECK ("amount" > 0)` constraint for expenses. Category seeding is idempotent and uses slugs as stable identifiers.

