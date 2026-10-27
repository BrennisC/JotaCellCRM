"use client";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="admin-modal-shade"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="admin-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="admin-modal-title">
          <div>
            <span className="eyebrow">
              <span /> JOTACELL · ADMIN
            </span>
            <h2>{title}</h2>
          </div>
          <button aria-label="Cerrar" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
export function PageTitle({
  tag,
  title,
  description,
  action,
}: {
  tag: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="admin-page-head">
      <div>
        <span className="eyebrow">
          <span /> {tag}
        </span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      {children}
    </label>
  );
}
export function Actions({
  cancel,
  busy,
  label = "Guardar cambios",
}: {
  cancel: () => void;
  busy: boolean;
  label?: string;
}) {
  return (
    <div className="admin-form-actions">
      <button type="button" className="admin-secondary" onClick={cancel}>
        Cancelar
      </button>
      <button className="admin-primary" type="submit" disabled={busy}>
        {busy ? "Guardando..." : label}
      </button>
    </div>
  );
}
export function Badge({
  children,
  tone = "green",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return <span className={`status-pill ${tone}`}>{children}</span>;
}
