export function toSpacedHex(hex) {
  return (hex.match(/.{2}/g) || []).join(' ')
}

export function truncateHex(hex, headBytes = 6) {
  const bytes = hex.match(/.{2}/g) || []
  return `${bytes.slice(0, headBytes).join(' ')} ... ${bytes[bytes.length - 1]}`
}
