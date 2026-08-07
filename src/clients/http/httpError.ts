export class HttpError extends Error {
  constructor(
    message: string,
    readonly client: string,
    readonly status: number,
    readonly body: unknown,
  ) {
    super(message)
    this.name = 'HttpError'
  }

  get isNotFound(): boolean {
    return this.status === 404
  }

  get isUnauthorized(): boolean {
    return this.status === 401 || this.status === 403
  }
}
