export type HttpClientConfig = {
  /** Nombre del cliente, usado en errores y logs. */
  name: string
  baseUrl: string
  /** Headers fijos que van en toda request. */
  headers?: Record<string, string>
  /** Headers resueltos por request (auth tokens, etc.). */
  getHeaders?: () =>
    | Record<string, string>
    | Promise<Record<string, string>>
  timeoutMs?: number
}

export type RequestOptions = {
  query?: Record<string, string | number | boolean | undefined>
  headers?: Record<string, string>
  signal?: AbortSignal
}

export type HttpClient = {
  readonly name: string
  get: <T>(path: string, options?: RequestOptions) => Promise<T>
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => Promise<T>
  put: <T>(path: string, body?: unknown, options?: RequestOptions) => Promise<T>
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) => Promise<T>
  delete: <T>(path: string, options?: RequestOptions) => Promise<T>
}
