import MatrixCell from './MatrixCell.jsx'
import './CompactVector.css'

// 3×1 stack of separate bordered/tinted cells — blank except the center.
// See CompactMatrix.jsx for when this compact style applies. `strong` swaps
// in a darker tint and bolds the label — used to mark a value that's been
// transformed from another compact block (e.g. ŝ/ê vs. s/e).
function CompactVector({ symbol, colorToken, onCellClick, strong = false }) {
  return (
    <div className="compact-vector">
      {[0, 1, 2].map(i => (
        <MatrixCell
          key={i}
          label={i === 1 ? symbol : ''}
          state="done"
          colorToken={colorToken}
          tinted
          strong={strong}
          symbolOnly
          onClick={() => onCellClick(i)}
        />
      ))}
    </div>
  )
}

export default CompactVector
