import { ExpenseManager } from "@/components/expense-manager";

export default function Home() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(173_44%_96%)_100%)]">
      <ExpenseManager />
    </main>
  );
}
