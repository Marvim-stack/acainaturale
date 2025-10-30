import React, { createContext, useContext, useMemo } from "react";
import { CartItem, Topping } from "@/types";
import { useLocalState } from "@/lib/storage";
import { CONFIG } from "@/config/store";
import { calcSubtotal, calcDelivery } from "@/lib/cartMath";

interface CartCtx {
  items: CartItem[];
  add: (p: {
    productId: string;
    name: string;
    img?: string;
    basePrice: number;
    toppings: Topping[];
    qty: number;
  }) => void;
  remove: (key: string) => void;
  changeQty: (key: string, delta: number) => void;
  clear: () => void;
  subtotal: number;
  delivery: number;
  total: number;
}

const Ctx = createContext<CartCtx>(null as any);
export const useCart = () => useContext(Ctx);

export function CartProvider({ children }: { children: React.ReactNode }) {
  // ✅ correção aqui: apenas um par de parênteses
  const [items, setItems] = useLocalState<CartItem[]>("acai:cart", []);

  function add({
    productId,
    name,
    img,
    basePrice,
    toppings,
    qty,
  }: Parameters<CartCtx["add"]>[0]) {
    const sig = productId + ":" + toppings.map((t) => t.id).sort().join("|");
    setItems((prev) => {
      const f = prev.find((i) => i.key === sig);
      if (f) return prev.map((i) => (i.key === sig ? { ...i, qty: i.qty + qty } : i));
      return [...prev, { key: sig, productId, name, img, basePrice, toppings, qty }];
    });
  }

  const remove = (key: string) => setItems((prev) => prev.filter((i) => i.key !== key));
  const changeQty = (key: string, delta: number) =>
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, qty: Math.max(1, i.qty + delta) } : i))
    );
  const clear = () => setItems([]);

  const subtotal = useMemo(() => calcSubtotal(items), [items]);
  const delivery = useMemo(
    () => calcDelivery(subtotal, CONFIG.delivery.baseFee, CONFIG.delivery.freeFrom),
    [subtotal]
  );
  const total = subtotal + delivery;

  const value: CartCtx = { items, add, remove, changeQty, clear, subtotal, delivery, total };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
