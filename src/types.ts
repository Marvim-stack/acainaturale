export type Topping = {
  id: string;
  label: string;
  price: number;
  available: boolean;
  category?: string;
};

export type ProductBase = {
  id: string;
  name: string;
  desc?: string;
  img?: string;
  basePrice: number;
 volumeML: number;
  available: boolean;
};

export type CartItem = {
  key: string;
  productId: string;
  name: string;
  img?: string;
  qty: number;
  basePrice: number;
  toppings: Topping[];
};

export type Address = {
  street: string; number: string; district: string; city: string; ref?: string;
};

export type Customer = { name: string; phone: string; email?: string };

export type Payment = { method: "pix" | "card" };
