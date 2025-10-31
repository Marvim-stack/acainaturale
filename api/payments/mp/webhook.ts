// /api/payments/mp/webhook.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

function allowCors(res: VercelResponse) {
  const origin = process.env.ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  allowCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  // MP pode enviar GET (verificação) ou POST (eventos)
  try {
    // log simples; em produção, valide assinatura e atualize pedido no banco
    console.log('Webhook MP:', {
      method: req.method,
      query: req.query,
      body: req.body,
      headers: req.headers,
    });

    // sempre 200 para não gerar re-tentativas infinitas durante teste
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(200).json({ ok: true });
  }
}
