"use client";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Clock3,
  CreditCard,
  Package,
  ShoppingBag,
  Smartphone,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { money, day } from "@/lib/format";
import type { AdminData, Tab } from "./types";
import { stateOf } from "./types";

export function Dashboard({
  data,
  navigate,
}: {
  data: AdminData;
  navigate: (tab: Tab) => void;
}) {
  const units = data.products.flatMap((p) => p.variants);
  const installments = data.sales.flatMap((s) => s.installments);
  const payments = data.sales.flatMap((s) => s.payments);
  const total = payments.reduce((n, p) => n + p.amountCents, 0);
  const month = new Date().toISOString().slice(0, 7);
  const monthPaid = payments
    .filter((p) => p.paidAt.slice(0, 7) === month)
    .reduce((n, p) => n + p.amountCents, 0);
  const due =
    installments.reduce((n, i) => n + i.amountCents - i.paidCents, 0) +
    data.sales.reduce(
      (n, s) =>
        n +
        Math.max(
          0,
          s.downCents -
            s.payments
              .filter((p) => p.kind === "initial")
              .reduce((a, p) => a + p.amountCents, 0),
        ),
      0,
    );
  const overdue = installments.filter((i) => stateOf(i) === "Vencida");
  const chart = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - 5 + i);
    const key = date.toISOString().slice(0, 7);
    return {
      month: date.toLocaleDateString("es-ES", { month: "short" }),
      value: payments
        .filter((p) => p.paidAt.slice(0, 7) === key)
        .reduce((n, p) => n + p.amountCents / 100, 0),
    };
  });
  return (
    <>
      <div className="admin-page-head">
        <div>
          <span className="eyebrow">
            <span /> VISTA GENERAL
          </span>
          <h1>
            Hola, {data.admin.name.split(" ")[0]} <span>✳</span>
          </h1>
          <p>
            Así se mueve tu tienda hoy. Todo lo importante, en un mismo lugar.
          </p>
        </div>
        <button className="admin-primary" onClick={() => navigate("sales")}>
          Nueva venta <ArrowUpRight size={18} />
        </button>
      </div>
      <div className="admin-welcome">
        <div>
          <span>JOTACELL · TU ESPACIO</span>
          <h2>
            Tu tienda, siempre
            <br />
            <em>en buenas manos.</em>
          </h2>
          <p>Un poco más de claridad para cada decisión.</p>
          <button onClick={() => navigate("inventory")}>
            Ver inventario <ArrowRight size={17} />
          </button>
        </div>
        <span className="welcome-star">✳</span>
      </div>
      <div className="admin-stats">
        <Stat
          icon={Smartphone}
          label="Modelos"
          value={String(data.products.length)}
          sub="En el catálogo"
          tone="blue"
        />
        <Stat
          icon={Package}
          label="Equipos disponibles"
          value={String(units.reduce((n, v) => n + v.stock, 0))}
          sub={`${units.filter((v) => v.stock === 0).length} variantes agotadas`}
          tone="sage"
        />
        <Stat
          icon={ShoppingBag}
          label="Ventas"
          value={String(data.sales.length)}
          sub="Operaciones realizadas"
          tone="lavender"
        />
        <Stat
          icon={Wallet}
          label="Total recaudado"
          value={money(total)}
          sub="Cobros registrados"
          tone="rose"
        />
      </div>
      <div className="admin-dashboard-grid">
        <section className="admin-panel admin-chart">
          <div className="admin-panel-head">
            <div>
              <h2>Ingresos en el tiempo</h2>
              <p>Últimos seis meses</p>
            </div>
            <span className="chart-legend">
              <i /> Recaudación
            </span>
          </div>
          <div className="admin-chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chart}
                margin={{ left: 0, right: 10, top: 15, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                    <stop stopColor="#a6caba" stopOpacity=".45" />
                    <stop offset="1" stopColor="#a6caba" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="#eff1ee"
                  strokeDasharray="4 5"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#a1aaa3", fontSize: 11 }}
                  dy={9}
                />
                <Tooltip formatter={(value) => money(Number(value) * 100)} />
                <Area
                  dataKey="value"
                  type="monotone"
                  stroke="#99bda8"
                  fill="url(#income)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="admin-chart-foot">
            <span>
              INGRESOS ESTE MES<strong>{money(monthPaid)}</strong>
            </span>
            <TrendingUp size={24} />
          </div>
        </section>
        <section className="admin-panel admin-tasks">
          <div className="admin-panel-head">
            <div>
              <h2>A tener en cuenta</h2>
              <p>Tu resumen financiero</p>
            </div>
          </div>
          <div className="admin-task">
            <span className="stat-icon rose">
              <Clock3 size={21} />
            </span>
            <div>
              <strong>{overdue.length} cuotas vencidas</strong>
              <small>Requieren seguimiento</small>
            </div>
            <button onClick={() => navigate("installments")}>
              <ArrowRight size={17} />
            </button>
          </div>
          <div className="admin-task">
            <span className="stat-icon blue">
              <CreditCard size={21} />
            </span>
            <div>
              <strong>
                {installments.filter((i) => stateOf(i) === "Pendiente").length}{" "}
                cuotas pendientes
              </strong>
              <small>Próximos vencimientos</small>
            </div>
            <button onClick={() => navigate("installments")}>
              <ArrowRight size={17} />
            </button>
          </div>
          <div className="admin-task">
            <span className="stat-icon sage">
              <ArrowDownLeft size={21} />
            </span>
            <div>
              <strong>{money(due)} por cobrar</strong>
              <small>Saldo pendiente total</small>
            </div>
            <button onClick={() => navigate("reports")}>
              <ArrowRight size={17} />
            </button>
          </div>
        </section>
      </div>
      <section className="admin-panel recent-sales">
        <div className="admin-panel-head">
          <div>
            <h2>Últimas ventas</h2>
            <p>Movimientos recientes en tu tienda</p>
          </div>
          <button className="admin-text-btn" onClick={() => navigate("sales")}>
            Ver todas <ArrowRight size={16} />
          </button>
        </div>
        {data.sales.length ? (
          data.sales.slice(0, 5).map((s) => (
            <div className="recent-row" key={s.id}>
              <span className="stat-icon blue">
                <Smartphone size={18} />
              </span>
              <div>
                <strong>
                  {s.variant.product.brand} {s.variant.product.model}
                </strong>
                <small>
                  {s.buyerName} · {day(s.soldAt)}
                </small>
              </div>
              <strong>{money(s.priceCents)}</strong>
              <span className="status-pill green">
                {s.type === "cash" ? "Contado" : "Cuotas"}
              </span>
            </div>
          ))
        ) : (
          <div className="admin-empty">
            Aún no se registraron ventas. Empezá por agregar productos y
            registrar la primera operación.
          </div>
        )}
      </section>
    </>
  );
}
function Stat({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: typeof Smartphone;
  label: string;
  value: string;
  sub: string;
  tone: string;
}) {
  return (
    <div className="stat-card">
      <span className={`stat-icon ${tone}`}>
        <Icon size={21} />
      </span>
      <small>{label}</small>
      <strong>{value}</strong>
      <span className="stat-sub">{sub}</span>
    </div>
  );
}
