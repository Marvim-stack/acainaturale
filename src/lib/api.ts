const raw = (import.meta.env.VITE_API_BASE ?? '').trim();
const base = raw.replace(/\/+$/, '');              // remove barras finais
const prefix = base ? '' : '/api';                 // same-origin usa /api

export const API_BASE = base;                      // se vazio => same-origin
export const MP_ENABLED =
  (import.meta.env.VITE_MP_ENABLED ?? 'true').toLowerCase() !== 'false';

async function asJson<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error((await res.text().catch(() => '')) || `HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

function join(path: string) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${API_BASE ? '' : prefix}${p}`;
}

export async function postJSON<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(join(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return asJson<T>(res);
}

export async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(join(path));
  return asJson<T>(res);
}

export const api = { post: postJSON, get: getJSON };
