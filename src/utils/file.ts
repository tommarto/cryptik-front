export function formatBytes(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/**
 * Traduce el rechazo de react-dropzone a algo accionable. Sin esto, "formato o
 * tamaño" obliga al usuario a adivinar cuál de los dos falló.
 */
export function describeRejection(
  rejection: { file: File; errors: readonly { code: string }[] },
  maxBytes: number,
): string {
  const codes = rejection.errors.map((error) => error.code)
  const { file } = rejection

  if (codes.includes('file-too-large')) {
    return `"${file.name}" pesa ${formatBytes(file.size)} y el máximo es ${formatBytes(maxBytes)}.`
  }

  if (codes.includes('file-invalid-type')) {
    const type = file.type || 'desconocido'
    return `"${file.name}" es de tipo ${type} y no está soportado.`
  }

  return `No se pudo usar "${file.name}".`
}
