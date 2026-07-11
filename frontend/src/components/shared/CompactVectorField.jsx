import CompactVector from './CompactVector.jsx'
import Popup from './Popup.jsx'
import { formatPolynomialPreview } from '../../utils/polynomial.js'
import { useCellPopup } from '../../utils/useCellPopup.js'

const SUB = ['₀', '₁', '₂']

// A CompactVector wired up to its own per-cell nav popup. Every compact
// vector block (s, e, t, ŝ, ê, ...) follows the same pattern: click any
// cell to see that polynomial, prev/next to walk the other cells of the
// same vector — this bundles that wiring so steps only supply the data.
function CompactVectorField({ symbol, colorToken, coeffsList, body, strong = false }) {
  const popup = useCellPopup(coeffsList.length)
  const cellLabel = popup.index !== null ? `${symbol}${SUB[popup.index]}` : null

  return (
    <>
      <CompactVector
        symbol={symbol}
        colorToken={colorToken}
        onCellClick={popup.open}
        strong={strong}
      />
      {popup.index !== null && (
        <Popup
          title={cellLabel}
          body={body}
          polynomialPreview={formatPolynomialPreview(cellLabel, coeffsList[popup.index])}
          fullCoefficients={coeffsList[popup.index]}
          onPrev={popup.goPrev}
          onNext={popup.goNext}
          hasPrev={popup.hasPrev}
          hasNext={popup.hasNext}
          isOpen
          onClose={popup.close}
        />
      )}
    </>
  )
}

export default CompactVectorField
