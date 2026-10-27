"use client";
import { useState } from "react";
import { dateKey } from "@/lib/format";
import type { AdminData, Sale } from "./types";
import { Actions, Field, Modal } from "./form-parts";
export function SaleForm({
  data,
  editing,
  submit,
  onClose,
}: {
  data: AdminData;
  editing: Sale | null;
  submit: (
    path: string,
    body: Record<string, unknown>,
    method?: string,
  ) => Promise<unknown>;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [variantId, setVariantId] = useState(""),
    [type, setType] = useState("cash");
  const variants = data.products.flatMap((p) =>
    p.variants.map((v) => ({ ...v, product: p })),
  );
  const current = variants.find((v) => v.id === variantId);
  return (
    <Modal
      title={editing ? "Editar comprador" : "Registrar nueva venta"}
      onClose={onClose}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            const values = Object.fromEntries(new FormData(e.currentTarget));
            await submit(
              "sales",
              editing
                ? { ...values, id: editing.id }
                : { ...values, variantId, type },
              editing ? "PATCH" : "POST",
            );
            onClose();
          } catch (ex) {
            setError((ex as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="admin-form-grid">
          {!editing && (
            <>
              <Field label="Código de operación">
                <input name="code" required placeholder="VEN-001" />
              </Field>
              <Field label="Fecha">
                <input
                  name="date"
                  type="date"
                  defaultValue={dateKey(new Date())}
                  required
                />
              </Field>
              <Field label="Celular y variante">
                <select
                  value={variantId}
                  onChange={(e) => setVariantId(e.target.value)}
                  required
                >
                  <option value="">Selecciona variante</option>
                  {variants
                    .filter((v) => v.stock > 0)
                    .map((v) => (
                      <option value={v.id} key={v.id}>
                        {v.product.brand} {v.product.model} · {v.color} ·{" "}
                        {v.storage} ({v.stock} disponibles)
                      </option>
                    ))}
                </select>
              </Field>
              <Field label="IMEI (opcional)">
                <select name="imei" defaultValue="">
                  <option value="">Sin IMEI</option>
                  {current?.serials
                    .filter((s) => !s.sold)
                    .map((s) => (
                      <option key={s.id} value={s.imei}>
                        {s.imei}
                      </option>
                    ))}
                </select>
              </Field>
            </>
          )}
          <Field label="Comprador">
            <input
              name="buyerName"
              defaultValue={editing?.buyerName}
              required
            />
          </Field>
          <Field label="Documento">
            <input
              name="buyerDocument"
              defaultValue={editing?.buyerDocument}
              required
            />
          </Field>
          <Field label="Teléfono">
            <input
              name="buyerPhone"
              type="tel"
              defaultValue={editing?.buyerPhone}
            />
          </Field>
          {!editing && (
            <>
              <Field label="Precio final (S/)">
                <input
                  name="price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  defaultValue={
                    current
                      ? (current.salePriceCents ?? current.priceCents) / 100
                      : undefined
                  }
                  key={variantId}
                />
              </Field>
              <Field label="Tipo de venta">
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="cash">Contado</option>
                  <option value="installments">En cuotas</option>
                </select>
              </Field>
              {type === "installments" && (
                <>
                  <Field label="Inicial acordada">
                    <input
                      name="down"
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue="0"
                      required
                    />
                  </Field>
                  <Field label="Número de cuotas">
                    <input
                      name="installmentsNo"
                      type="number"
                      min="1"
                      max="240"
                      defaultValue="12"
                      required
                    />
                  </Field>
                  <Field label="Frecuencia">
                    <select name="frequency">
                      <option value="monthly">Mensual</option>
                      <option value="biweekly">Quincenal</option>
                      <option value="weekly">Semanal</option>
                    </select>
                  </Field>
                </>
              )}
            </>
          )}
        </div>
        {!editing && (
          <p className="form-help">
            En ventas al contado se registra el cobro completo. En cuotas se
            crea el cronograma; la inicial se registra como pago manual.
          </p>
        )}
        {editing && (
          <p className="form-help">
            El precio, el equipo y los cobros se conservan para proteger el
            historial de la operación.
          </p>
        )}
        {error && <p className="form-error">{error}</p>}
        <Actions
          busy={busy}
          cancel={onClose}
          label={editing ? "Actualizar datos" : "Registrar venta"}
        />
      </form>
    </Modal>
  );
}
