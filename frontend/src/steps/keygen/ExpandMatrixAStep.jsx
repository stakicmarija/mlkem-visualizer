import { useState } from 'react'
import MatrixAAnimation from '../../components/shared/step-content/MatrixAAnimation.jsx'
import Popup from '../../components/shared/popup/Popup.jsx'
import { explanations } from '../../data/explanations.js'
import { toSpacedHex } from '../../utils/hex.js'
import { formatPolynomialPreview } from '../../utils/polynomial.js'
import { useCellPopup } from '../../utils/useCellPopup.js'
import data from '../../data/mlkem_768_data.json'
import './ExpandMatrixAStep.css'

const SUB = ['₀', '₁', '₂']

// Flat list of A's 9 cells, in row-major order — index i*3+j — so prev/next
// navigation in the popup can walk straight through this array.
const CELLS = [0, 1, 2].flatMap(i =>
  [0, 1, 2].map(j => ({
    label: `A${SUB[i]}${SUB[j]}`,
    coeffs: data.keygen.A[i][j].coeffs,
  }))
)

function ExpandMatrixAStep() {
  const popup = useCellPopup(CELLS.length)
  const cell = popup.index !== null ? CELLS[popup.index] : null
  const [rhoOpen, setRhoOpen] = useState(false)

  return (
    <div className="expand-matrix-a">
      <MatrixAAnimation onRhoClick={() => setRhoOpen(true)} onCellClick={popup.open} />

      {cell && (
        <Popup
          title={cell.label}
          body={explanations.A.body}
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

      <Popup
        title={explanations.rho.title}
        body={explanations.rho.body}
        value={toSpacedHex(data.keygen.rho)}
        isOpen={rhoOpen}
        onClose={() => setRhoOpen(false)}
      />
    </div>
  )
}

export default ExpandMatrixAStep
