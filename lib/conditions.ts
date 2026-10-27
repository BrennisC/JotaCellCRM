export const conditions = ["Nuevo", "Open Box", "Reacondicionado"] as const;

export type Condition = (typeof conditions)[number];

export const isCondition = (value: unknown): value is Condition =>
  typeof value === "string" &&
  (conditions as readonly string[]).includes(value);

export const defaultCondition: Condition = "Nuevo";
