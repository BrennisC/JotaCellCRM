"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BarChart3,
  Bell,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings2,
  ShoppingBag,
  Smartphone,
  Store,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Dashboard } from "./dashboard";
import { ProductsSection } from "./products-section";
import { InventorySection } from "./inventory-section";
import { SalesSection } from "./sales-section";
import { InstallmentsSection } from "./installments-section";
import { ReportsSection } from "./reports-section";
import { SettingsSection } from "./settings-section";
import type { AdminData, Tab } from "./types";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/client-auth";

const navigation: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Celulares", icon: Smartphone },
  { id: "inventory", label: "Inventario", icon: Package },
  { id: "sales", label: "Ventas", icon: ShoppingBag },
  { id: "installments", label: "Cuotas", icon: CreditCard },
  { id: "reports", label: "Reportes", icon: BarChart3 },
  { id: "settings", label: "Configuración", icon: Settings2 },
];
const empty: AdminData = {
  products: [],
  sales: [],
  settings: null,
  admin: { name: "Administrador", email: "" },
};
export function AdminApp() {
  const router = useRouter();
  const [data, setData] = useState<AdminData>(empty),
    [tab, setTab] = useState<Tab>("dashboard"),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [mobileMenu, setMobileMenu] = useState(false);
  const refresh = useCallback(async () => {
    try {
      const response = await fetchWithAuth("/api/admin/data", {
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setData(result);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);
  const go = (id: Tab) => {
    setTab(id);
    setMobileMenu(false);
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const submit = async (
    path: string,
    body: Record<string, unknown>,
    method = "POST",
  ) => {
    setError("");
    const response = await fetchWithAuth(`/api/admin/${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error || "No se pudo completar.");
      throw new Error(result.error || "No se pudo completar.");
    }
    setNotice("Cambios guardados correctamente.");
    await refresh();
    return result;
  };
  const signOut = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    router.push("/admin/login");
    router.refresh();
  };
  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="admin-logo">
          <Link href="/">
            <span className="logo-symbol">
              <Image src="/jotacell-mark.svg" alt="" width={39} height={39} />
            </span>
            JOTACELL
            <i>.</i>
          </Link>
          <small>ESPACIO ADMINISTRATIVO</small>
        </div>
        <div className="admin-nav-label">MENÚ PRINCIPAL</div>
        <nav className="admin-nav">
          {navigation.map((item) => (
            <button
              key={item.id}
              className={tab === item.id ? "active" : ""}
              onClick={() => go(item.id)}
            >
              <item.icon size={19} strokeWidth={1.8} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-foot">
          <Link href="/" target="_blank" rel="noopener noreferrer">
            <Store size={18} /> Ver tienda pública
          </Link>
          <button onClick={signOut} className="admin-sidebar-foot-logout">
            <LogOut size={18} /> Cerrar sesión
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <button
            className="admin-menu-btn"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label="Abrir menú"
          >
            {mobileMenu ? <X size={21} /> : <Menu size={21} />}
          </button>
          <div className="admin-breadcrumb">
            Mi espacio <span>/</span>{" "}
            <strong>{navigation.find((n) => n.id === tab)?.label}</strong>
          </div>
          <div className="admin-top-right">
            <span className="admin-date">
              {new Date().toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <button
              className="admin-bell"
              aria-label="Ver cuotas"
              onClick={() => go("installments")}
            >
              <Bell size={19} />
            </button>
            <span className="admin-avatar">
              {data.admin.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
        </header>
        <main className="admin-content">
          {error && (
            <div className="admin-alert error">
              {error}
              <button onClick={() => setError("")}>
                <X size={16} />
              </button>
            </div>
          )}
          {notice && (
            <div className="admin-alert success">
              {notice}
              <button onClick={() => setNotice("")}>
                <X size={16} />
              </button>
            </div>
          )}
          {loading ? (
            <div className="admin-loading">Cargando tu espacio...</div>
          ) : (
            <>
              {tab === "dashboard" && <Dashboard data={data} navigate={go} />}{" "}
              {tab === "products" && (
                <ProductsSection data={data} submit={submit} />
              )}{" "}
              {tab === "inventory" && (
                <InventorySection data={data} submit={submit} />
              )}{" "}
              {tab === "sales" && <SalesSection data={data} submit={submit} />}{" "}
              {tab === "installments" && (
                <InstallmentsSection data={data} submit={submit} />
              )}{" "}
              {tab === "reports" && <ReportsSection data={data} />}{" "}
              {tab === "settings" && (
                <SettingsSection data={data} submit={submit} />
              )}
            </>
          )}
        </main>
      </div>
      <nav className="admin-bottom-nav">
        {navigation.slice(0, 4).map((item) => (
          <button
            key={item.id}
            className={tab === item.id ? "active" : ""}
            onClick={() => go(item.id)}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </button>
        ))}
        <button
          className={
            navigation.slice(4).some((n) => n.id === tab) ? "active" : ""
          }
          onClick={() => setMobileMenu(!mobileMenu)}
        >
          <Menu size={20} />
          <span>Más</span>
        </button>
      </nav>
      {mobileMenu && (
        <div className="sidebar-scrim" onClick={() => setMobileMenu(false)} />
      )}
    </div>
  );
}
