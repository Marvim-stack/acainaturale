import { Topping } from "@/types";

export const TOPPINGS: Topping[] = [
  { id: "banana", label: "Banana", price: 2.0, available: true, category: "frutas" },
  { id: "morango", label: "Morango", price: 3.9, available: true, category: "frutas" },
  { id: "kiwi", label: "Kiwi", price: 5.9, available: false, category: "frutas" },
  { id: "ninho", label: "Creme Ninho", price: 4.9, available: true, category: "cremes" },
  { id: "leite_po", label: "Leite em pó", price: 2.5, available: true, category: "cremes" },
  { id: "leite_cond", label: "Leite condensado", price: 3.0, available: true, category: "cremes" },
  { id: "granola", label: "Granola", price: 2.5, available: true, category: "crocantes" },
  { id: "amendoim", label: "Paçoca/Amendoim", price: 3.0, available: true, category: "crocantes" },
];
