"use client";
import { useState } from "react";
import { Clock3, CreditCard, Plus, ShoppingBag } from "lucide-react";
import { money, day, dateKey } from "@/lib/format";
import type { AdminData, Sale } from "./types";
import { stateOf } from "./types";
import { Actions, Badge, Field, Modal, PageTitle } from "./form-parts";
import { SearchSelect } from "./search-select";
import { AdminPager } from "./admin-pager";
import { paginate } from "@/lib/pagination";
type Submit = (
  path: string,
  body: Record<string, unknown>,
  method?: string,
) => Promise<unknown>;
const pendingOf = (sale: Sale) =>
  Math.max(
    0,
    sale.priceCents - sale.payments.reduce((n, p) => n + p.amountCents, 0),
  );
export function InstallmentsSection({
  data,
  submit,
}: {
  data: AdminData;
  submit: Submit;
}) {
  const [saleId, setSaleId] = useState(""),
    [kind, setKind] = useState("installment"),
    [modal, setModal] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [filter, setFilter] = useState("all"),
    [schedulePage, setSchedulePage] = useState(1),
    [paymentPage, setPaymentPage] = useState(1);
  const installmentSales = data.sales.filter(
    (s) => s.type === "installments" && s.status === "active",
  );
  const selected = installmentSales.find((s) => s.id === saleId);
  const saleItems = installmentSales.map((s) => ({
    id: s.id,
    label: `${s.code} · ${s.buyerName}`,
    meta: money(pendingOf(s)),
    keywords: [
      s.buyerDocument,
      s.buyerPhone,
      s.variant.product.brand,
      s.variant.product.model,
      s.imei ?? "",
    ].join(" "),
  }));
  const initialPaid =
    selected?.payments
      .filter((p) => p.kind === "initial")
      .reduce((n, p) => n + p.amountCents, 0) || 0;
  const balance =
    kind === "initial"
      ? (selected?.downCents || 0) - initialPaid
      : selected?.installments.reduce(
          (n, i) => n + i.amountCents - i.paidCents,
          0,
        ) || 0;
  const installments = data.sales
    .flatMap((s) => s.installments.map((i) => ({ sale: s, item: i })))
    .filter(({ item }) => filter === "all" || stateOf(item) === filter);
  const scheduleRows = paginate(installments, schedulePage, 7);
  const paymentRows = paginate(
    data.sales
      .flatMap((s) => s.payments.map((p) => ({ s, p })))
      .sort((a, b) => b.p.paidAt.localeCompare(a.p.paidAt)),
    paymentPage,
    7,
  );
  return (
    <>
      <PageTitle
        tag="CONTROL FINANCIERO"
        title="Cuotas y pagos"
        description="Cronogramas, abonos parciales y saldos siempre actualizados."
        action={
          <button
            className="admin-primary"
            onClick={() => {
              setSaleId(installmentSales[0]?.id || "");
              setModal(true);
            }}
          >
            <Plus size={18} /> Registrar pago
          </button>
        }
      />
      <div className="installment-overview">
        <div>
          <span className="stat-icon sage">
            <CreditCard size={22} />
          </span>
          <small>PENDIENTES</small>
          <strong>
            {
              data.sales
                .flatMap((s) => s.installments)
                .filter((i) => stateOf(i) === "Pendiente").length
            }
          </strong>
        </div>
        <div>
          <span className="stat-icon rose">
            <Clock3 size={22} />
          </span>
          <small>VENCIDAS</small>
          <strong>
            {
              data.sales
                .flatMap((s) => s.installments)
                .filter((i) => stateOf(i) === "Vencida").length
            }
          </strong>
        </div>
        <div>
          <span className="stat-icon blue">
            <ShoppingBag size={22} />
          </span>
          <small>POR COBRAR</small>
          <strong>
            {money(
              data.sales.reduce(
                (sum, s) =>
                  sum +
                  Math.max(
                    0,
                    s.priceCents -
                      s.payments.reduce((n, p) => n + p.amountCents, 0),
                  ),
                0,
              ),
            )}
          </strong>
        </div>
      </div>
      <div className="admin-panel table-panel">
        <div className="admin-panel-head">
          <div>
            <h2>Cronograma de cuotas</h2>
            <p>Estado según pagos y fecha de vencimiento</p>
          </div>
          <select
            className="filter-select"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setSchedulePage(1);
            }}
          >
            <option value="all">Todos los estados</option>
            <option>Pendiente</option>
            <option>Parcial</option>
            <option>Pagada</option>
            <option>Vencida</option>
          </select>
        </div>
        {scheduleRows.items.length ? (
          scheduleRows.items.map(({ sale, item }) => (
            <div className="installment-admin-row" key={item.id}>
              <span className="installment-index">
                {String(item.number).padStart(2, "0")}
              </span>
              <div className="admin-row-main">
                <strong>{sale.buyerName}</strong>
                <small>
                  {sale.code} · {sale.variant.product.model} · {day(item.dueAt)}
                </small>
              </div>
              <div className="admin-row-price">
                <strong>{money(item.amountCents)}</strong>
                <small>Pagado: {money(item.paidCents)}</small>
              </div>
              <Badge
                tone={
                  stateOf(item) === "Pagada"
                    ? "green"
                    : stateOf(item) === "Vencida"
                      ? "red"
                      : stateOf(item) === "Parcial"
                        ? "blue"
                        : "neutral"
                }
              >
                {stateOf(item)}
              </Badge>
            </div>
          ))
        ) : (
          <div className="admin-empty">
            <CreditCard size={28} />
            <h3>No hay cuotas para mostrar</h3>
            <p>Las cuotas aparecerán al registrar una venta a plazos.</p>
          </div>
        )}
        <AdminPager
          page={scheduleRows.page}
          pages={scheduleRows.pages}
          onChange={setSchedulePage}
          label="Páginas del cronograma de cuotas"
        />
      </div>
      <div className="admin-panel table-panel payments-history">
        <div className="admin-panel-head">
          <div>
            <h2>Historial de pagos</h2>
            <p>
              {paymentRows.total} cobros registrados manualmente y al contado
            </p>
          </div>
        </div>
        {paymentRows.items.map(({ s, p }) => (
          <div className="recent-row" key={p.id}>
            <span className="stat-icon sage">
              <CreditCard size={17} />
            </span>
            <div>
              <strong>{s.buyerName}</strong>
              <small>
                {s.code} ·{" "}
                {p.kind === "initial"
                  ? "Inicial"
                  : p.kind === "cash"
                    ? "Contado"
                    : "Cuota"}{" "}
                · {day(p.paidAt)}
              </small>
            </div>
            <strong>+ {money(p.amountCents)}</strong>
          </div>
        ))}
        <AdminPager
          page={paymentRows.page}
          pages={paymentRows.pages}
          onChange={setPaymentPage}
          label="Páginas del historial de pagos"
        />
      </div>
      {modal && (
        <Modal title="Registrar pago manual" onClose={() => setModal(false)}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              try {
                await submit("payments", {
                  ...Object.fromEntries(new FormData(e.currentTarget)),
                  saleId,
                  kind,
                  key: crypto.randomUUID(),
                });
                setPaymentPage(1);
                setModal(false);
              } catch (ex) {
                setError((ex as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="admin-form-grid">
              <Field label="Venta">
                <SearchSelect
                  options={saleItems}
                  value={saleId}
                  onChange={setSaleId}
                  placeholder="Buscar código o comprador..."
                  empty="No hay ventas a cuotas activas."
                />
              </Field>
              <Field label="Tipo">
                <select value={kind} onChange={(e) => setKind(e.target.value)}>
                  <option value="installment">Cuotas</option>
                  <option value="initial">Inicial</option>
                </select>
              </Field>
              <Field label="Importe">
                <input
                  name="amount"
                  type="number"
                  min="0.01"
                  max={balance / 100}
                  step="0.01"
                  required
                  key={saleId}
                />
              </Field>
              <Field label="Fecha de pago">
                <input
                  name="date"
                  type="date"
                  defaultValue={dateKey(new Date())}
                  required
                />
              </Field>
              <Field label="Referencia (opcional)">
                <input name="reference" placeholder="Recibo o comprobante" />
              </Field>
            </div>
            <p className="form-help">
              Saldo de {kind === "initial" ? "inicial" : "cuotas"}:{" "}
              <strong>{money(balance)}</strong>. Los abonos se aplican primero a
              las cuotas más antiguas, incluidos los adelantados.
            </p>
            {error && <p className="form-error">{error}</p>}
            <Actions
              busy={busy || !selected || !balance}
              cancel={() => setModal(false)}
              label="Registrar cobro"
            />
          </form>
        </Modal>
      )}
    </>
  );
}
