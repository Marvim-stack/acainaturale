// api/payments/mp/webhook.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Vercel já usa HTTPS; assinatura opcional pode ser validada aqui no futuro
  try {
    console.log('Webhook MP:', JSON.stringify(req.body || {}, null, 2));
  } catch {
    console.log('Webhook MP: [unserializable body]');
  }
  res.status(200).end();
}
