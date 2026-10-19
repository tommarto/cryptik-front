export function activeMention(text: string, caret: number) {
  const upToCaret = text.slice(0, caret)
  const at = upToCaret.lastIndexOf('@')
  if (at === -1) return null

  const before = at === 0 ? ' ' : upToCaret[at - 1]
  if (!/\s/.test(before)) return null

  const query = upToCaret.slice(at + 1)
  if (/\s/.test(query)) return null

  return { at, query }
}
