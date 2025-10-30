import { ProductBase } from "@/types";

export const PRODUCTS: ProductBase[] = [
  { id: "acai_300", name: "Açaí 300ml", desc: "Puro, cremoso, sem xarope.", basePrice: 14.9, volumeML: 300, available: true, img: "https://images.unsplash.com/photo-1597393359360-2a58f2c1dbc3?q=80&w=1200&auto=format&fit=crop" },
  { id: "acai_500", name: "Açaí 500ml", desc: "A pedida do fim de tarde.", basePrice: 22.9, volumeML: 500, available: true, img: "https://images.unsplash.com/photo-1464195157370-8c5b1f0a0e9d?q=80&w=1200&auto=format&fit=crop" },
  { id: "barca", name: "Barca de Açaí", desc: "Para compartilhar!", basePrice: 59.9, volumeML: 1000, available: true, img: "https://images.unsplash.com/photo-1546549039-49fa9f66c1a9?q=80&w=1200&auto=format&fit=crop" },
  { id: "acai_700", name: "Açaí 700ml", desc: "O grandão dos famintos.", basePrice: 29.9, volumeML: 700, available: false, img: "https://images.unsplash.com/photo-1568639100006-c43b1935f4d9?q=80&w=1200&auto=format&fit=crop" },
];
