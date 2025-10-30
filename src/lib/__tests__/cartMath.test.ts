import { describe, it, expect } from 'vitest';
import { calcItemUnit, calcItemTotal, calcSubtotal, calcDelivery } from '@/lib/cartMath';

const item = (base:number, add:number[], qty:number)=>({ basePrice: base, toppings: add.map((p,i)=>({id:String(i),label:'t',price:p,available:true})), qty } as any);

describe('cartMath', ()=>{
  it('calcItemUnit soma base + toppings', ()=>{
    expect(calcItemUnit(item(10,[2,3],1))).toBe(15);
  });
  it('calcItemTotal = unit * qty', ()=>{
    expect(calcItemTotal(item(10,[2,3],2))).toBe(30);
  });
  it('calcSubtotal soma itens', ()=>{
    const items:any = [item(10,[0],1), item(5,[1],3)]; // 10 + (6*3)=28
    expect(calcSubtotal(items)).toBe(28);
  });
  it('calcDelivery aplica frete base quando abaixo do freeFrom', ()=>{
    expect(calcDelivery(50, 7.9, 79)).toBe(7.9);
  });
  it('calcDelivery zera quando atinge freeFrom', ()=>{
    expect(calcDelivery(80, 7.9, 79)).toBe(0);
  });
  it('calcDelivery 0 quando carrinho vazio', ()=>{
    expect(calcDelivery(0, 7.9, 79)).toBe(0);
  });
});
