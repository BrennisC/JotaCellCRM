"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [forgot, setForgot] = useState(false);
  return (
    <div className="login-box">
      <span className="login-lock">
        <LockKeyhole size={22} />
      </span>
      <span className="eyebrow">
        <span /> BIENVENIDO DE NUEVO
      </span>
      <h2>{forgot ? "Recuperar acceso" : "Entra a tu espacio."}</h2>
      <p>
        {forgot
          ? "Por seguridad, solicita al propietario del proyecto restablecer el acceso desde Supabase Auth. No enviamos correos automáticos."
          : "Ingresa tus datos para administrar la tienda."}
      </p>
      {forgot ? (
        <button className="admin-secondary" onClick={() => setForgot(false)}>
          Volver al inicio de sesión
        </button>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            try {
              const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
              });
              const json = await response.json();
              if (!response.ok) throw new Error(json.error);
              router.push("/admin");
              router.refresh();
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            Correo electrónico
            <input
              type="email"
              autoComplete="username"
              placeholder="admin@tutienda.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Tu contraseña"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="forgot-button"
            onClick={() => setForgot(true)}
          >
            ¿Olvidaste tu contraseña?
          </button>
          {error && <p className="form-error">{error}</p>}
          <button className="admin-primary login-action" disabled={busy}>
            {busy ? "Ingresando..." : "Iniciar sesión"} <ArrowRight size={18} />
          </button>
        </form>
      )}
    </div>
  );
}
