import MatrixCell from './MatrixCell.jsx'
import './CompactMatrix.css'

// 3×3 grid of separate bordered/tinted cells — blank except the center, which
// carries the symbol. Per CLAUDE.md: the compact style used whenever A/s/e/t
// appear as an INPUT to an operation, rather than being generated for the
// first time (which uses the detailed per-index MatrixCell grid instead).
function CompactMatrix({ symbol, colorToken, onCellClick }) {
  return (
    <div className="compact-matrix">
      {[0, 1, 2].map(i => (
        <div key={i} className="compact-matrix__row">
          {[0, 1, 2].map(j => (
            <MatrixCell
              key={j}
              label={i === 1 && j === 1 ? symbol : ''}
              state="done"
              colorToken={colorToken}
              tinted
              symbolOnly
              onClick={() => onCellClick(i, j)}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export default CompactMatrix
