// /api/payments/mp/pix.ts
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
  return res.status(code).json({ error: 'Falha ao gerar PIX.', detail: msg });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  allowCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const token = process.env.MP_ACCESS_TOKEN;
    if (!token) return jsonError(res, 500, 'MP_ACCESS_TOKEN não configurado');

    // precisa ser HTTPS válido em produção
    const publicUrl = process.env.PUBLIC_URL;
    if (!publicUrl || !/^https?:\/\//i.test(publicUrl)) {
      return jsonError(res, 400, 'PUBLIC_URL ausente ou inválido');
    }

    const { title, amount, payer } = (req.body ?? {}) as {
      title?: string;
      amount?: number;
      payer?: { name?: string; email?: string; phone?: string };
    };

    if (!amount || amount <= 0) return jsonError(res, 400, 'amount inválido');

    const payload = {
      transaction_amount: Number(amount.toFixed(2)),
      description: title || 'Pedido',
      payment_method_id: 'pix',
      payer: {
        email: payer?.email || 'comprador@example.com',
        first_name: payer?.name || 'Cliente',
      },
      // tem que ser URL pública alcançável pela MP
      notification_url: `${publicUrl.replace(/\/+$/, '')}/api/payments/mp/webhook`,
    };

    const mpRes = await fetch(`${MP_BASE}/v1/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const body = await mpRes.text();
    if (!mpRes.ok) throw new Error(body || `MP HTTP ${mpRes.status}`);

    const data = JSON.parse(body);
    const poi = data?.point_of_interaction || {};
    const qr_base64: string | undefined = poi?.transaction_data?.qr_code_base64;
    const qr_text: string | undefined = poi?.transaction_data?.qr_code;

    if (!qr_base64 || !qr_text) {
      return jsonError(res, 500, 'PIX gerado, mas sem QR retornado pela API.');
    }

    return res.status(200).json({
      id: String(data.id),
      status: data.status,
      qr_base64,
      qr_text,
    });
  } catch (err) {
    return jsonError(res, 500, err);
  }
}
