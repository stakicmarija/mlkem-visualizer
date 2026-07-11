const SUPERSCRIPT_DIGITS = {
  0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴',
  5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹',
}

function toSuperscript(n) {
  return String(n).split('').map(d => SUPERSCRIPT_DIGITS[d]).join('')
}

function formatTerm(absCoeff, exponent) {
  if (exponent === 0) return `${absCoeff}`
  if (exponent === 1) return `${absCoeff}x`
  return `${absCoeff}x${toSuperscript(exponent)}`
}

function formatSignedTerm(coeff, exponent, isFirst) {
  const term = formatTerm(Math.abs(coeff), exponent)
  if (isFirst) return coeff < 0 ? `-${term}` : term
  return coeff < 0 ? `- ${term}` : `+ ${term}`
}

// A polynomial has n = 256 terms, so the preview shows the first few plus
// the final term (highest exponent), e.g.
// "987 + 2821x + 205x² + 3325x³ + ... + 633x²⁵⁵".
function formatPolynomialTerms(coeffs, numTerms = 4) {
  const firstTerms = coeffs
    .slice(0, numTerms)
    .map((coeff, exponent) => formatSignedTerm(coeff, exponent, exponent === 0))
  const lastExponent = coeffs.length - 1
  const lastTerm = formatSignedTerm(coeffs[lastExponent], lastExponent, false)
  return `${firstTerms.join(' ')} + ... ${lastTerm}`
}

// e.g. "A₀₀(x) = 987 + 2821x + 205x² + 3325x³ + ... + 633x²⁵⁵"
export function formatPolynomialPreview(label, coeffs, numTerms = 4) {
  return `${label}(x) = ${formatPolynomialTerms(coeffs, numTerms)}`
}
