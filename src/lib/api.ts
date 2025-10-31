const base = (import.meta.env.VITE_API_BASE || "").replace(/\/+$/, "");
export const API_BASE = base || ""; // same-origin na Vercel quando vazio
export const MP_ENABLED = (import.meta.env.VITE_MP_ENABLED ?? "true").toLowerCase() !== "false";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function buildUrl(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  // Se API_BASE está vazio, use /api do mesmo domínio (Vercel)
  return `${API_BASE}${API_BASE ? "" : "/api"}${p}`;
}

export async function postJSON<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(buildUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return json<T>(res);
}

export async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(buildUrl(path));
  return json<T>(res);
}

export const api = { post: postJSON, get: getJSON };
