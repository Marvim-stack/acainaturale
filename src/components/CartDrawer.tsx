import React from "react";
import { useCart } from "@/context/CartContext";
import { money } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose, // 👈 para fechar pelo botão
} from "@/components/ui/sheet";
import { ShoppingCart, Minus, Plus, Trash2, X } from "lucide-react";
import { CONFIG } from "@/config/store";

export function CartDrawer() {
  const { items, subtotal, delivery, total, changeQty, remove, clear } = useCart();
  const [open, setOpen] = React.useState(false);
  const totalQty = items.reduce((a, i) => a + i.qty, 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="default" className="rounded-2xl">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Carrinho ({totalQty})
        </Button>
      </SheetTrigger>

      {/* Drawer: layout em coluna; rodapé sticky */}
      <SheetContent size="xl" className="p-0">
        <div className="flex h-full min-h-0 flex-col">
          {/* Cabeçalho com botão de fechar */}
          <div className="px-6 pt-6">
            <div className="flex items-center justify-between">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" /> Seu carrinho
                </SheetTitle>
              </SheetHeader>

              <SheetClose asChild>
                <button
                  aria-label="Fechar carrinho"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </SheetClose>
            </div>
          </div>

          {/* Lista de itens (rolável quando precisar) */}
          <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-4 space-y-4">
            {items.length === 0 && (
              <p className="text-sm text-slate-500 pt-4">Seu carrinho está vazio. 😋</p>
            )}

            <div className="space-y-3 pt-4">
              {items.map((item) => {
                const unit = item.basePrice + item.toppings.reduce((a, o) => a + o.price, 0);
                return (
                  <Card key={item.key} className="rounded-2xl">
                    <CardContent className="p-4 grid grid-cols-[88px_1fr_auto] gap-3 items-center">
                      {item.img ? (
                        <img
                          src={item.img}
                          alt={item.name}
                          className="h-20 w-20 rounded-xl object-cover bg-slate-100"
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-xl bg-slate-100" />
                      )}
                      <div>
                        <div className="font-medium">{item.name}</div>
                        {item.toppings?.length ? (
                          <div className="text-xs text-slate-500">
                            {item.toppings.map((o) => o.label).join(", ")}
                          </div>
                        ) : null}
                        <div className="text-sm mt-1">{money(unit)}</div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => changeQty(item.key, -1)}
                            aria-label="Diminuir quantidade"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-6 text-center text-sm">{item.qty}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => changeQty(item.key, 1)}
                            aria-label="Aumentar quantidade"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(item.key)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remover
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Rodapé STICKY: totais + CTAs sempre visíveis */}
          <div className="sticky bottom-0 left-0 right-0 border-t bg-white">
            <div className="px-6 py-3">
              {items.length > 0 ? (
                <>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{money(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Entrega</span>
                      <span>{delivery === 0 ? "Grátis" : money(delivery)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-base">
                      <span>Total</span>
                      <span>{money(total)}</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Entrega média {CONFIG.delivery.estimateMins} min • Frete grátis a partir de{" "}
                      {money(CONFIG.delivery.freeFrom)}
                    </p>
                  </div>

                  <SheetFooter className="mt-3 flex-col sm:flex-row gap-2">
                    <Button
                      className="rounded-xl w-full"
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent("checkout:open"));
                        setOpen(false);
                      }}
                    >
                      Finalizar pedido
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={clear}>
                      Limpar carrinho
                    </Button>
                  </SheetFooter>
                </>
              ) : (
                <Button className="rounded-xl w-full" disabled>
                  Seu carrinho está vazio
                </Button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
