/**
 * Devuelve el contenido del archivo en base64, sin el prefijo `data:` que
 * agrega FileReader — el worker espera solo la carga.
 */
export function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const result = reader.result as string
      resolve(result.slice(result.indexOf(',') + 1))
    }
    reader.onerror = () => reject(reader.error ?? new Error('Could not read the file.'))

    reader.readAsDataURL(file)
  })
}

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
