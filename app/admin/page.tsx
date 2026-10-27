import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getAdmin } from "@/lib/security";
import { refreshCookie } from "@/lib/supabase-auth";
import { AdminApp } from "@/components/admin/admin-app";

export const dynamic = "force-dynamic";
export default async function AdminPage() {
  const admin = await getAdmin();
  if (!admin) {
    if ((await cookies()).has(refreshCookie))
      redirect("/api/auth/refresh?next=/admin");
    redirect("/admin/login");
  }
  return <AdminApp />;
}
