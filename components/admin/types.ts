export type Serial = { id: string; imei: string; sold: boolean };
export type Variant = {
  id: string;
  productId: string;
  color: string;
  colorHex: string;
  ram: string;
  storage: string;
  priceCents: number;
  salePriceCents: number | null;
  stock: number;
  serials: Serial[];
};
export type Product = {
  id: string;
  slug: string;
  brand: string;
  model: string;
  description: string;
  warranty: string;
  condition: string;
  published: boolean;
  featured: boolean;
  images: string[];
  specs: Record<string, Record<string, string>>;
  variants: Variant[];
};
export type Installment = {
  id: string;
  number: number;
  dueAt: string;
  amountCents: number;
  paidCents: number;
};
export type Payment = {
  id: string;
  installmentId: string | null;
  kind: string;
  amountCents: number;
  paidAt: string;
  reference: string;
};
export type Sale = {
  id: string;
  code: string;
  soldAt: string;
  variantId: string;
  imei: string | null;
  buyerName: string;
  buyerDocument: string;
  buyerPhone: string;
  priceCents: number;
  downCents: number;
  type: string;
  frequency: string;
  installmentsNo: number;
  status: string;
  variant: Variant & { product: Product };
  installments: Installment[];
  payments: Payment[];
};
export type Settings = {
  name: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  about: string;
};
export type AdminData = {
  products: Product[];
  sales: Sale[];
  settings: Settings | null;
  admin: { name: string; email: string };
};
export type Tab =
  | "dashboard"
  | "products"
  | "inventory"
  | "sales"
  | "installments"
  | "reports"
  | "settings";
export const stateOf = (item: Installment) =>
  item.paidCents === item.amountCents
    ? "Pagada"
    : new Date(item.dueAt).toISOString().slice(0, 10) <
        new Date().toLocaleDateString("en-CA")
      ? "Vencida"
      : item.paidCents > 0
        ? "Parcial"
        : "Pendiente";
