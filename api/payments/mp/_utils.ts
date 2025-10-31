import type { VercelRequest } from "@vercel/node";

export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

/** Descobre a PUBLIC_URL a partir do env ou do host da requisição */
export function resolvePublicUrl(req: VercelRequest): string {
  const envUrl = process.env.PUBLIC_URL?.trim();
  if (envUrl) return envUrl.replace(/\/+$/, "");

  const proto = (req.headers["x-forwarded-proto"] as string) || "https";
  const host = (req.headers["x-forwarded-host"] as string) || req.headers.host || "";
  return `${proto}://${host}`.replace(/\/+$/, "");
}

/** Fetch Mercado Pago com Bearer do env */
export async function mpFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const MP_ACCESS_TOKEN = requireEnv("MP_ACCESS_TOKEN");
  const res = await fetch(`https://api.mercadopago.com${path}`, {
    ...(init || {}),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `MP HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}
