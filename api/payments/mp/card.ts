// /api/payments/mp/card.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

const MP_BASE = 'https://api.mercadopago.com';

function allowCors(res: VercelResponse) {
  const origin = process.env.ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function jsonError(res: VercelResponse, code: number, error: unknown) {
  const msg = typeof error === 'string' ? error : (error as any)?.message || String(error);
  return res.status(code).json({ error: 'Falha ao iniciar pagamento.', detail: msg });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  allowCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const token = process.env.MP_ACCESS_TOKEN;
    if (!token) return jsonError(res, 500, 'MP_ACCESS_TOKEN não configurado');

    const publicUrl = process.env.PUBLIC_URL;
    if (!publicUrl || !/^https?:\/\//i.test(publicUrl)) {
      return jsonError(res, 400, 'PUBLIC_URL ausente ou inválido');
    }

    const { title, amount } = (req.body ?? {}) as { title?: string; amount?: number };
    if (!amount || amount <= 0) return jsonError(res, 400, 'amount inválido');

    const base = publicUrl.replace(/\/+$/, '');
    const payload = {
      items: [
        {
          id: 'order-1',
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

    const mpRes = await fetch(`${MP_BASE}/checkout/preferences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await mpRes.text();
    if (!mpRes.ok) throw new Error(text || `MP HTTP ${mpRes.status}`);

    const pref = JSON.parse(text);
    const init_point = pref?.init_point;
    if (!init_point) return jsonError(res, 500, 'Preference criada sem init_point.');

    return res.status(200).json({ init_point });
  } catch (err) {
    return jsonError(res, 500, err);
  }
}
