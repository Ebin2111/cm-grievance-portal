const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
export const TOKEN_KEY = 'cmk_token';

export class ApiError extends Error {
  constructor(message: string, public status: number, public details?: Record<string, string[]>) { super(message); }
}

const token = () => (typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY));

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  const t = token();
  if (t) headers.Authorization = `Bearer ${t}`;
  let payload: BodyInit | undefined;
  if (body instanceof FormData) payload = body;
  else if (body !== undefined) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }

  let res: Response;
  try { res = await fetch(`${BASE}${path}`, { method, headers, body: payload }); }
  catch { throw new ApiError('Cannot reach the server. Please try again.', 0); }

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    const fieldMsg = json?.error?.details && Object.values(json.error.details as Record<string, string[]>)[0]?.[0];
    throw new ApiError(fieldMsg || json?.error?.message || 'Request failed', res.status, json?.error?.details);
  }
  return json.data as T;
}

export const api = {
  get: <T,>(p: string) => request<T>('GET', p),
  post: <T,>(p: string, b?: unknown) => request<T>('POST', p, b ?? {}),
  patch: <T,>(p: string, b?: unknown) => request<T>('PATCH', p, b ?? {}),
};

/** Attachments need the Bearer token, so fetch as a blob and open it. */
export async function openAttachment(id: string) {
  const res = await fetch(`${BASE}/attachments/${id}`, { headers: { Authorization: `Bearer ${token()}` } });
  if (!res.ok) throw new ApiError('Could not open the file', res.status);
  window.open(URL.createObjectURL(await res.blob()), '_blank');
}

export const fmtDate = (s: string) => new Date(s).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
export const fmtDay = (s: string) => new Date(s).toLocaleDateString('en-IN', { dateStyle: 'medium' });
