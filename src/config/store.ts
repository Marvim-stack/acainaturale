// src/config/store.ts
export const CONFIG = {
  delivery: {
    estimateMins: 40,
    /** Frete grátis por valor do pedido (ajuste como preferir) */
    freeFrom: 79.0,
    /** Endereço da loja (será geocodificado em runtime e cacheado) */
    store: {
      address: "Rua Souza Reis, 67 - São João, Porto Alegre/RS, Brasil",
    },
    /** Política de preço por distância */
    pricing: {
      freeRadiusKm: 8,        // grátis até 8 km
      baseFee: 7.9,           // taxa base quando passa de 8 km
      perKmAfterFree: 1.5,    // adicional por km após 8 km
      maxKm: 18,              // fora da área acima disso
    },
  },
} as const;
