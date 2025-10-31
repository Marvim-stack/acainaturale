import type { VercelRequest, VercelResponse } from "@vercel/node";
import { mpFetch } from "./_utils";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const id = (req.query.id as string) || "";
    if (!id) return res.status(400).json({ error: "id obrigatório" });

    const p = await mpFetch<any>(`/v1/payments/${id}`, { method: "GET" });

    return res.status(200).json({
      id: String(p.id),
      status: p.status,
      status_detail: p.status_detail,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: "Falha ao consultar status.",
      detail: err?.message || String(err),
    });
  }
}
