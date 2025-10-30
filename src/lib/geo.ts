// src/lib/geo.ts
export function onlyDigits(s: string) {
  return (s || "").replace(/\D/g, "");
}

export type LatLng = { lat: number; lng: number };

export function haversineKm(a: LatLng, b: LatLng) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s1 =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(s1), Math.sqrt(1 - s1));
  return R * c;
}

/** ViaCEP → preenche logradouro/bairro/cidade/UF */
export async function viaCep(cep: string) {
  const code = onlyDigits(cep);
  if (code.length !== 8) return null;
  const res = await fetch(`https://viacep.com.br/ws/${code}/json/`, {
    headers: { Accept: "application/json" },
  });
  const json = await res.json();
  if (!json || json.erro) return null;
  return {
    street: (json.logradouro ?? "") as string,
    district: (json.bairro ?? "") as string,
    city: `${json.localidade ?? ""}`,
    uf: (json.uf ?? "") as string,
  };
}

/** Geocodifica com Nominatim (ideal mover para o backend depois) */
export async function geocode(address: string): Promise<LatLng | null> {
  const url =
    "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" +
    encodeURIComponent(address);
  const res = await fetch(url, {
    headers: {
      "Accept-Language": "pt-BR",
      // Boas práticas OSM: indique um contato seu aqui
      "User-Agent": "AcaiNaturale/1.0 (contato@exemplo.com)",
    },
  });
  const data = (await res.json()) as Array<{ lat: string; lon: string }>;
  if (!data?.length) return null;
  return { lat: Number(data[0].lat), lng: Number(data[0].lon) };
}
