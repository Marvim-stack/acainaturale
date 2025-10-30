import React, { useMemo, useState } from "react";
import { PRODUCTS } from "@/data/products";
import { TOPPINGS } from "@/data/toppings";
import { money } from "@/lib/money";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Minus, Plus, Check } from "lucide-react";

export default function AcaiBuilder() {
  const bases = PRODUCTS.filter((b) => b.available);
  const [baseId, setBaseId] = useState<string | undefined>(bases[0]?.id);
  const base = bases.find((b) => b.id === baseId)!;

  const toppingsByCat = useMemo(() => {
    const all = TOPPINGS.filter((t) => t.available);
    return {
      frutas: all.filter((t) => t.category === "frutas"),
      cremes: all.filter((t) => t.category === "cremes"),
      crocantes: all.filter((t) => t.category === "crocantes"),
    };
  }, []);

  const [selected, setSelected] = useState<string[]>([]);
  const [qty, setQty] = useState(1);
  const { add } = useCart();

  const toppingObjs = TOPPINGS.filter((t) => selected.includes(t.id));
  const unit = base ? base.basePrice + toppingObjs.reduce((a, t) => a + t.price, 0) : 0;

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function addToCart() {
    if (!base) return;
    add({
      productId: base.id,
      name: `${base.name}`,
      img: base.img,
      basePrice: base.basePrice,
      toppings: toppingObjs,
      qty,
    });
    setSelected([]);
    setQty(1);
  }

  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <CardTitle>Monte seu Açaí</CardTitle>
        <CardDescription>Escolha o tamanho e os complementos preferidos.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* 1) Tamanhos: cards de rádio com feedback claro */}
        <section className="space-y-3">
          <h3 className="font-medium">1) Escolha o tamanho</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {bases.map((b) => {
              const active = b.id === baseId;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBaseId(b.id)}
                  aria-pressed={active}
                  className={[
                    "group flex items-start gap-3 rounded-2xl border p-4 text-left transition",
                    active
                      ? "border-purple-600 ring-2 ring-purple-500/30 bg-purple-50"
                      : "border-slate-200 hover:bg-slate-50",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border transition",
                      active
                        ? "border-purple-600 bg-purple-600 text-white"
                        : "border-slate-300 bg-white text-transparent group-hover:text-slate-300",
                    ].join(" ")}
                    aria-hidden
                  >
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <div className="font-medium">
                      {b.name} — {b.volumeML}ml · {money(b.basePrice)}
                    </div>
                    {b.desc && <div className="text-sm text-slate-500">{b.desc}</div>}
                  </div>
                </button>
              );
            })}
          </div>
          {base && <p className="text-sm text-slate-500">Puro, cremoso, sem xarope.</p>}
        </section>

        {/* 2) Complementos: grupos com checkbox visível */}
        <section className="space-y-4">
          <h3 className="font-medium">2) Escolha complementos</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(toppingsByCat).map(([cat, items]) => (
              <div key={cat} className="rounded-2xl border p-3 bg-white">
                <div className="font-medium mb-2 capitalize">{cat}</div>
                <div className="space-y-2">
                  {items.map((t) => {
                    const isChecked = selected.includes(t.id);
                    return (
                      <label
                        key={t.id}
                        className={[
                          "flex items-center justify-between gap-3 rounded-xl p-2",
                          isChecked ? "bg-purple-50" : "hover:bg-slate-50",
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => toggle(t.id)}
                            aria-label={t.label}
                          />
                          <span className="text-sm">{t.label}</span>
                        </div>
                        <span className="text-sm text-slate-600">{money(t.price)}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Chips dos selecionados para feedback rápido */}
          {toppingObjs.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {toppingObjs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => toggle(t.id)}
                  className="text-xs rounded-full border px-2.5 py-1 bg-white hover:bg-slate-50"
                  title="Remover"
                >
                  {t.label} ×
                </button>
              ))}
            </div>
          )}

          <p className="text-xs text-slate-500">Itens indisponíveis ficam ocultos automaticamente.</p>
        </section>

        {/* Resumo + ações */}
        <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-lg">
            Valor: <span className="font-semibold">{money(unit)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              className="rounded-xl"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Diminuir quantidade"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-7 text-center text-sm">{qty}</span>
            <Button
              size="icon"
              variant="outline"
              className="rounded-xl"
              onClick={() => setQty((q) => q + 1)}
              aria-label="Aumentar quantidade"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Button
            className="rounded-2xl"
            onClick={addToCart}
            disabled={!base}
            aria-disabled={!base}
          >
            Adicionar ao carrinho
          </Button>
        </section>
      </CardContent>
    </Card>
  );
}
