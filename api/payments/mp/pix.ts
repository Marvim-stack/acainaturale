// api/payments/mp/pix.ts
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
    const { title, amount, payer } = (req.body || {}) as {
      title?: string;
      amount?: number;
      payer?: { name?: string; email?: string; phone?: string };
    };

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'amount inválido' });
    }

    const payload = {
      transaction_amount: Number(amount.toFixed(2)),
      description: title || 'Pedido',
      payment_method_id: 'pix',
      payer: {
        email: payer?.email || 'comprador@example.com',
        first_name: payer?.name || 'Cliente',
      },
      // webhook válido e público
      notification_url: `${publicUrl(req)}/api/payments/mp/webhook`,
    };

    const mpResp = await mpFetch<any>('/v1/payments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const poi = mpResp.point_of_interaction || {};
    const qr_base64: string | undefined = poi.transaction_data?.qr_code_base64;
    const qr_text: string | undefined = poi.transaction_data?.qr_code;

    if (!qr_base64 || !qr_text) {
      return res.status(500).json({ error: 'PIX gerado, mas sem QR retornado pela API.' });
    }

    return res.status(200).json({
      id: String(mpResp.id),
      status: mpResp.status,
      qr_base64,
      qr_text,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: 'Falha ao gerar PIX.',
      detail: err?.message || String(err),
    });
  }
}
