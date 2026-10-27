export const money = (cents: number) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 2,
  }).format(cents / 100);
export const day = (date: string | Date) =>
  new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
export const dateKey = (date: Date) => date.toISOString().slice(0, 10);
