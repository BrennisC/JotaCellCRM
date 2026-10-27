import { InputError, integer, required } from "./validation";
import { toCents } from "./finance";

export type VariantValues = {
  color: string;
  colorHex: string;
  ram: string;
  storage: string;
  priceCents: number;
  salePriceCents: number | null;
  stock: number;
};

const cents = (value: unknown, label: string) => {
  try {
    return toCents(value);
  } catch (error) {
    throw new InputError(`${label}: ${(error as Error).message}`);
  }
};

/** Validates a variant payload shared by the product form and the variants API. */
export function variantValues(d: Record<string, unknown>): VariantValues {
  const values = {
    color: required(d.color, "Color"),
    colorHex: /^#[0-9a-fA-F]{6}$/.test(String(d.colorHex))
      ? String(d.colorHex)
      : "#dceaf4",
    ram: required(d.ram, "RAM"),
    storage: required(d.storage, "Almacenamiento"),
    priceCents: cents(d.price, "Precio regular"),
    salePriceCents: d.salePrice ? cents(d.salePrice, "Precio oferta") : null,
    stock: integer(d.stock ?? 0, "Stock"),
  };
  if (values.priceCents <= 0)
    throw new InputError("El precio regular debe ser mayor que cero.");
  if (
    values.salePriceCents !== null &&
    (values.salePriceCents <= 0 || values.salePriceCents >= values.priceCents)
  )
    throw new InputError(
      "Precios inválidos. La oferta debe ser menor que el precio regular.",
    );
  return values;
}
