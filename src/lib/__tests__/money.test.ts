import { describe, it, expect } from 'vitest';
import { money } from '@/lib/money';

describe('money()', ()=>{
  it('formata BRL corretamente', ()=>{
    expect(money(12)).toMatch(/R\$/);
    expect(money(12.5)).toContain('12');
  });
});
