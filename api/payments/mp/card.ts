// api/payments/mp/card.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

const MP_BASE = 'https://api.mercadopago.com';

function allowCORS(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
function publicUrl(req: VercelRequest) {
  const env = process.env.PUBLIC_URL?.replace(/\/+$/, '');
  if (env) return env;
  const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const host = ((req.headers['x-forwarded-host'] as string) || req.headers.host || '').toString();
  return `${proto}://${host}`.replace(/\/+$/, '');
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
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { title, amount } = (req.body || {}) as { title?: string; amount?: number };
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'amount inválido' });
    }

    const base = publicUrl(req);
    const payload = {
      items: [
        {
          id: 'order',
          title: title || 'Pedido',
          quantity: 1,
          currency_id: 'BRL',
          unit_price: Number(amount.toFixed(2)),
        },
      ],
      back_urls: {
        success: `${base}/mp/success`,
        pending: `${base}/mp/pending`,
        failure: `${base}/mp/failure`,
      },
      auto_return: 'approved',
      notification_url: `${base}/api/payments/mp/webhook`,
    };

    const pref = await mpFetch<any>('/checkout/preferences', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!pref.init_point) {
      return res.status(500).json({ error: 'Preference criada sem init_point.' });
    }
    return res.status(200).json({ init_point: pref.init_point });
  } catch (err: any) {
    return res.status(500).json({
      error: 'Falha ao iniciar pagamento.',
      detail: err?.message || String(err),
    });
  }
}
