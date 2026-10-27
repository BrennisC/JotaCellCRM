"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy, MessageCircle } from "lucide-react";
import {
  inquiryMessage,
  whatsAppLink,
  type InquiryDetails,
} from "@/lib/inquiry";

export function InquiryAction({
  details,
  phone,
}: {
  details: InquiryDetails;
  phone?: string;
}) {
  const [copied, setCopied] = useState(false);
  const message = inquiryMessage(details);
  const href = whatsAppLink(phone || "", message);
  if (!href)
    return (
      <Link href="/contacto" className="detail-cta">
        Consultar disponibilidad <ArrowRight size={18} />
      </Link>
    );
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="detail-cta-group">
      <a
        className="detail-cta"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        <MessageCircle size={18} /> Consultar por WhatsApp
      </a>
      <button type="button" className="detail-cta-copy" onClick={copy}>
        {copied ? <Check size={16} /> : <Copy size={16} />}
        {copied ? "Mensaje copiado" : "Copiar mensaje"}
      </button>
    </div>
  );
}
