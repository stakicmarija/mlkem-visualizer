import { useState } from 'react'
import MatrixCell from './MatrixCell.jsx'
import Popup from '../popup/Popup.jsx'
import { formatPolynomialPreview } from '../../../utils/polynomial.js'
import './CompactSingleField.css'

// A single bordered/tinted cell for one standalone polynomial (not a
// vector/matrix of them) -- e.g. e2, μ, v, or an unnamed intermediate like
// t̂ᵀy. Same click-to-inspect pattern as CompactVectorField/CompactMatrixField,
// just without prev/next since there's only the one polynomial.
// `clickable=false` opts out of the popup entirely.
function CompactSingleField({ symbol, colorToken, coeffs, body, strong = false, clickable = true }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="compact-single">
      <MatrixCell
        label={symbol}
        state="done"
        colorToken={colorToken}
        tinted
        strong={strong}
        symbolOnly
        onClick={clickable ? () => setOpen(true) : undefined}
      />
      {clickable && open && (
        <Popup
          title={symbol}
          body={body}
          polynomialPreview={formatPolynomialPreview(symbol, coeffs)}
          fullCoefficients={coeffs}
          isOpen
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  )
}

export default CompactSingleField
