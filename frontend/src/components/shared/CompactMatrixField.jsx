import CompactMatrix from './CompactMatrix.jsx'
import Popup from './Popup.jsx'
import { formatPolynomialPreview } from '../../utils/polynomial.js'
import { useCellPopup } from '../../utils/useCellPopup.js'

const SUB = ['₀', '₁', '₂']

// A CompactMatrix wired up to its own per-cell nav popup. See
// CompactVectorField.jsx — same pattern, for the 3×3 case.
function CompactMatrixField({ symbol, colorToken, coeffsGrid, body }) {
  const cells = coeffsGrid.flatMap((row, i) =>
    row.map((coeffs, j) => ({ label: `${symbol}${SUB[i]}${SUB[j]}`, coeffs }))
  )
  const popup = useCellPopup(cells.length)
  const cell = popup.index !== null ? cells[popup.index] : null

  return (
    <>
      <CompactMatrix symbol={symbol} colorToken={colorToken} onCellClick={(i, j) => popup.open(i * 3 + j)} />
      {cell && (
        <Popup
          title={cell.label}
          body={body}
          polynomialPreview={formatPolynomialPreview(cell.label, cell.coeffs)}
          fullCoefficients={cell.coeffs}
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

export default CompactMatrixField
