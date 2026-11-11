import { describe, expect, test } from "bun:test";
import { nextSaleCode } from "./sale-code";

describe("sale codes", () => {
  test("starts at VEN-001 when there are no sales", () => {
    expect(nextSaleCode([])).toBe("VEN-001");
  });
  test("continues from the highest numeric suffix", () => {
    expect(nextSaleCode(["VEN-001", "VEN-002", "VEN-010"])).toBe("VEN-011");
  });
  test("ignores codes that do not follow the VEN-### pattern", () => {
    expect(nextSaleCode(["ABC-1", "VEN-003", "MANUAL"])).toBe("VEN-004");
  });
  test("pads short numbers and keeps growing past three digits", () => {
    expect(nextSaleCode(["VEN-009"])).toBe("VEN-010");
    expect(nextSaleCode(["VEN-999"])).toBe("VEN-1000");
  });
});
