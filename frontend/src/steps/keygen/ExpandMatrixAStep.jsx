import Node from '../../components/shared/diagram-boxes/Node.jsx'
import MatrixCell from '../../components/shared/matrix/MatrixCell.jsx'
import RhoIJColumn from '../../components/shared/diagram-boxes/RhoIJColumn.jsx'
import TransformBox from '../../components/shared/diagram-boxes/TransformBox.jsx'
import Popup from '../../components/shared/popup/Popup.jsx'
import { explanations } from '../../data/explanations.js'
import { formatPolynomialPreview } from '../../utils/polynomial.js'
import { useCellPopup } from '../../utils/useCellPopup.js'
import data from '../../data/mlkem_768_data.json'
import './ExpandMatrixAStep.css'

const SUB = ['₀', '₁', '₂']

// Container width (320px) split into 3 equal grid columns with 16px gaps:
// each column is (320-32)/3 = 96px, centers at 48, 160, 272
const W = 320
const CX = [48, 160, 272]

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

  return (
    <div className="expand-matrix-a">
      <Node label="ρ" />

      {/* Fan-out: ρ → three columns */}
      <svg
        className="expand-matrix-a__svg"
        viewBox={`0 0 ${W} 24`}
        width={W}
        height="24"
        style={{ overflow: 'visible' }}
        aria-hidden="true"
      >
        {/* center drop passes straight through the crossbar */}
        <line x1={CX[1]} y1="0" x2={CX[1]} y2="24" stroke="var(--color-transform)" strokeWidth="3" />
        {/* left branch: from center, go left to corner, rounded turn, drop to col0 */}
        <path d={`M ${CX[1]} 12 H ${CX[0]+5} Q ${CX[0]} 12 ${CX[0]} 17 V 24`} fill="none" stroke="var(--color-transform)" strokeWidth="3" />
        {/* right branch: from center, go right to corner, rounded turn, drop to col2 */}
        <path d={`M ${CX[1]} 12 H ${CX[2]-5} Q ${CX[2]} 12 ${CX[2]} 17 V 24`} fill="none" stroke="var(--color-transform)" strokeWidth="3" />
      </svg>

      <div className="expand-matrix-a__columns">
        {[0, 1, 2].map(i => (
          <RhoIJColumn key={i} i={i} />
        ))}
      </div>

      {/* Fan-in: three columns → SampleNTT */}
      <svg
        className="expand-matrix-a__svg"
        viewBox={`0 0 ${W} 24`}
        width={W}
        height="24"
        style={{ overflow: 'visible' }}
        aria-hidden="true"
      >
        {/* col0: drop, rounded turn right, extend to center */}
        <path d={`M ${CX[0]} 0 V ${12-5} Q ${CX[0]} 12 ${CX[0]+5} 12 H ${CX[1]}`} fill="none" stroke="var(--color-transform)" strokeWidth="3" />
        {/* col1: straight drop all the way through */}
        <line x1={CX[1]} y1="0" x2={CX[1]} y2="24" stroke="var(--color-transform)" strokeWidth="3" />
        {/* col2: drop, rounded turn left, extend to center */}
        <path d={`M ${CX[2]} 0 V ${12-5} Q ${CX[2]} 12 ${CX[2]-5} 12 H ${CX[1]}`} fill="none" stroke="var(--color-transform)" strokeWidth="3" />
      </svg>

      <TransformBox name="SampleNTT" explanationKey="SampleNTT" />

      <div className="expand-matrix-a__vline" />

      <div className="matrix-a-grid">
        {[0, 1, 2].map(i => (
          <div key={i} className="matrix-a-grid__row">
            {[0, 1, 2].map(j => (
              <MatrixCell
                key={j}
                label={`A${SUB[i]}${SUB[j]}`}
                state="done"
                onClick={() => popup.open(i * 3 + j)}
              />
            ))}
          </div>
        ))}
      </div>

      <p className="expand-matrix-a__caption micro-label">
        Each entry of A is a polynomial with n = 256 coefficients,
        <br />
        each reduced mod q = 3329.
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
    </div>
  )
}

export default ExpandMatrixAStep
