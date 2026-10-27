import { money } from "./format";

export type InquiryDetails = {
  storeName: string;
  reference: string;
  brand: string;
  model: string;
  priceCents: number;
  storage?: string;
  color?: string;
  condition?: string;
};

const clean = (value?: string | null) =>
  (value || "").replace(/\s+/g, " ").trim();

/**
 * Normalizes a phone number for wa.me. Peruvian mobiles are stored locally with
 * nine digits, so the country code is added when it is missing.
 */
export function whatsAppNumber(phone: string) {
  const digits = (phone || "").replace(/\D/g, "");
  if (digits.length === 9 && digits.startsWith("9")) return `51${digits}`;
  if (digits.length === 11 && digits.startsWith("51")) return digits;
  return digits.length >= 10 && digits.length <= 15 ? digits : "";
}

export function inquiryMessage(details: InquiryDetails) {
  const store = clean(details.storeName) || "la tienda";
  const lines = [
    `Hola ${store}, quiero confirmar la disponibilidad de este equipo:`,
    "",
    `Equipo: ${[clean(details.brand), clean(details.model)].filter(Boolean).join(" ")}`,
    `Marca: ${clean(details.brand)}`,
    `Precio: ${details.priceCents > 0 ? money(details.priceCents) : "Consultar"}`,
  ];
  const storage = clean(details.storage);
  const color = clean(details.color);
  const condition = clean(details.condition);
  if (storage) lines.push(`Almacenamiento: ${storage}`);
  if (color) lines.push(`Color: ${color}`);
  if (condition) lines.push(`Estado: ${condition}`);
  if (clean(details.reference)) lines.push(`Ref: ${clean(details.reference)}`);
  lines.push("", "¿Cuáles son los métodos de pago y opciones de entrega?");
  return lines.join("\n");
}

export function whatsAppLink(phone: string, message: string) {
  const number = whatsAppNumber(phone);
  return number
    ? `https://wa.me/${number}?text=${encodeURIComponent(message)}`
    : "";
}

export const inquiryFrom = (
  product: {
    id: string;
    brand: string;
    model: string;
    condition?: string | null;
  },
  variant:
    | {
        storage: string;
        color: string;
        priceCents: number;
        salePriceCents?: number | null;
      }
    | null
    | undefined,
  storeName: string,
): InquiryDetails => ({
  storeName,
  reference: product.id,
  brand: product.brand,
  model: product.model,
  priceCents: variant?.salePriceCents ?? variant?.priceCents ?? 0,
  storage: variant?.storage,
  color: variant?.color,
  condition: product.condition || undefined,
});
