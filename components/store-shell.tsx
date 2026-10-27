import Link from "next/link";
import Image from "next/image";
import { ArrowRight, LockOpen, MapPin, Menu, Phone } from "lucide-react";

const links = [
  ["/", "Inicio"],
  ["/celulares", "Celulares"],
  ["/marcas", "Marcas"],
  ["/ofertas", "Ofertas"],
  ["/contacto", "Contacto"],
];
export function StoreHeader({ name = "JOTACELL" }: { name?: string }) {
  return (
    <>
      <div className="announcement">
        Una nueva forma de encontrar tu próximo celular <span>✦</span> Conoce
        nuestros modelos
      </div>
      <header className="store-header">
        <div className="store-container header-inner">
          <Link href="/" className="logo" aria-label={`${name}, ir al inicio`}>
            <span className="logo-symbol">
              <Image src="/jotacell-mark.svg" alt="" width={39} height={39} />
            </span>
            <span>
              {name}
              <i>.</i>
            </span>
          </Link>
          <nav className="desktop-links" aria-label="Menú principal">
            {links.map(([url, label]) => (
              <Link key={url} href={url}>
                {label}
              </Link>
            ))}
          </nav>
          <Link className="header-contact" href="/contacto">
            Hablemos <ArrowRight size={16} />
          </Link>
          <Link
            className="admin-entry"
            href="/admin"
            aria-label="Ingresar al panel administrativo"
          >
            <LockOpen size={16} /> <span>Administración</span>
          </Link>
          <details className="mobile-menu">
            <summary aria-label="Abrir menú">
              <Menu size={24} />
            </summary>
            <nav>
              {links.map(([url, label]) => (
                <Link key={url} href={url}>
                  {label}
                </Link>
              ))}
            </nav>
          </details>
        </div>
      </header>
    </>
  );
}
export function StoreFooter({
  name = "JOTACELL",
  address = "",
  phone = "",
}: {
  name?: string;
  address?: string;
  phone?: string;
}) {
  return (
    <footer className="store-footer">
      <div className="store-container footer-columns">
        <div className="footer-about">
          <Link className="logo" href="/">
            <span className="logo-symbol">
              <Image src="/jotacell-mark.svg" alt="" width={39} height={39} />
            </span>
            <span>
              {name}
              <i>.</i>
            </span>
          </Link>
          <p>
            La tecnología que quieres, con la atención que mereces. Explora,
            elige y encuentra tu próximo celular.
          </p>
        </div>
        <div>
          <strong>Explora</strong>
          {links.map(([url, label]) => (
            <Link key={url} href={url}>
              {label}
            </Link>
          ))}
        </div>
        <div>
          <strong>Estamos cerca</strong>
          {address && (
            <p>
              <MapPin size={16} />
              {address}
            </p>
          )}
          {phone && (
            <p>
              <Phone size={16} />
              {phone}
            </p>
          )}
          <Link href="/contacto">
            Más información <ArrowRight size={15} />
          </Link>
        </div>
      </div>
      <div className="store-container footer-bottom">
        <span>
          © {new Date().getFullYear()} {name}. Todos los derechos reservados.
        </span>
        <Link href="/admin">Acceso administrativo</Link>
      </div>
    </footer>
  );
}
export function PhoneArtwork({
  color = "sage",
  className = "",
}: {
  color?: string;
  className?: string;
}) {
  return (
    <div className={`phone-art ${className} art-${color}`} aria-hidden="true">
      <div className="phone-shadow" />
      <div className="phone-back">
        <div className="camera-island">
          <i />
          <i />
          <i />
        </div>
        <span className="phone-mark" />
      </div>
      <div className="phone-front">
        <span className="phone-speaker" />
        <div className="wallpaper-blob one" />
        <div className="wallpaper-blob two" />
        <div className="wallpaper-blob three" />
      </div>
    </div>
  );
}
