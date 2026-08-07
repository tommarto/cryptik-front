import { HttpError } from './httpError'
import type { HttpClient, HttpClientConfig, RequestOptions } from './types'

const DEFAULT_TIMEOUT_MS = 15_000

/**
 * Fábrica de clientes HTTP. Cada API externa crea el suyo con su baseUrl,
 * sus headers y su auth — los services de arriba no saben nada de fetch.
 */
export function createHttpClient(config: HttpClientConfig): HttpClient {
  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS

  async function request<T>(
    method: string,
    path: string,
    body?: unknown,
    options: RequestOptions = {},
  ): Promise<T> {
    const response = await fetch(buildUrl(config.baseUrl, path, options.query), {
      method,
      signal: buildSignal(options.signal, timeoutMs),
      headers: {
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...config.headers,
        ...(await config.getHeaders?.()),
        ...options.headers,
      },
      ...(body !== undefined && { body: JSON.stringify(body) }),
    })

    const payload = await parseBody(response)

    if (!response.ok) {
      throw new HttpError(
        errorMessage(payload, response),
        config.name,
        response.status,
        payload,
      )
    }

    return payload as T
  }

  return {
    name: config.name,
    get: (path, options) => request('GET', path, undefined, options),
    post: (path, body, options) => request('POST', path, body, options),
    put: (path, body, options) => request('PUT', path, body, options),
    patch: (path, body, options) => request('PATCH', path, body, options),
    delete: (path, options) => request('DELETE', path, undefined, options),
  }
}

function buildUrl(
  baseUrl: string,
  path: string,
  query: RequestOptions['query'],
): string {
  const url = new URL(path.replace(/^\//, ''), `${baseUrl.replace(/\/$/, '')}/`)

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value))
  }

  return url.toString()
}

function buildSignal(
  signal: AbortSignal | undefined,
  timeoutMs: number,
): AbortSignal {
  const timeout = AbortSignal.timeout(timeoutMs)
  return signal ? AbortSignal.any([signal, timeout]) : timeout
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null

  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function errorMessage(payload: unknown, response: Response): string {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const { message } = payload as { message: unknown }
    if (typeof message === 'string') return message
    if (Array.isArray(message)) return message.join(', ')
  }
  return response.statusText || `Error ${response.status}`
}
