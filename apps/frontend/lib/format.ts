export function formatMoney(amount: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(amount));
}

export function formatDateOnly(date: string): string {
  const parsed = new Date(`${date}T00:00:00.000Z`);

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  }).format(parsed);
}
