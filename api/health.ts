// /api/health.ts
export default function handler(req: any, res: any) {
  res.status(200).json({
    ok: true,
    route: "/api/health",
    now: new Date().toISOString(),
    host: req.headers?.host || null,
  });
}
