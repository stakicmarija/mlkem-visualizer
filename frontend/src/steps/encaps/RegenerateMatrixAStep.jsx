import { useState } from 'react'
import MatrixAAnimation from '../../components/shared/step-content/MatrixAAnimation.jsx'
import Popup from '../../components/shared/popup/Popup.jsx'
import { explanations } from '../../data/explanations.js'
import { toSpacedHex } from '../../utils/hex.js'
import { formatPolynomialPreview } from '../../utils/polynomial.js'
import { useCellPopup } from '../../utils/useCellPopup.js'
import data from '../../data/mlkem_768_data.json'
import './RegenerateMatrixAStep.css'

const SUB = ['₀', '₁', '₂']

// mlkem_768_data.json only stores encaps.A_T (the transposed matrix Bob
// uses for u = A^T·y + e1), where A_T[i][j] = keygen.A[j][i]. Reading it
// back with swapped indices reconstructs the exact same A[i][j] grid Alice
// generated during KeyGen -- same cells, same values, same layout.
const CELLS = [0, 1, 2].flatMap(i =>
  [0, 1, 2].map(j => ({
    label: `A${SUB[i]}${SUB[j]}`,
    coeffs: data.encaps.A_T[j][i].coeffs,
  }))
)

function RegenerateMatrixAStep() {
  const popup = useCellPopup(CELLS.length)
  const cell = popup.index !== null ? CELLS[popup.index] : null
  const [rhoOpen, setRhoOpen] = useState(false)

  return (
    <div className="regenerate-matrix-a">
      <MatrixAAnimation onRhoClick={() => setRhoOpen(true)} onCellClick={popup.open} />

      <p className="regenerate-matrix-a__caption body-text">
        Bob regenerates the same matrix A using the ρ from Alice's public
        key.
      </p>

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
        value={toSpacedHex(data.encaps.decoded_rho)}
        isOpen={rhoOpen}
        onClose={() => setRhoOpen(false)}
      />
    </div>
  )
}

export default RegenerateMatrixAStep
