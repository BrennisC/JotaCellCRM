import Link from "next/link";
import {
  catalogHref,
  pageWindow,
  type CatalogSearch,
} from "@/lib/catalog-filters";

export function CatalogPagination({
  page,
  pages,
  search,
}: {
  page: number;
  pages: number;
  search: CatalogSearch;
}) {
  if (pages <= 1) return null;
  return (
    <nav className="catalog-pager" aria-label="Paginación del catálogo">
      {page > 1 ? (
        <Link href={catalogHref(search, page - 1)}>Anterior</Link>
      ) : (
        <span className="disabled">Anterior</span>
      )}
      {pageWindow(page, pages).map((number, index) =>
        number === 0 ? (
          <span className="gap" key={`gap-${index}`} aria-hidden="true">
            …
          </span>
        ) : (
          <Link
            key={number}
            href={catalogHref(search, number)}
            className={number === page ? "active" : undefined}
            aria-current={number === page ? "page" : undefined}
            aria-label={`Página ${number}`}
          >
            {number}
          </Link>
        ),
      )}
      {page < pages ? (
        <Link href={catalogHref(search, page + 1)}>Siguiente</Link>
      ) : (
        <span className="disabled">Siguiente</span>
      )}
    </nav>
  );
}
