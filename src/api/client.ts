/**
 * Thin fetch wrapper around Bridle Backend's REST API. Every read in this
 * app goes through here — the frontend never talks to Soroban RPC directly
 * for reads (policy writes are the one exception, and even those only
 * touch the chain with a transaction this backend already built; see
 * src/lib/freighter.ts).
 */

const BASE_URL = (import.meta.env.VITE_BRIDLE_API_URL ?? 'http://localhost:8000').replace(/\/+$/, '')

/** Backend reachable, but responded with a non-2xx status. */
export class ApiError extends Error {
  status: number
  body: unknown

  constructor(status: number, message: string, body?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

/** Could not reach the backend at all (offline, DNS failure, CORS, etc). */
export class NetworkError extends Error {
  constructor(cause?: unknown) {
    super("Can't reach Bridle Backend right now.")
    this.name = 'NetworkError'
    this.cause = cause
  }
}

type QueryValue = string | number | boolean | undefined | null

function buildQuery(params?: Record<string, QueryValue>): string {
  if (!params) return ''
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    search.set(key, String(value))
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    })
  } catch (err) {
    throw new NetworkError(err)
  }

  if (!res.ok) {
    let body: unknown
    try {
      body = await res.json()
    } catch {
      // Non-JSON error body (e.g. a proxy's HTML error page) — leave undefined.
    }
    throw new ApiError(res.status, `Bridle Backend request to ${path} failed with ${res.status}`, body)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export function apiGet<T>(path: string, params?: Record<string, QueryValue>): Promise<T> {
  return request<T>(`${path}${buildQuery(params)}`)
}

export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) })
}
