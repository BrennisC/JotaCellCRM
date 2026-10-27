"use client";
import {
  ArrowDownLeft,
  BarChart3,
  Download,
  FileText,
  Package,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { money, dateKey } from "@/lib/format";
import type { AdminData } from "./types";
import { stateOf } from "./types";
import { PageTitle } from "./form-parts";

const formats = ["Excel", "PDF"];
async function exportReport(type: string, format: string, data: AdminData) {
  let headers: string[] = [];
  let rows: (string | number)[][] = [];
  if (type === "sales") {
    headers = [
      "Fecha",
      "Código",
      "Marca",
      "Modelo",
      "Comprador",
      "Tipo",
      "Precio (S/)",
    ];
    rows = data.sales.map((s) => [
      dateKey(new Date(s.soldAt)),
      s.code,
      s.variant.product.brand,
      s.variant.product.model,
      s.buyerName,
      s.type,
      s.priceCents / 100,
    ]);
  }
  if (type === "stock") {
    headers = [
      "Marca",
      "Modelo",
      "Color",
      "RAM",
      "Almacenamiento",
      "Stock",
      "Precio (S/)",
    ];
    rows = data.products.flatMap((p) =>
      p.variants.map((v) => [
        p.brand,
        p.model,
        v.color,
        v.ram,
        v.storage,
        v.stock,
        (v.salePriceCents ?? v.priceCents) / 100,
      ]),
    );
  }
  if (type === "payments") {
    headers = ["Fecha", "Venta", "Comprador", "Tipo", "Importe (S/)"];
    rows = data.sales.flatMap((s) =>
      s.payments.map((p) => [
        dateKey(new Date(p.paidAt)),
        s.code,
        s.buyerName,
        p.kind,
        p.amountCents / 100,
      ]),
    );
  }
  if (type === "installments") {
    headers = [
      "Venta",
      "Titular",
      "Número",
      "Vencimiento",
      "Estado",
      "Pendiente (S/)",
    ];
    rows = data.sales.flatMap((s) =>
      s.installments.map((i) => [
        s.code,
        s.buyerName,
        i.number,
        dateKey(new Date(i.dueAt)),
        stateOf(i),
        (i.amountCents - i.paidCents) / 100,
      ]),
    );
  }
  if (type === "popular") {
    headers = ["Marca", "Modelo", "Vendidos"];
    const count = new Map<string, number>();
    data.sales.forEach((s) =>
      count.set(
        `${s.variant.product.brand} ${s.variant.product.model}`,
        (count.get(`${s.variant.product.brand} ${s.variant.product.model}`) ||
          0) + 1,
      ),
    );
    rows = [...count]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => [
        name.slice(0, name.indexOf(" ")),
        name.slice(name.indexOf(" ") + 1),
        count,
      ]);
  }
  const name = `jotacell-${type}-${dateKey(new Date())}`;
  if (format === "Excel") {
    const xlsx = await import("xlsx");
    const book = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(
      book,
      xlsx.utils.aoa_to_sheet([headers, ...rows]),
      "Reporte",
    );
    xlsx.writeFile(book, `${name}.xlsx`);
  } else {
    const [{ jsPDF }, { autoTable }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);
    const pdf = new jsPDF({ orientation: "landscape" });
    pdf.setFontSize(15);
    pdf.text(`JOTACELL - ${type} - ${dateKey(new Date())}`, 12, 17);
    autoTable(pdf, {
      startY: 23,
      head: [headers],
      body: rows.map((row) => row.map((value) => String(value ?? ""))),
      styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
      headStyles: { fillColor: [23, 35, 61] },
      margin: 12,
    });
    pdf.save(`${name}.pdf`);
  }
}
export function ReportsSection({ data }: { data: AdminData }) {
  const payments = data.sales.flatMap((s) => s.payments),
    month = new Date().toISOString().slice(0, 7),
    due = data.sales.reduce(
      (n, s) =>
        n +
        Math.max(
          0,
          s.priceCents - s.payments.reduce((a, p) => a + p.amountCents, 0),
        ),
      0,
    );
  const reports = [
    [
      "sales",
      "Ventas diarias y mensuales",
      "Todas las operaciones con fecha y precio",
      ShoppingBag,
    ],
    ["stock", "Stock disponible", "Variantes y existencias actuales", Package],
    [
      "popular",
      "Equipos más vendidos",
      "Ranking por modelos registrados",
      BarChart3,
    ],
    [
      "payments",
      "Recaudación e historial",
      "Todos los cobros realizados",
      Wallet,
    ],
    [
      "installments",
      "Estado de cuenta y cuotas",
      "Deudas, vencimientos y saldos",
      FileText,
    ],
  ] as const;
  return (
    <>
      <PageTitle
        tag="TUS NÚMEROS"
        title="Reportes"
        description="Consulta y descargá la información que necesitas, sin integraciones externas."
      />
      <div className="report-summary">
        <div>
          <span className="stat-icon sage">
            <Wallet size={20} />
          </span>
          <small>RECAUDACIÓN TOTAL</small>
          <strong>
            {money(payments.reduce((n, p) => n + p.amountCents, 0))}
          </strong>
        </div>
        <div>
          <span className="stat-icon blue">
            <ArrowDownLeft size={20} />
          </span>
          <small>INGRESOS DEL MES</small>
          <strong>
            {money(
              payments
                .filter((p) => p.paidAt.slice(0, 7) === month)
                .reduce((n, p) => n + p.amountCents, 0),
            )}
          </strong>
        </div>
        <div>
          <span className="stat-icon rose">
            <BarChart3 size={20} />
          </span>
          <small>POR COBRAR</small>
          <strong>{money(due)}</strong>
        </div>
      </div>
      <div className="admin-panel table-panel">
        <div className="admin-panel-head">
          <div>
            <h2>Descargar información</h2>
            <p>Archivos generados directamente en tu navegador</p>
          </div>
        </div>
        {reports.map(([key, title, description, Icon]) => (
          <div className="report-row" key={key}>
            <span className="stat-icon lavender">
              <Icon size={21} />
            </span>
            <div className="admin-row-main">
              <strong>{title}</strong>
              <small>{description}</small>
            </div>
            <div className="report-buttons">
              {formats.map((f) => (
                <button
                  key={f}
                  className="admin-secondary small"
                  onClick={() => void exportReport(key, f, data)}
                >
                  <Download size={15} />
                  {f}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
