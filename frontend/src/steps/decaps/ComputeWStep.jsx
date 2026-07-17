import CompactSingleField from '../../components/shared/matrix/CompactSingleField.jsx'
import TransformBox from '../../components/shared/diagram-boxes/TransformBox.jsx'
import NttColumn from '../../components/shared/step-content/NttColumn.jsx'
import { explanations } from '../../data/explanations.js'
import data from '../../data/mlkem_768_data.json'
import './ComputeWStep.css'

const { q } = data.params

// ŝᵀu' isn't stored in the data file (it's the mid-point before subtracting
// from v'), but it's fully recoverable from real data: w = v' − ŝᵀu' (mod
// q), so ŝᵀu' = v' − w (mod q). Same "recover the undisplayed middle value
// algebraically from the real stored endpoints" technique ComputeVStep uses
// for tTyCoeffs.
const sTuCoeffs = data.decaps.v_decoded.coeffs.map((c, j) =>
  ((c - data.decaps.w.coeffs[j]) % q + q) % q
)

// Not interactive yet -- every cell in this diagram is click-disabled for
// now (popups come in a later pass).
function ComputeWStep() {
  return (
    <div className="compute-w-step">
      {/* u' isn't already in NTT form the way y was for ComputeVStep -- it
          has to be transformed here first, unlike t̂ᵀy's ŷ which arrived
          pre-NTT'd from TransformNttStep. ŝ has no transform to show here
          (already NTT-form from KeyGen), so it renders as a static column
          alongside u''s live transform -- same two-column layout as
          TransformNttStep's s/e. This is the only place either û' or ŝ
          appears in this step -- no separate copy lower down. */}
      <div className="compute-w-step__columns">
        <NttColumn
          symbol="u'"
          hatSymbol="û'"
          colorToken="ciphertext-u-prime"
          coeffsList={data.decaps.u_decoded.map(poly => poly.coeffs)}
          nttCoeffsList={data.decaps.u_decoded_ntt.map(poly => poly.coeffs)}
          body={explanations.uPrime.body}
          clickable={false}
        />
        <NttColumn
          showTransform={false}
          symbol="ŝ"
          colorToken="secret-s"
          coeffsList={data.keygen.s_ntt.map(poly => poly.coeffs)}
          body={explanations.s.body}
          clickable={false}
        />
      </div>

      <div className="compute-w-step__diagram">
        {/* Fan-in from û' (left column center, x=48) and ŝ (right column
            center, x=182 -- 96 + 64-gap + 22) converging into the single
            product path at x=115, matching compute-w-step__columns' 96
            (NttColumn width, set by the NTT box) + 64 (gap) + 44 (bare
            CompactVector) = 204 total width. */}
        <svg
          className="compute-w-step__svg"
          viewBox="0 0 204 48"
          width="204"
          height="48"
          style={{ overflow: 'visible' }}
          aria-hidden="true"
        >
          <path d="M 48 0 V 19 Q 48 24 53 24 H 115" fill="none" stroke="var(--color-transform)" strokeWidth="3" />
          <path d="M 182 0 V 19 Q 182 24 177 24 H 115" fill="none" stroke="var(--color-transform)" strokeWidth="3" />
          <line x1="115" y1="24" x2="115" y2="48" stroke="var(--color-transform)" strokeWidth="3" />
        </svg>

        <span className="compute-w-step__op body-text">×</span>

        <div className="compute-w-step__vline" />

        <TransformBox name="NTT⁻¹" explanationKey="NTT_inverse" />

        <div className="compute-w-step__vline" />

        <div className="compute-w-step__equation">
          <CompactSingleField
            symbol="v'"
            colorToken="ciphertext-v"
            coeffs={data.decaps.v_decoded.coeffs}
            body={explanations.vPrime.body}
            clickable={false}
          />

          <span className="compute-w-step__op body-text">−</span>

          <CompactSingleField
            symbol="ŝᵀu'"
            colorToken="inactive"
            coeffs={sTuCoeffs}
            body={explanations.sTuPrime.body}
            clickable={false}
          />

          <span className="compute-w-step__op body-text">=</span>

          <CompactSingleField
            symbol="w"
            colorToken="recovered-w"
            coeffs={data.decaps.w.coeffs}
            body={explanations.w.body}
            clickable={false}
          />
        </div>
      </div>
    </div>
  )
}

export default ComputeWStep
