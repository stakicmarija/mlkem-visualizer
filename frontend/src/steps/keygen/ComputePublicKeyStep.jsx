import { useState } from 'react'
import MatrixCell from '../../components/shared/MatrixCell.jsx'
import Popup from '../../components/shared/Popup.jsx'
import { explanations } from '../../data/explanations.js'
import data from '../../data/mlkem_768_data.json'
import './ComputePublicKeyStep.css'

const SUB = ['₀', '₁', '₂']

function Idx({ children }) {
  return (
    <span style={{ fontFamily: 'var(--font-index)', fontSize: '9px', verticalAlign: 'baseline' }}>
      {children}
    </span>
  )
}

function formatCoeffs(coeffs) {
  return coeffs.slice(0, 8).join(', ') + ', ...'
}

function LweVector({ symbol, colorClass, onCellClick }) {
  return (
    <div className={`lwe-vector ${colorClass}`}>
      {[0, 1, 2].map(i => (
        <button key={i} className="lwe-vector__cell" onClick={() => onCellClick(i)}>
          <span className="lwe-vector__label">
            <span className="lwe-vector__symbol">{symbol}</span>
            <span className="lwe-vector__index">{SUB[i]}</span>
          </span>
        </button>
      ))}
    </div>
  )
}

function ComputePublicKeyStep() {
  const [popup, setPopup] = useState(null) // { type: 'A'|'s'|'e'|'t', i, j? }

  return (
    <div className="compute-t-step">
      <div className="compute-t-step__equation">

        {/* Matrix A — 3×3 */}
        <div className="compute-t-step__operand">
          <div className="compute-t-matrix">
            {[0, 1, 2].map(i => (
              <div key={i} className="compute-t-matrix__row">
                {[0, 1, 2].map(j => (
                  <MatrixCell
                    key={j}
                    label={`A${SUB[i]}${SUB[j]}`}
                    state="done"
                    onClick={() => setPopup({ type: 'A', i, j })}
                  />
                ))}
              </div>
            ))}
          </div>
          <span className="compute-t-step__dim body-text">k×k</span>
        </div>

        <span className="compute-t-step__op body-text">×</span>

        {/* Vector s */}
        <div className="compute-t-step__operand">
          <LweVector
            symbol="s"
            colorClass="lwe-vector--s"
            polynomials={data.keygen.s}
            onCellClick={i => setPopup({ type: 's', i })}
          />
          <span className="compute-t-step__dim body-text">k×1</span>
        </div>

        <span className="compute-t-step__op body-text">+</span>

        {/* Vector e */}
        <div className="compute-t-step__operand">
          <LweVector
            symbol="e"
            colorClass="lwe-vector--e"
            polynomials={data.keygen.e}
            onCellClick={i => setPopup({ type: 'e', i })}
          />
          <span className="compute-t-step__dim body-text">k×1</span>
        </div>

        <span className="compute-t-step__op body-text">=</span>

        {/* Vector t */}
        <div className="compute-t-step__operand">
          <LweVector
            symbol="t"
            colorClass="lwe-vector--t"
            polynomials={data.keygen.t}
            onCellClick={i => setPopup({ type: 't', i })}
          />
          <span className="compute-t-step__dim body-text">k×1</span>
        </div>

      </div>

      <p className="compute-t-step__note body-text">
        The public key t combines the public matrix A, the secret s, and small noise e. The noise
        makes it hard to recover s from t, the core hardness (LWE) behind ML-KEM's security.
      </p>

      {popup?.type === 'A' && (
        <Popup
          title={<>A<Idx>{SUB[popup.i]}{SUB[popup.j]}</Idx></>}
          body={explanations.A.body}
          value={formatCoeffs(data.keygen.A[popup.i][popup.j].coeffs)}
          valueLabel="coefficients (mod q = 3329)"
          isOpen
          onClose={() => setPopup(null)}
        />
      )}
      {popup?.type === 's' && (
        <Popup
          title={<>s<Idx>{SUB[popup.i]}</Idx></>}
          body={explanations.s.body}
          value={formatCoeffs(data.keygen.s[popup.i].coeffs_signed)}
          valueLabel="coefficients (η₁ = 2, signed)"
          isOpen
          onClose={() => setPopup(null)}
        />
      )}
      {popup?.type === 'e' && (
        <Popup
          title={<>e<Idx>{SUB[popup.i]}</Idx></>}
          body={explanations.e.body}
          value={formatCoeffs(data.keygen.e[popup.i].coeffs_signed)}
          valueLabel="coefficients (η₁ = 2, signed)"
          isOpen
          onClose={() => setPopup(null)}
        />
      )}
      {popup?.type === 't' && (
        <Popup
          title={<>t<Idx>{SUB[popup.i]}</Idx></>}
          body={explanations.t.body}
          value={formatCoeffs(data.keygen.t[popup.i].coeffs)}
          valueLabel="coefficients (mod q = 3329)"
          isOpen
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  )
}

export default ComputePublicKeyStep
