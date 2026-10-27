"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, ShieldCheck } from "lucide-react";
import type { AdminData } from "./types";
import { Field, PageTitle } from "./form-parts";
export function SettingsSection({
  data,
  submit,
}: {
  data: AdminData;
  submit: (path: string, body: Record<string, unknown>) => Promise<unknown>;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [current, setCurrent] = useState(""),
    [next, setNext] = useState("");
  const settings = data.settings;
  return (
    <>
      <PageTitle
        tag="PREFERENCIAS DE LA TIENDA"
        title="Configuración"
        description="Datos de contacto públicos y seguridad de tu cuenta."
      />
      <div className="admin-panel settings-card">
        <div className="admin-panel-head">
          <div>
            <h2>Información de la tienda</h2>
            <p>Estos datos se mostrarán en la página pública</p>
          </div>
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            try {
              await submit(
                "settings",
                Object.fromEntries(new FormData(e.currentTarget)),
              );
            } catch (ex) {
              setError((ex as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="admin-form-grid">
            <Field label="Nombre de la tienda">
              <input
                name="name"
                required
                defaultValue={settings?.name || "JOTACELL"}
              />
            </Field>
            <Field label="Correo público">
              <input name="email" type="email" defaultValue={settings?.email} />
            </Field>
            <Field label="WhatsApp para consultas">
              <input
                name="phone"
                inputMode="tel"
                placeholder="999 888 777"
                defaultValue={settings?.phone}
              />
            </Field>
            <Field label="Dirección">
              <input name="address" defaultValue={settings?.address} />
            </Field>
            <Field label="Horario de atención">
              <input name="hours" defaultValue={settings?.hours} />
            </Field>
            <Field label="Acerca de la tienda">
              <textarea name="about" rows={3} defaultValue={settings?.about} />
            </Field>
          </div>
          <p className="form-help">
            El WhatsApp recibe las consultas enviadas desde la ficha de cada
            equipo. Si lo dejas vacío, el botón de consulta lleva a la página de
            contacto.
          </p>
          {error && <p className="form-error">{error}</p>}
          <div className="admin-form-actions">
            <button className="admin-primary" disabled={busy}>
              {busy ? "Guardando..." : "Guardar datos"}
            </button>
          </div>
        </form>
      </div>
      <div className="admin-panel settings-card">
        <div className="admin-panel-head">
          <div>
            <h2>Seguridad y acceso</h2>
            <p>Sesión privada protegida para el administrador</p>
          </div>
          <span className="stat-icon sage">
            <ShieldCheck size={20} />
          </span>
        </div>
        <p className="form-help">Cuenta: {data.admin.email}</p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            try {
              const res = await fetch("/api/auth/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ current, next }),
              });
              const body = await res.json();
              if (!res.ok) throw new Error(body.error);
              setCurrent("");
              setNext("");
              router.replace("/admin/login");
              router.refresh();
            } catch (ex) {
              setError((ex as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="admin-form-grid">
            <Field label="Contraseña actual">
              <input
                type="password"
                autoComplete="current-password"
                required
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
              />
            </Field>
            <Field label="Nueva contraseña (12+ caracteres, mayúscula, minúscula, número y símbolo)">
              <input
                type="password"
                autoComplete="new-password"
                minLength={12}
                required
                value={next}
                onChange={(e) => setNext(e.target.value)}
              />
            </Field>
          </div>
          {error && <p className="form-error">{error}</p>}
          <div className="admin-form-actions">
            <button className="admin-secondary" disabled={busy}>
              <KeyRound size={17} /> Cambiar contraseña
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
