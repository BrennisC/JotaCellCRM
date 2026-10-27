"use client";
import { useState } from "react";
import { ArrowUpRight, Package, Search, Smartphone } from "lucide-react";
import type { AdminData, Variant } from "./types";
import { Actions, Badge, Field, Modal, PageTitle } from "./form-parts";
type Submit = (
  path: string,
  body: Record<string, unknown>,
  method?: string,
) => Promise<unknown>;
export function InventorySection({
  data,
  submit,
}: {
  data: AdminData;
  submit: Submit;
}) {
  const [selected, setSelected] = useState<Variant | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [query, setQuery] = useState("");
  const rows = data.products
    .flatMap((p) => p.variants.map((v) => ({ p, v })))
    .filter(({ p, v }) =>
      `${p.brand} ${p.model} ${v.color} ${v.storage}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
  return (
    <>
      <PageTitle
        tag="CONTROL DE STOCK"
        title="Inventario"
        description="Revisa existencias y registra identificadores de equipos."
      />
      <div className="admin-search">
        <Search size={18} />
        <input
          placeholder="Buscar modelo o variante..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="admin-panel table-panel">
        <div className="admin-panel-head">
          <div>
            <h2>Existencias por variante</h2>
            <p>El stock se descuenta automáticamente al registrar una venta</p>
          </div>
        </div>
        {rows.length ? (
          rows.map(({ p, v }) => (
            <div className="inventory-row" key={v.id}>
              <span className="stat-icon blue">
                <Smartphone size={20} />
              </span>
              <div className="admin-row-main">
                <strong>
                  {p.brand} {p.model}
                </strong>
                <small>
                  {v.color} · {v.ram} · {v.storage}
                </small>
              </div>
              <strong>{v.stock} uds.</strong>
              <Badge tone={v.stock ? "green" : "red"}>
                {v.stock ? "Disponible" : "Agotado"}
              </Badge>
              <button
                className="admin-secondary small"
                onClick={() => {
                  setSelected(v);
                  setError("");
                }}
              >
                IMEI / serie <ArrowUpRight size={15} />
              </button>
            </div>
          ))
        ) : (
          <div className="admin-empty">
            <Package size={29} />
            <h3>No hay variantes registradas</h3>
            <p>
              Crea un celular y agrega variantes desde la sección Celulares.
            </p>
          </div>
        )}
      </div>
      {selected && (
        <Modal
          title="IMEI y números de serie"
          onClose={() => setSelected(null)}
        >
          <p className="form-help">
            Identificadores asociados a {selected.color} · {selected.storage}.
            Stock disponible: {selected.stock}.
          </p>
          <div className="serial-list">
            {data.products
              .flatMap((p) => p.variants)
              .find((v) => v.id === selected.id)
              ?.serials.map((s) => (
                <div key={s.id}>
                  {s.imei}
                  <Badge tone={s.sold ? "neutral" : "green"}>
                    {s.sold ? "Vendido" : "Disponible"}
                  </Badge>
                </div>
              ))}
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              try {
                await submit("serials", {
                  variantId: selected.id,
                  imei: new FormData(e.currentTarget).get("imei"),
                });
                setSelected(null);
              } catch (ex) {
                setError((ex as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <Field label="Nuevo IMEI o número de serie">
              <input
                name="imei"
                required
                placeholder="Ingresa el identificador"
              />
            </Field>
            <p className="form-help">
              El registro del IMEI no aumenta el stock automáticamente. Ajusta
              el stock desde la variante.
            </p>
            {error && <p className="form-error">{error}</p>}
            <Actions
              busy={busy}
              cancel={() => setSelected(null)}
              label="Guardar identificador"
            />
          </form>
        </Modal>
      )}
    </>
  );
}
