import { describe, expect, test } from "bun:test";
import { parseDate, schedule, toCents } from "./finance";

describe("money and dates", () => {
  test("converts decimals to integer cents without floating point rounding", () => {
    expect(toCents("0.01")).toBe(1);
    expect(toCents("125.50")).toBe(12550);
    expect(() => toCents("12.345")).toThrow();
  });
  test("rejects invalid calendar dates", () => {
    expect(() => parseDate("2026-02-30")).toThrow();
    expect(parseDate("2028-02-29").toISOString().slice(0, 10)).toBe(
      "2028-02-29",
    );
  });
});

describe("installment schedules", () => {
  test("distributes all cents with no lost remainder", () => {
    const rows = schedule(parseDate("2026-01-01"), 3, "monthly", 10001);
    expect(rows.map((row) => row.amountCents)).toEqual([3334, 3334, 3333]);
    expect(rows.reduce((sum, row) => sum + row.amountCents, 0)).toBe(10001);
  });
  test("clamps monthly dates rather than skipping short months", () => {
    const rows = schedule(parseDate("2026-01-31"), 3, "monthly", 300);
    expect(rows.map((row) => row.dueAt.toISOString().slice(0, 10))).toEqual([
      "2026-02-28",
      "2026-03-31",
      "2026-04-30",
    ]);
  });
  test("advances weekly and biweekly installments from sale date", () => {
    expect(
      schedule(parseDate("2026-10-01"), 2, "weekly", 200)[1]
        .dueAt.toISOString()
        .slice(0, 10),
    ).toBe("2026-10-15");
    expect(
      schedule(parseDate("2026-10-01"), 1, "biweekly", 100)[0]
        .dueAt.toISOString()
        .slice(0, 10),
    ).toBe("2026-10-15");
  });
  test("rejects installments exceeding available cents", () => {
    expect(() => schedule(parseDate("2026-01-01"), 4, "monthly", 3)).toThrow();
  });
});
