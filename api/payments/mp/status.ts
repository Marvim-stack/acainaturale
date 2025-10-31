// api/payments/mp/status.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

const MP_BASE = 'https://api.mercadopago.com';

function allowCORS(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
async function mpFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error('Missing MP_ACCESS_TOKEN');
  const res = await fetch(`${MP_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(txt || `MP HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  allowCORS(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const id = (req.query.id as string) || '';
    if (!id) return res.status(400).json({ error: 'id obrigatório' });

    const p = await mpFetch<any>(`/v1/payments/${encodeURIComponent(id)}`, { method: 'GET' });
    return res.status(200).json({ id: String(p.id), status: p.status, status_detail: p.status_detail });
  } catch (err: any) {
    return res.status(500).json({ error: 'Falha ao consultar status.', detail: err?.message || String(err) });
  }
}
