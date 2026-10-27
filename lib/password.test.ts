import { expect, test } from "bun:test";
import { strongPassword } from "./password";

test("accepts a strong administrator password", () => {
  expect(strongPassword("Segura!Clave2026")).toBe(true);
});
test("rejects short or low-complexity passwords", () => {
  expect(strongPassword("password1234")).toBe(false);
  expect(strongPassword("SeguraClave2026")).toBe(false);
  expect(strongPassword("Se1!")).toBe(false);
  expect(strongPassword("A1!" + "a".repeat(130))).toBe(false);
});
