import CompactMatrixField from '../../components/shared/matrix/CompactMatrixField.jsx'
import CompactVectorField from '../../components/shared/matrix/CompactVectorField.jsx'
import TransformBox from '../../components/shared/diagram-boxes/TransformBox.jsx'
import { explanations } from '../../data/explanations.js'
import data from '../../data/mlkem_768_data.json'
import './ComputeUStep.css'

const { q } = data.params

// Aᵀy isn't stored in the data file (it's the mid-point before adding e1),
// but it's fully recoverable from real data: u = Aᵀy + e1 (mod q), so
// Aᵀy = u - e1 (mod q). Keeps this intermediate block genuinely wired to
// real values instead of being decorative.
const atY = data.encaps.u.map((poly, i) => ({
  coeffs: poly.coeffs.map((c, j) => ((c - data.encaps.e1[i].coeffs_signed[j]) % q + q) % q),
}))

function ComputeUStep() {
  return (
    <div className="compute-u-step">
      <div className="compute-u-step__diagram">
        <div className="compute-u-step__top-row">
          <CompactMatrixField
            symbol="Aᵀ"
            colorToken="matrix-a"
            coeffsGrid={data.encaps.A_T.map(row => row.map(poly => poly.coeffs))}
            body={explanations.A.body}
          />
          <span className="compute-u-step__op body-text">×</span>
          <CompactVectorField
            symbol="ŷ"
            colorToken="ephemeral-y"
            coeffsList={data.encaps.y_ntt.map(poly => poly.coeffs)}
            body={explanations.y.body}
          />
        </div>

        <svg
          className="compute-u-step__svg"
          viewBox="0 0 240 48"
          width="240"
          height="48"
          style={{ overflow: 'visible' }}
          aria-hidden="true"
        >
          <path d="M 70 0 V 19 Q 70 24 75 24 H 144" fill="none" stroke="var(--color-transform)" strokeWidth="3" />
          <path d="M 218 0 V 19 Q 218 24 213 24 H 144" fill="none" stroke="var(--color-transform)" strokeWidth="3" />
          <line x1="144" y1="24" x2="144" y2="48" stroke="var(--color-transform)" strokeWidth="3" />
        </svg>

        <div className="compute-u-step__centered-under-ntt">
          <TransformBox name="NTT⁻¹" explanationKey="NTT_inverse" />
        </div>

        <div className="compute-u-step__vline compute-u-step__centered-under-ntt" />

        <div className="compute-u-step__equation">

          <div className="compute-u-step__operand">
            <CompactVectorField
              symbol="Aᵀy"
              colorToken="inactive"
              coeffsList={atY.map(poly => poly.coeffs)}
              body={explanations.Aty.body}
            />
            <span className="compute-u-step__dim body-text">k×1</span>
          </div>

          <span className="compute-u-step__op body-text">+</span>

          <div className="compute-u-step__operand">
            <CompactVectorField
              symbol="e1"
              colorToken="noise-e"
              coeffsList={data.encaps.e1.map(poly => poly.coeffs_signed)}
              body={explanations.e1.body}
            />
            <span className="compute-u-step__dim body-text">k×1</span>
          </div>

          <span className="compute-u-step__op body-text">=</span>

          <div className="compute-u-step__operand">
            <CompactVectorField
              symbol="u"
              colorToken="ciphertext-u"
              coeffsList={data.encaps.u.map(poly => poly.coeffs)}
              body={explanations.u.body}
            />
            <span className="compute-u-step__dim body-text">k×1</span>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ComputeUStep
