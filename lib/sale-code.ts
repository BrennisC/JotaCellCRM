/** Next sequential operation code from the existing ones (VEN-001, VEN-002...). */
export const nextSaleCode = (codes: string[]) => {
  const last = codes.reduce((max, code) => {
    const match = /^VEN-(\d+)$/.exec(code);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `VEN-${String(last + 1).padStart(3, "0")}`;
};
