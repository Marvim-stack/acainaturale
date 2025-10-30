
import React from "react";
import Home from "@/pages/Home";
import { CartProvider } from "@/context/CartContext";
import { CartDrawer } from "@/components/CartDrawer";
import { Store } from "lucide-react";
import { CONFIG } from "@/config/store";
import { Checkout } from "@/components/Checkout";

export default function App() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900">
        <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-purple-600 flex items-center justify-center shadow-sm shrink-0">
                <Store className="h-4 w-4 text-white" />
              </div>
              <div className="leading-tight truncate">
                <h1 className="font-semibold text-sm sm:text-base truncate">{CONFIG.storeName}</h1>
                <p className="text-[10px] sm:text-xs text-slate-500 truncate">{CONFIG.tagline}</p>
              </div>
            </div>
            <div className="shrink-0">
              <CartDrawer />
            </div>
          </div>
        </header>

        <Home />
        <Checkout />
      </div>
    </CartProvider>
  );
}
