import { ExpenseForm } from "@/components/expense-form";

export default function Home() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(173_44%_96%)_100%)]">
      <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-6 sm:px-6 sm:py-10 lg:py-14">
        <header className="mb-8">
          <p className="text-sm font-medium text-primary">Mini Expense Tracker</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
            Add an expense
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            Record a purchase with the amount, category, note, and date.
          </p>
        </header>

        <ExpenseForm />
      </section>
    </main>
  );
}
