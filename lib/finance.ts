export function toCents(value: unknown) {
  const text = String(value ?? "");
  if (!/^\d+(\.\d{1,2})?$/.test(text))
    throw new Error("Importe inválido: usá hasta dos decimales.");
  const [whole, decimal = ""] = text.split(".");
  const amount = Number(whole) * 100 + Number(decimal.padEnd(2, "0"));
  if (!Number.isSafeInteger(amount) || amount > 2147483647)
    throw new Error("Importe fuera de rango.");
  return amount;
}
export function parseDate(value: unknown) {
  const text = String(value ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) throw new Error("Fecha inválida.");
  const parsed = new Date(`${text}T12:00:00.000Z`);
  if (parsed.toISOString().slice(0, 10) !== text)
    throw new Error("Fecha inválida.");
  return parsed;
}
export function schedule(
  start: Date,
  count: number,
  frequency: string,
  balance: number,
) {
  if (!Number.isInteger(count) || count < 1 || count > 240 || balance < count)
    throw new Error("Cantidad de cuotas o saldo inválidos.");
  if (!["weekly", "biweekly", "monthly"].includes(frequency))
    throw new Error("Frecuencia inválida.");
  const amount = Math.floor(balance / count);
  return Array.from({ length: count }, (_, i) => {
    let dueAt: Date;
    if (frequency === "monthly") {
      const year = start.getUTCFullYear(),
        month = start.getUTCMonth() + i + 1;
      const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
      dueAt = new Date(
        Date.UTC(year, month, Math.min(start.getUTCDate(), lastDay), 12),
      );
    } else {
      dueAt = new Date(start);
      dueAt.setUTCDate(
        dueAt.getUTCDate() + (i + 1) * (frequency === "weekly" ? 7 : 14),
      );
    }
    return {
      number: i + 1,
      dueAt,
      amountCents: amount + (i < balance % count ? 1 : 0),
    };
  });
}
