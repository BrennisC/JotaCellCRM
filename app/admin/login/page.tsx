import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/admin/login-form";
import { getAdmin } from "@/lib/security";
import { refreshCookie } from "@/lib/supabase-auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const admin = await getAdmin();
  if (admin) redirect("/admin");
  if ((await cookies()).has(refreshCookie))
    redirect("/api/auth/refresh?next=/admin");
  return (
    <main className="login-layout">
      <div className="login-art">
        <Link href="/" className="logo">
          <span className="logo-symbol">
            <Image src="/jotacell-mark.svg" alt="" width={39} height={39} />
          </span>
          <span>
            JOTACELL
            <i>.</i>
          </span>
        </Link>
        <div className="login-art-copy">
          <span className="eyebrow">
            <span /> ESPACIO ADMINISTRATIVO
          </span>
          <h1>
            Todo bajo
            <br />
            <em>control.</em>
          </h1>
          <p>Tu tienda, tu inventario y tus ventas en un solo lugar.</p>
        </div>
        <span className="login-art-star">✳</span>
      </div>
      <div className="login-content">
        <Link href="/" className="back-link">
          <ArrowLeft size={17} /> Volver a la tienda
        </Link>
        <LoginForm />
      </div>
    </main>
  );
}
