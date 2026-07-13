import CompactVectorField from '../../components/shared/matrix/CompactVectorField.jsx'
import CompactSingleField from '../../components/shared/matrix/CompactSingleField.jsx'
import TransformBox from '../../components/shared/diagram-boxes/TransformBox.jsx'
import { explanations } from '../../data/explanations.js'
import data from '../../data/mlkem_768_data.json'
import './ComputeVStep.css'

const { q } = data.params

// t̂ᵀy isn't stored in the data file (it's the mid-point before adding e2
// and μ), but it's fully recoverable from real data: v = t̂ᵀy + e2 + μ
// (mod q), so t̂ᵀy = v - e2 - μ (mod q). Keeps this intermediate block
// genuinely wired to real values instead of being decorative.
const tTyCoeffs = data.encaps.v.coeffs.map((c, j) =>
  ((c - data.encaps.e2.coeffs_signed[j] - data.encaps.mu.coeffs[j]) % q + q) % q
)

function ComputeVStep() {
  return (
    <div className="compute-v-step">
      <div className="compute-v-step__diagram">
        <div className="compute-v-step__top-row">
          <CompactVectorField
            symbol="t̂"
            colorToken="public-t"
            coeffsList={data.keygen.t.map(poly => poly.coeffs)}
            body={explanations.t.body}
          />
          <span className="compute-v-step__op body-text">×</span>
          <CompactVectorField
            symbol="ŷ"
            colorToken="ephemeral-y"
            coeffsList={data.encaps.y_ntt.map(poly => poly.coeffs)}
            body={explanations.y.body}
          />
        </div>

        <svg
          className="compute-v-step__svg"
          viewBox="0 0 240 48"
          width="240"
          height="48"
          style={{ overflow: 'visible' }}
          aria-hidden="true"
        >
          <path d="M 70 0 V 19 Q 70 24 75 24 H 120" fill="none" stroke="var(--color-transform)" strokeWidth="3" />
          <path d="M 170 0 V 19 Q 170 24 165 24 H 120" fill="none" stroke="var(--color-transform)" strokeWidth="3" />
          <line x1="120" y1="24" x2="120" y2="48" stroke="var(--color-transform)" strokeWidth="3" />
        </svg>

        <div className="compute-v-step__centered-under-ntt">
          <TransformBox name="NTT⁻¹" explanationKey="NTT_inverse" />
        </div>

        <div className="compute-v-step__vline compute-v-step__centered-under-ntt" />

        <div className="compute-v-step__equation">
          <CompactSingleField
            symbol="t̂ᵀy"
            colorToken="inactive"
            coeffs={tTyCoeffs}
            body={explanations.tTy.body}
          />

          <span className="compute-v-step__op body-text">+</span>

          <CompactSingleField
            symbol="e2"
            colorToken="noise-e2"
            coeffs={data.encaps.e2.coeffs_signed}
            body={explanations.e2.body}
          />

          <span className="compute-v-step__op body-text">+</span>

          <CompactSingleField
            symbol="μ"
            colorToken="encoded-message"
            coeffs={data.encaps.mu.coeffs}
            body={explanations.mu.body}
          />

          <span className="compute-v-step__op body-text">=</span>

          <CompactSingleField
            symbol="v"
            colorToken="ciphertext-v"
            coeffs={data.encaps.v.coeffs}
            body={explanations.v.body}
          />
        </div>
      </div>
    </div>
  )
}

export default ComputeVStep
