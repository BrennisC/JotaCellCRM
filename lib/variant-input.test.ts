import { expect, test } from "bun:test";
import { InputError } from "./validation";
import { variantValues } from "./variant-input";

const base = {
  color: "Negro",
  ram: "8 GB",
  storage: "128 GB",
  price: "1450.00",
  stock: "3",
};

test("prices are stored as integer cents", () => {
  const values = variantValues(base);
  expect(values.priceCents).toBe(145000);
  expect(values.salePriceCents).toBeNull();
  expect(values.stock).toBe(3);
  expect(values.colorHex).toBe("#dceaf4");
});

test("optional fields fall back to safe defaults", () => {
  const values = variantValues({
    ...base,
    stock: undefined,
    colorHex: "#A1B2C3",
  });
  expect(values.stock).toBe(0);
  expect(values.colorHex).toBe("#A1B2C3");
});

test("the offer must be lower than the regular price", () => {
  expect(variantValues({ ...base, salePrice: "1300" }).salePriceCents).toBe(
    130000,
  );
  expect(() => variantValues({ ...base, salePrice: "1500" })).toThrow(
    InputError,
  );
  expect(() => variantValues({ ...base, salePrice: "1450" })).toThrow(
    InputError,
  );
});

test("prices without a valid amount are rejected", () => {
  expect(() => variantValues({ ...base, price: "" })).toThrow(InputError);
  expect(() => variantValues({ ...base, price: "0" })).toThrow(InputError);
  expect(() => variantValues({ ...base, price: "12.345" })).toThrow(InputError);
  expect(() => variantValues({ ...base, stock: "-1" })).toThrow(InputError);
});

test("storage, color and ram are mandatory", () => {
  expect(() => variantValues({ ...base, storage: " " })).toThrow(InputError);
  expect(() => variantValues({ ...base, color: "" })).toThrow(InputError);
  expect(() => variantValues({ ...base, ram: undefined })).toThrow(InputError);
});
