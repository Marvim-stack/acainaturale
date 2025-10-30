// src/lib/money.ts
export function money(value: number | null | undefined) {
  const n =
    typeof value === "number" && Number.isFinite(value)
      ? value
      : 0; // fallback seguro
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
