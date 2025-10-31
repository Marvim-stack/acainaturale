import type { VercelRequest, VercelResponse } from "@vercel/node";
import { mpFetch, resolvePublicUrl } from "./_utils";

type CreatePixReq = {
  title?: string;
  amount: number;
  payer?: { name?: string; email?: string; phone?: string };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { title, amount, payer } = (req.body || {}) as CreatePixReq;

    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ error: "amount inválido" });
    }

    const base = resolvePublicUrl(req);
    const payload = {
      transaction_amount: Number(amount.toFixed(2)),
      description: title || "Pedido Açaí Naturale",
      payment_method_id: "pix",
      payer: {
        email: payer?.email || "comprador@example.com",
        first_name: payer?.name || "Cliente",
      },
      notification_url: `${base}/api/payments/mp/webhook`,
    };

    const mpResp = await mpFetch<any>("/v1/payments", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const poi = mpResp.point_of_interaction || {};
    const qr_base64: string | undefined = poi.transaction_data?.qr_code_base64;
    const qr_text: string | undefined = poi.transaction_data?.qr_code;

    if (!qr_base64 || !qr_text) {
      return res.status(500).json({ error: "PIX gerado, mas sem QR retornado pela API." });
    }

    return res.status(200).json({
      id: String(mpResp.id),
      status: mpResp.status,
      qr_base64,
      qr_text,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: "Falha ao gerar PIX.",
      detail: err?.message || String(err),
    });
  }
}
