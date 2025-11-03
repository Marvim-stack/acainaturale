import type { VercelRequest, VercelResponse } from "@vercel/node";

const MP_BASE = "https://api.mercadopago.com";
const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN!;
const PUBLIC_URL = process.env.PUBLIC_URL || "https://acainaturale.vercel.app";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { title, amount } = (req.body ?? {}) as { title?: string; amount?: number };
    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ error: "amount inválido" });
    }

    const payload = {
      items: [
        { id: "order", title: title || "Pedido", quantity: 1, currency_id: "BRL", unit_price: Number(amount.toFixed(2)) }
      ],
      auto_return: "approved",
      back_urls: {
        success: `${PUBLIC_URL}/mp/success`,
        pending: `${PUBLIC_URL}/mp/pending`,
        failure: `${PUBLIC_URL}/mp/failure`,
      },
      notification_url: `${PUBLIC_URL}/api/payments/mp/webhook`,
      payment_methods: { excluded_payment_types: [] },
      binary_mode: false,
      statement_descriptor: "ACAI NATURALE",
    };

    const resp = await fetch(`${MP_BASE}/checkout/preferences`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${ACCESS_TOKEN}` },
      body: JSON.stringify(payload),
    });

    const pref = await resp.json();
    if (!resp.ok || !pref?.init_point) {
      return res.status(500).json({ error: "Falha ao criar preference.", detail: JSON.stringify(pref) });
    }
    return res.json({ init_point: pref.init_point });
  } catch (e: any) {
    return res.status(500).json({ error: "Falha ao iniciar pagamento.", detail: e?.message || String(e) });
  }
}
