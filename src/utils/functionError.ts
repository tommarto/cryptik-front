/**
 * `functions.invoke` no expone el cuerpo del error, solo el status. El mensaje
 * útil viene en el body, así que hay que leerlo de la respuesta.
 */
export async function readFunctionError(error: unknown): Promise<string> {
  const context = (error as { context?: Response }).context

  if (context && typeof context.json === 'function') {
    try {
      const body = await context.json()
      if (typeof body?.error === 'string') {
        return body.detail ? `${body.error} (${body.detail})` : body.error
      }
    } catch {
      // sin cuerpo JSON: caemos al mensaje genérico
    }
  }

  return error instanceof Error ? error.message : 'Unexpected error'
}
