import type { VercelRequest, VercelResponse } from "@vercel/node";
import { mpFetch, resolvePublicUrl } from "./_utils";

type CreateCardReq = { title?: string; amount: number };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { title, amount } = (req.body || {}) as CreateCardReq;
    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ error: "amount inválido" });
    }

    const base = resolvePublicUrl(req); // ex.: https://acainaturale.vercel.app
    const payload = {
      items: [
        {
          id: "acai-naturale-item",
          title: title || "Pedido Açaí Naturale",
          quantity: 1,
          currency_id: "BRL",
          unit_price: Number(amount.toFixed(2)),
        },
      ],
      back_urls: {
        success: `${base}/mp/success`,
        pending: `${base}/mp/pending`,
        failure: `${base}/mp/failure`,
      },
      auto_return: "approved",
      notification_url: `${base}/api/payments/mp/webhook`,
    };

    const pref = await mpFetch<any>("/checkout/preferences", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!pref.init_point) {
      return res.status(500).json({ error: "Preference criada sem init_point." });
    }

    return res.status(200).json({ init_point: pref.init_point });
  } catch (err: any) {
    return res.status(500).json({
      error: "Falha ao iniciar pagamento.",
      detail: err?.message || String(err),
    });
  }
}
