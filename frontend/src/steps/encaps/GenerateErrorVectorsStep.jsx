import { useState } from 'react'
import Node from '../../components/shared/diagram-boxes/Node.jsx'
import TransformBox from '../../components/shared/diagram-boxes/TransformBox.jsx'
import VectorCell from '../../components/shared/diagram-boxes/VectorCell.jsx'
import Popup from '../../components/shared/popup/Popup.jsx'
import CbdPopupBody from '../../components/shared/popup/CbdPopupBody.jsx'
import { explanations } from '../../data/explanations.js'
import { formatPolynomialPreview } from '../../utils/polynomial.js'
import { useCellPopup } from '../../utils/useCellPopup.js'
import data from '../../data/mlkem_768_data.json'
import './GenerateErrorVectorsStep.css'

const SUB = ['₀', '₁', '₂']

// Same PRF -> B -> SamplePolyCBD chain as SampleVectorStep (structurally
// identical through the e1 vector row + N=N+1 loop), reused for a second
// output: e2, one extra SamplePolyCBD call after the loop, a single
// polynomial rather than a vector position -- drawn as a branch peeling off
// to the side rather than continuing the main column, and with no loop-back
// of its own since the formula never increments N again after it.
function GenerateErrorVectorsStep() {
  const e1Popup = useCellPopup(data.encaps.e1.length)
  const [e2Open, setE2Open] = useState(false)

  const cbdPopup = (
    <CbdPopupBody
      prfRawHex={data.encaps.e1_prf_raw[0]}
      coeffsSigned={data.encaps.e1[0].coeffs_signed}
    />
  )

  return (
    <div
      className="generate-error-vectors-step"
      style={{
        '--vector-color': 'var(--color-noise-e)',
        '--vector-tint': 'var(--color-noise-e-tint)',
      }}
    >
      {/* Loop: drawn from N=N+1 → right → up → N so markerEnd arrow points at N */}
      <svg className="generate-error-vectors-step__loop" aria-hidden="true" style={{ overflow: 'visible' }}>
        <defs>
          <marker
            id="generate-error-vectors-loop-arrow"
            markerWidth="14"
            markerHeight="10"
            refX="0"
            refY="5"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <polygon points="0 0, 14 5, 0 10" fill="var(--color-transform)" />
          </marker>
        </defs>
        <path
          d="M 76 449 H 254 Q 259 449 259 444 V 29 Q 259 24 254 24 H 219"
          fill="none"
          stroke="var(--color-transform)"
          strokeWidth="3"
          markerEnd="url(#generate-error-vectors-loop-arrow)"
        />
      </svg>

      {/* Branch: peels off from SamplePolyCBD's output, right, to e2 */}
      <svg className="generate-error-vectors-step__branch" aria-hidden="true" style={{ overflow: 'visible' }}>
        <path
          d="M 120 0 V 5 Q 120 10 125 10 H 217 Q 222 10 222 15 V 20"
          fill="none"
          stroke="var(--color-transform)"
          strokeWidth="3"
        />
      </svg>

      {/* r and N input nodes */}
      <div className="generate-error-vectors-step__top-row">
        <Node label="r" />
        <Node label="N" />
      </div>

      {/* Fan-in: r and N converge to center, then drop into PRF */}
      <svg viewBox="0 0 240 48" width="240" height="48" style={{ overflow: 'visible' }} aria-hidden="true">
        <path d="M 60 0 V 19 Q 60 24 65 24 H 120"  fill="none" stroke="var(--color-transform)" strokeWidth="3" />
        <path d="M 180 0 V 19 Q 180 24 175 24 H 120" fill="none" stroke="var(--color-transform)" strokeWidth="3" />
        <line x1="120" y1="24" x2="120" y2="48" stroke="var(--color-transform)" strokeWidth="3" />
      </svg>

      <TransformBox name="PRF" subtitle="SHAKE256" explanationKey="PRF" />

      <div className="generate-error-vectors-step__vline" />

      <Node label="B" microLabel="128B" />

      <div className="generate-error-vectors-step__vline" />

      <TransformBox name="SamplePolyCBD" explanationKey="SamplePolyCBD" popupChildren={cbdPopup} />

      {/* Angled connector: SamplePolyCBD's center down into the e1/N=N+1
          sub-column -- mirror image of the branch to e2 below, so both
          lines leaving SamplePolyCBD are the same length/shape. */}
      <svg className="generate-error-vectors-step__e1-connector" width="240" height="20" viewBox="0 0 240 20" aria-hidden="true" style={{ overflow: 'visible' }}>
        <path
          d="M 120 0 V 5 Q 120 10 115 10 H 23 Q 18 10 18 15 V 20"
          fill="none"
          stroke="var(--color-transform)"
          strokeWidth="3"
        />
      </svg>

      <div className="generate-error-vectors-step__e1-column">
        <div className="vector-row">
          {[0, 1, 2].map(i => (
            <VectorCell key={i} label="e1" index={i} onClick={() => e1Popup.open(i)} />
          ))}
        </div>

        <div className="generate-error-vectors-step__vline" />

        <Node label="N = N + 1" />
      </div>

      {/* e2: single polynomial, off the main column, in a distinct shade of
          the same orange family so it doesn't read as a fourth e1 cell */}
      <div
        className="generate-error-vectors-step__e2"
        style={{
          '--vector-color': 'var(--color-noise-e2)',
          '--vector-tint': 'var(--color-noise-e2-tint)',
        }}
      >
        <VectorCell label="e2" onClick={() => setE2Open(true)} />
      </div>

      {e1Popup.index !== null && (
        <Popup
          title={`e1${SUB[e1Popup.index]}`}
          body={explanations.e1.body}
          polynomialPreview={formatPolynomialPreview(`e1${SUB[e1Popup.index]}`, data.encaps.e1[e1Popup.index].coeffs_signed)}
          fullCoefficients={data.encaps.e1[e1Popup.index].coeffs_signed}
          onPrev={e1Popup.goPrev}
          onNext={e1Popup.goNext}
          hasPrev={e1Popup.hasPrev}
          hasNext={e1Popup.hasNext}
          isOpen
          onClose={e1Popup.close}
        />
      )}

      <Popup
        title="e2"
        body={explanations.e2.body}
        polynomialPreview={formatPolynomialPreview('e2', data.encaps.e2.coeffs_signed)}
        fullCoefficients={data.encaps.e2.coeffs_signed}
        isOpen={e2Open}
        onClose={() => setE2Open(false)}
      />
    </div>
  )
}

export default GenerateErrorVectorsStep
