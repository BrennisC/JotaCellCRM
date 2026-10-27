import { Field } from "./form-parts";

/** Price and stock of the first variant, captured while creating the model. */
export function FirstVariantFields() {
  return (
    <>
      <div className="admin-form-subheading">Precio y stock</div>
      <p className="form-help">
        El precio se guarda en la primera variante del equipo. Al completarla,
        el celular mostrará precio y disponibilidad en la tienda. Podrás añadir
        más colores o capacidades después.
      </p>
      <div className="admin-form-grid">
        <Field label="Almacenamiento">
          <input name="storage" required placeholder="128 GB" />
        </Field>
        <Field label="Color">
          <input name="color" required placeholder="Negro" />
        </Field>
        <Field label="RAM">
          <input name="ram" required placeholder="8 GB" />
        </Field>
        <Field label="Precio regular (S/)">
          <input
            name="price"
            required
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            placeholder="1450.00"
          />
        </Field>
        <Field label="Precio oferta (opcional)">
          <input
            name="salePrice"
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            placeholder="1390.00"
          />
        </Field>
        <Field label="Stock disponible">
          <input name="stock" type="number" min="0" step="1" defaultValue={0} />
        </Field>
      </div>
    </>
  );
}
