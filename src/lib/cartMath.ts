import type { CartItem } from "@/types";

export function calcItemUnit(item: Pick<CartItem, 'basePrice' | 'toppings'>){
  return item.basePrice + (item.toppings?.reduce((a,t)=>a+t.price,0) || 0);
}
export function calcItemTotal(item: CartItem){
  return calcItemUnit(item) * item.qty;
}
export function calcSubtotal(items: CartItem[]){
  return items.reduce((acc,i)=> acc + calcItemTotal(i), 0);
}
export function calcDelivery(subtotal:number, baseFee:number, freeFrom:number){
  if(subtotal===0) return 0;
  return subtotal>=freeFrom ? 0 : baseFee;
}
