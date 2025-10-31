import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const publicUrl = process.env.PUBLIC_URL || "auto";
  res.status(200).json({ ok: true, env: "server", public_url: publicUrl });
}
