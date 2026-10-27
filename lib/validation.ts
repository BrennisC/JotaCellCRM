export class InputError extends Error {}

export const required = (value: unknown, label: string) => {
  const text = String(value ?? "").trim();
  if (!text) throw new InputError(`${label} es obligatorio.`);
  return text;
};

export const integer = (value: unknown, label: string) => {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0)
    throw new InputError(`${label} inválido.`);
  return parsed;
};
