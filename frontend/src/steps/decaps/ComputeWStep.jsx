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

const uPrimeNttCoeffsList = data.decaps.u_decoded_ntt.map(poly => poly.coeffs)

// Not interactive yet -- every cell in this diagram is click-disabled for
// now (popups come in a later pass).
function ComputeWStep() {
  return (
    <div className="compute-w-step">
      <div className="compute-w-step__top">
        {/* u' isn't already in NTT form the way y was for ComputeVStep -- it
            has to be transformed here first, unlike t̂ᵀy's ŷ which arrived
            pre-NTT'd from TransformNttStep. Standalone chain, separated from
            the ŝ × û' merge group below -- squeezing all three (u', ŝ, and
            the merge) into one row read too cramped, so û' repeats as its
            own static block in that group instead, same color/strong tint
            as it has right here so it's clearly the same value both places. */}
        <NttColumn
          symbol="u'"
          hatSymbol="û'"
          colorToken="ciphertext-u-prime"
          coeffsList={data.decaps.u_decoded.map(poly => poly.coeffs)}
          nttCoeffsList={uPrimeNttCoeffsList}
          body={explanations.uPrime.body}
          clickable={false}
        />

        <div className="compute-w-step__merge-group">
          <div className="compute-w-step__pair">
            <NttColumn
              showTransform={false}
              symbol="û'"
              colorToken="ciphertext-u-prime"
              coeffsList={uPrimeNttCoeffsList}
              body={explanations.uPrime.body}
              strong
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

          {/* Fan-in from û' (left center, x=22) and ŝ (right center, x=130 --
              108 + 22) converging at x=76, matching the pair's 44 (bare
              CompactVector) + 64 (gap) + 44 = 152 total width. */}
          <svg
            className="compute-w-step__svg"
            viewBox="0 0 152 48"
            width="152"
            height="48"
            style={{ overflow: 'visible' }}
            aria-hidden="true"
          >
            <path d="M 22 0 V 19 Q 22 24 27 24 H 76" fill="none" stroke="var(--color-transform)" strokeWidth="3" />
            <path d="M 130 0 V 19 Q 130 24 125 24 H 76" fill="none" stroke="var(--color-transform)" strokeWidth="3" />
            <line x1="76" y1="24" x2="76" y2="48" stroke="var(--color-transform)" strokeWidth="3" />
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
    </div>
  )
}

export default ComputeWStep
