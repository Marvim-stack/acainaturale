// src/lib/api.ts (frontend helper)
// Usa same-origin '/api' quando VITE_API_BASE não estiver definido.

const raw = (import.meta as any).env?.VITE_API_BASE || "";
const API_BASE = raw.replace(/\/+$/, "");
export const MP_ENABLED = ((import.meta as any).env?.VITE_MP_ENABLED ?? "true").toLowerCase() !== "false";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function buildUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (API_BASE) return `${API_BASE}${p}`;
  return `/api${p}`; // same-origin
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