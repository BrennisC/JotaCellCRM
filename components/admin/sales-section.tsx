"use client";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Plus, Search, ShoppingBag } from "lucide-react";
import { money, day } from "@/lib/format";
import type { AdminData, Sale } from "./types";
import { Badge, PageTitle } from "./form-parts";
import { SaleForm } from "./sale-form";

type Submit = (
  path: string,
  body: Record<string, unknown>,
  method?: string,
) => Promise<unknown>;
export function SalesSection({
  data,
  submit,
}: {
  data: AdminData;
  submit: Submit;
}) {
  const [modal, setModal] = useState(false),
    [editing, setEditing] = useState<Sale | null>(null),
    [selected, setSelected] = useState<Sale | null>(null),
    [search, setSearch] = useState("");
  return (
    <>
      <PageTitle
        tag="OPERACIONES DE LA TIENDA"
        title={selected ? "Detalle de venta" : "Ventas"}
        description={
          selected
            ? `${selected.code} · ${selected.buyerName}`
            : "Registra cada operación y mantén el historial al día."
        }
        action={
          selected ? (
            <button
              className="admin-secondary"
              onClick={() => setSelected(null)}
            >
              <ArrowLeft size={17} /> Volver
            </button>
          ) : (
            <button
              className="admin-primary"
              onClick={() => {
                setEditing(null);
                setModal(true);
              }}
            >
              <Plus size={18} /> Nueva venta
            </button>
          )
        }
      />
      {selected ? (
        <SaleDetail
          sale={data.sales.find((s) => s.id === selected.id) || selected}
          onEdit={() => {
            setEditing(selected);
            setModal(true);
          }}
        />
      ) : (
        <>
          <div className="admin-search">
            <Search size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar código, comprador o celular..."
            />
          </div>
          <div className="admin-panel table-panel">
            <div className="admin-panel-head">
              <div>
                <h2>Historial de ventas</h2>
                <p>{data.sales.length} operaciones registradas</p>
              </div>
            </div>
            {data.sales.filter((s) =>
              `${s.code} ${s.buyerName} ${s.variant.product.model}`
                .toLowerCase()
                .includes(search.toLowerCase()),
            ).length ? (
              data.sales
                .filter((s) =>
                  `${s.code} ${s.buyerName} ${s.variant.product.model}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                )
                .map((s) => (
                  <button
                    className="sale-row"
                    key={s.id}
                    onClick={() => setSelected(s)}
                  >
                    <span className="stat-icon lavender">
                      <ShoppingBag size={20} />
                    </span>
                    <div className="admin-row-main">
                      <strong>
                        {s.variant.product.brand} {s.variant.product.model}
                      </strong>
                      <small>
                        {s.code} · {s.buyerName} · {day(s.soldAt)}
                      </small>
                    </div>
                    <strong>{money(s.priceCents)}</strong>
                    <Badge tone={s.type === "cash" ? "green" : "blue"}>
                      {s.type === "cash" ? "Contado" : "Cuotas"}
                    </Badge>
                    <ArrowRight size={18} />
                  </button>
                ))
            ) : (
              <div className="admin-empty">
                <ShoppingBag size={29} />
                <h3>Todavía no hay ventas</h3>
                <p>Cuando registres la primera, aparecerá en este espacio.</p>
              </div>
            )}
          </div>
        </>
      )}
      {modal && (
        <SaleForm
          data={data}
          editing={editing}
          submit={submit}
          onClose={() => setModal(false)}
        />
      )}
    </>
  );
}

function SaleDetail({ sale, onEdit }: { sale: Sale; onEdit: () => void }) {
  const paid = sale.payments.reduce((n, p) => n + p.amountCents, 0);
  return (
    <>
      <div className="admin-panel sale-detail-head">
        <div>
          <span className="eyebrow">
            <span /> {sale.code}
          </span>
          <h2>
            {sale.variant.product.brand} {sale.variant.product.model}
          </h2>
          <p>
            {sale.variant.color} · {sale.variant.ram} · {sale.variant.storage}
          </p>
          <Badge tone={sale.type === "cash" ? "green" : "blue"}>
            {sale.type === "cash" ? "Contado" : "En cuotas"}
          </Badge>
        </div>
        <button className="admin-secondary" onClick={onEdit}>
          Editar datos
        </button>
      </div>
      <div className="sale-detail-cards">
        <div>
          <small>PRECIO FINAL</small>
          <strong>{money(sale.priceCents)}</strong>
        </div>
        <div>
          <small>MONTO PAGADO</small>
          <strong>{money(paid)}</strong>
        </div>
        <div>
          <small>SALDO PENDIENTE</small>
          <strong>{money(Math.max(0, sale.priceCents - paid))}</strong>
        </div>
        <div>
          <small>PRÓXIMO VENCIMIENTO</small>
          <strong>
            {sale.installments.find((i) => i.paidCents < i.amountCents)
              ? day(
                  sale.installments.find((i) => i.paidCents < i.amountCents)!
                    .dueAt,
                )
              : "—"}
          </strong>
        </div>
      </div>
      <div className="admin-panel sale-detail-info">
        <div className="admin-panel-head">
          <h2>Datos del comprador y operación</h2>
        </div>
        <div>
          <span>Titular</span>
          <strong>{sale.buyerName}</strong>
        </div>
        <div>
          <span>Documento</span>
          <strong>{sale.buyerDocument}</strong>
        </div>
        <div>
          <span>Teléfono</span>
          <strong>{sale.buyerPhone || "—"}</strong>
        </div>
        <div>
          <span>Fecha</span>
          <strong>{day(sale.soldAt)}</strong>
        </div>
        <div>
          <span>IMEI / serie</span>
          <strong>{sale.imei || "—"}</strong>
        </div>
      </div>
    </>
  );
}
