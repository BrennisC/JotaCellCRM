import type { Metadata } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "./globals.css";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "JOTACELL | Celulares en Perú con garantía",
    template: "%s | JOTACELL",
  },
  description:
    "Celulares nuevos con garantía. Compara modelos, colores y capacidades, y coordina tu compra por WhatsApp.",
  applicationName: "JOTACELL",
  keywords: [
    "celulares",
    "celulares Perú",
    "iPhone",
    "Samsung",
    "Xiaomi",
    "celulares con garantía",
    "JOTACELL",
  ],
  authors: [{ name: "JOTACELL" }],
  creator: "JOTACELL",
  icons: { icon: "/jotacell-mark.svg", apple: "/jotacell-mark.svg" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "es_PE",
    siteName: "JOTACELL",
    title: "JOTACELL | Celulares en Perú con garantía",
    description:
      "Elige tu próximo celular: modelos, colores y capacidades con precio en soles.",
    images: [{ url: "/jotacell-mark.svg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "JOTACELL | Celulares en Perú con garantía",
    description: "Celulares nuevos con garantía.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
