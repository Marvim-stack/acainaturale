// /api/payments/mp/status.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

const MP_BASE = 'https://api.mercadopago.com';

function allowCors(res: VercelResponse) {
  const origin = process.env.ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  allowCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const token = process.env.MP_ACCESS_TOKEN;
    if (!token) return res.status(500).json({ error: 'MP_ACCESS_TOKEN não configurado' });

    // aceita ?id=... (ex.: /api/payments/mp/status?id=123)
    const id = (req.query.id || req.query.payment_id) as string | undefined;
    if (!id) return res.status(400).json({ error: 'id obrigatório' });

    const mpRes = await fetch(`${MP_BASE}/v1/payments/${encodeURIComponent(id)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const text = await mpRes.text();
    if (!mpRes.ok) return res.status(mpRes.status).json({ error: text || 'erro MP' });

    const p = JSON.parse(text);
    return res.status(200).json({
      id: String(p.id),
      status: p.status,
      status_detail: p.status_detail,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Falha ao consultar status.', detail: err?.message || String(err) });
  }
}
