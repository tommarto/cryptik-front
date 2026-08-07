export class HttpError extends Error {
  readonly client: string
  readonly status: number
  readonly body: unknown

  constructor(message: string, client: string, status: number, body: unknown) {
    super(message)
    this.name = 'HttpError'
    this.client = client
    this.status = status
    this.body = body
  }

  get isNotFound(): boolean {
    return this.status === 404
  }

  get isUnauthorized(): boolean {
    return this.status === 401 || this.status === 403
  }
}
