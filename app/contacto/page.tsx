import { Clock3, Mail, MapPin, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StoreHeader, StoreFooter } from "@/components/store-shell";

export const dynamic = "force-dynamic";
export default async function Contact() {
  let settings: {
    name: string;
    address: string;
    phone: string;
    email: string;
    hours: string;
    about: string;
  } | null = null;
  try {
    settings = await prisma.storeSettings.findUnique({ where: { id: 1 } });
  } catch {}
  const name = settings?.name || "JOTACELL";
  return (
    <>
      <StoreHeader name={name} />
      <main className="store-container simple-page contact-page">
        <span className="eyebrow">
          <span /> ESTAMOS CERCA
        </span>
        <h1>
          Hablemos de tu
          <br />
          <em>próximo celular.</em>
        </h1>
        <p>
          {settings?.about ||
            "Nos encanta ayudarte a encontrar el equipo perfecto para ti. Acércate o ponte en contacto con nuestra tienda."}
        </p>
        <div className="contact-grid">
          {[
            [
              MapPin,
              "Encontranos",
              settings?.address || "Dirección por confirmar",
            ],
            [Phone, "Llámanos", settings?.phone || "Teléfono por confirmar"],
            [Mail, "Escríbenos", settings?.email || "Correo por confirmar"],
            [Clock3, "Horarios", settings?.hours || "Horario por confirmar"],
          ].map(([Icon, label, value]) => (
            <div className="contact-tile" key={String(label)}>
              <span>
                <Icon size={24} />
              </span>
              <small>{String(label)}</small>
              <strong>{String(value)}</strong>
            </div>
          ))}
        </div>
      </main>
      <StoreFooter
        name={name}
        address={settings?.address}
        phone={settings?.phone}
      />
    </>
  );
}
