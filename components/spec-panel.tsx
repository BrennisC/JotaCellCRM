import type { Variant } from "@prisma/client";
import { specFields } from "@/lib/spec-fields";

export function SpecPanel({
  specs,
  variant,
}: {
  specs: Record<string, Record<string, string>>;
  variant?: Variant;
}) {
  return (
    <aside className="spec-panel">
      <div className="spec-header">
        <span>CONOCÉ CADA DETALLE</span>
        <h2>ESPECIFICACIONES</h2>
        <p>Todo lo que necesitas saber.</p>
      </div>
      <div className="spec-scroll">
        {Object.entries(specFields).map(([group, fields]) => {
          const values = fields
            .map((field) => [
              field,
              group === "Memoria" && field === "RAM"
                ? variant?.ram
                : group === "Memoria" && field === "Almacenamiento"
                  ? variant?.storage
                  : specs[group]?.[field],
            ])
            .filter(([, value]) => !!value);
          return values.length ? (
            <section className="spec-group" key={group}>
              <h3>{group.toUpperCase()}</h3>
              {values.map(([field, value]) => (
                <div className="spec-row" key={field}>
                  <span>{field}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </section>
          ) : null;
        })}
        {!variant && <p>Las especificaciones estarán disponibles pronto.</p>}
      </div>
    </aside>
  );
}
