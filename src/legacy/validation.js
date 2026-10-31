// These helpers reduce prototype input risks; they are not authorization.
export function safeResourceUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null
  } catch {
    return null
  }
}

export function validScore(value, maximum) {
  if (typeof value !== 'string' || value.trim() === '') return null
  const score = Number(value)
  const max = Number(maximum)
  return Number.isFinite(score) && Number.isFinite(max) && max >= 0 && score >= 0 && score <= max ? score : null
}
