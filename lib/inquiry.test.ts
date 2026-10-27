import { expect, test } from "bun:test";
import {
  inquiryFrom,
  inquiryMessage,
  whatsAppLink,
  whatsAppNumber,
} from "./inquiry";

const details = {
  storeName: "JOTACELL",
  reference: "cmue9mg7n0008nz010fv7naxk",
  brand: "Apple",
  model: "iPhone 13",
  priceCents: 145000,
  storage: "128GB",
  color: "Azul",
  condition: "Open Box",
};

test("Peruvian mobiles receive the 51 country code", () => {
  expect(whatsAppNumber("999 888 777")).toBe("51999888777");
  expect(whatsAppNumber("+51 999 888 777")).toBe("51999888777");
  expect(whatsAppNumber("")).toBe("");
  expect(whatsAppNumber("12345")).toBe("");
});

test("message reflects the selected variant", () => {
  const message = inquiryMessage(details);
  expect(message).toContain("Hola JOTACELL");
  expect(message).toContain("Equipo: Apple iPhone 13");
  expect(message).toContain("1,450");
  expect(message).toContain("Almacenamiento: 128GB");
  expect(message).toContain("Color: Azul");
  expect(message).toContain("Estado: Open Box");
  expect(message).toContain("Ref: cmue9mg7n0008nz010fv7naxk");
  expect(
    message.endsWith("¿Cuáles son los métodos de pago y opciones de entrega?"),
  ).toBe(true);
});

test("link encodes the message and hides itself without a phone", () => {
  const message = inquiryMessage(details);
  const link = whatsAppLink("999888777", message);
  expect(link.startsWith("https://wa.me/51999888777?text=")).toBe(true);
  expect(decodeURIComponent(link.split("text=")[1])).toBe(message);
  expect(whatsAppLink("", message)).toBe("");
});

test("inquiry follows the active variant and its offer price", () => {
  const product = {
    id: "ref-1",
    brand: "Apple",
    model: "iPhone 13",
    condition: "Open Box",
  };
  const base = {
    storage: "128GB",
    color: "Azul",
    priceCents: 145000,
    salePriceCents: null,
  };
  expect(inquiryFrom(product, base, "JOTACELL")).toMatchObject({
    priceCents: 145000,
    storage: "128GB",
    color: "Azul",
  });
  expect(
    inquiryFrom(
      product,
      { ...base, storage: "256GB", color: "Negro", salePriceCents: 139900 },
      "JOTACELL",
    ),
  ).toMatchObject({
    priceCents: 139900,
    storage: "256GB",
    color: "Negro",
  });
});
