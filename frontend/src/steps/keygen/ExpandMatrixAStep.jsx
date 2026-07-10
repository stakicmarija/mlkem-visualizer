import { useState } from 'react'
import MatrixCell from '../../components/shared/MatrixCell.jsx'
import Popup from '../../components/shared/Popup.jsx'
import { explanations } from '../../data/explanations.js'
import data from '../../data/mlkem_768_data.json'
import './ExpandMatrixAStep.css'

const SUB = ['₀', '₁', '₂']

function Idx({ children }) {
  return (
    <span style={{ fontFamily: 'var(--font-index)', verticalAlign: 'baseline' }}>
      {children}
    </span>
  )
}

function formatCoeffs(coeffs) {
  return coeffs.slice(0, 8).join(', ') + ', ...'
}

function ExpandMatrixAStep() {
  const [openCell, setOpenCell] = useState(null)

  return (
    <div className="expand-matrix-a">
      <div className="matrix-a-grid">
        {[0, 1, 2].map(i => (
          <div key={i} className="matrix-a-grid__row">
            {[0, 1, 2].map(j => (
              <MatrixCell
                key={j}
                label={`A${SUB[i]}${SUB[j]}`}
                state="done"
                onClick={() => setOpenCell([i, j])}
              />
            ))}
          </div>
        ))}
      </div>

      {openCell && (
        <Popup
          title={<>A<Idx>{SUB[openCell[0]]}{SUB[openCell[1]]}</Idx></>}
          body={explanations.A.body}
          value={formatCoeffs(data.keygen.A[openCell[0]][openCell[1]].coeffs)}
          valueLabel="coefficients (mod q = 3329)"
          isOpen
          onClose={() => setOpenCell(null)}
        />
      )}
    </div>
  )
}

export default ExpandMatrixAStep
