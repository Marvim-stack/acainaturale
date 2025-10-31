import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Aqui você pode validar assinatura se usar um secret próprio (opcional).
    // Ex: const secret = process.env.WEBHOOK_SECRET;

    // Por ora, apenas loga e responde 200.
    console.log("Webhook MP ->", JSON.stringify(req.body || {}, null, 2));
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    // Mesmo em erro, devolvemos 200 para o MP não reenfileirar indefinidamente (ajuste conforme sua estratégia)
    console.error("Erro no webhook:", err?.message || String(err));
    return res.status(200).end();
  }
}
