import Node from '../diagram-boxes/Node.jsx'
import TransformBox from '../diagram-boxes/TransformBox.jsx'
import VectorCell from '../diagram-boxes/VectorCell.jsx'
import Popup from '../popup/Popup.jsx'
import CbdPopupBody from '../popup/CbdPopupBody.jsx'
import { explanations } from '../../../data/explanations.js'
import { formatPolynomialPreview } from '../../../utils/polynomial.js'
import { useCellPopup } from '../../../utils/useCellPopup.js'
import './SampleVectorStep.css'

const SUB = ['₀', '₁', '₂']
const W = 240  // matches DeriveRhoSigmaStep row width; node centers at x=60 and x=180

function SampleVectorStep({ label, colorToken, explanationKey, vectors, prfRawHexes, seedLabel = 'σ' }) {
  const popup = useCellPopup(vectors.length)
  const explanation = explanations[explanationKey]

  const cbdPopup = (
    <CbdPopupBody
      prfRawHex={prfRawHexes[0]}
      coeffsSigned={vectors[0].coeffs_signed}
    />
  )

  // Unique marker ID per colorToken so concurrent instances on the same document don't collide
  const markerId = `sample-vector-arrow-${colorToken}`

  return (
    <div
      className="sample-vector-step"
      style={{
        '--vector-color': `var(--color-${colorToken})`,
        '--vector-tint': `var(--color-${colorToken}-tint)`,
      }}
    >
      {/* Loop: drawn from N=N+1 → right → up → N so markerEnd arrow points at N */}
      <svg className="sample-vector-step__loop" aria-hidden="true" style={{ overflow: 'visible' }}>
        <defs>
          <marker
            id={markerId}
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
          d="M 180 450 H 254 Q 259 450 259 445 V 29 Q 259 24 254 24 H 216"
          fill="none"
          stroke="var(--color-transform)"
          strokeWidth="3"
          markerEnd={`url(#${markerId})`}
        />
      </svg>

      {/* seed and N input nodes -- σ for KeyGen's s/e, r for Encaps' y */}
      <div className="sample-vector-step__top-row">
        <Node label={seedLabel} />
        <Node label="N" />
      </div>

      {/* Fan-in: σ and N converge to center, then drop into PRF */}
      <svg viewBox={`0 0 ${W} 48`} width={W} height="48" style={{ overflow: 'visible' }} aria-hidden="true">
        <path d="M 60 0 V 19 Q 60 24 65 24 H 120"  fill="none" stroke="var(--color-transform)" strokeWidth="3" />
        <path d="M 180 0 V 19 Q 180 24 175 24 H 120" fill="none" stroke="var(--color-transform)" strokeWidth="3" />
        <line x1="120" y1="24" x2="120" y2="48" stroke="var(--color-transform)" strokeWidth="3" />
      </svg>

      <TransformBox name="PRF" subtitle="SHAKE256" explanationKey="PRF" />

      <div className="sample-vector-step__vline" />

      <Node label="B" microLabel="128B" />

      <div className="sample-vector-step__vline" />

      <TransformBox name="SamplePolyCBD" explanationKey="SamplePolyCBD" popupChildren={cbdPopup} />

      <div className="sample-vector-step__vline" />

      <div className="vector-row">
        {[0, 1, 2].map(i => (
          <VectorCell key={i} label={label} index={i} onClick={() => popup.open(i)} />
        ))}
      </div>

      <div className="sample-vector-step__vline" />

      <Node label="N = N + 1" />

      {popup.index !== null && (
        <Popup
          title={`${label}${SUB[popup.index]}`}
          body={explanation.body}
          polynomialPreview={formatPolynomialPreview(`${label}${SUB[popup.index]}`, vectors[popup.index].coeffs_signed)}
          fullCoefficients={vectors[popup.index].coeffs_signed}
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

export default SampleVectorStep
