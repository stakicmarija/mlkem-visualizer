import { useState } from 'react'
import Node from './Node.jsx'
import TransformBox from './TransformBox.jsx'
import Popup from './Popup.jsx'
import CbdPopupBody from './CbdPopupBody.jsx'
import { explanations } from '../../data/explanations.js'
import './SampleVectorStep.css'

const SUB = ['₀', '₁', '₂']
const W = 240  // matches DeriveRhoSigmaStep row width; node centers at x=60 and x=180

function Idx({ children }) {
  return (
    <span style={{ fontFamily: 'var(--font-index)', fontSize: '9px', verticalAlign: 'baseline' }}>
      {children}
    </span>
  )
}

function formatCoeffsSigned(coeffs) {
  return coeffs.slice(0, 8).join(', ') + ', ...'
}

function VectorCell({ label, index, onClick }) {
  return (
    <button className="vector-cell" onClick={onClick}>
      <span className="vector-cell__label">
        <span className="vector-cell__symbol">{label}</span>
        <span className="vector-cell__index">{SUB[index]}</span>
      </span>
    </button>
  )
}

function SampleVectorStep({ label, colorToken, explanationKey, vectors, prfRawHexes }) {
  const [openIdx, setOpenIdx] = useState(null)
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

      {/* σ and N input nodes */}
      <div className="sample-vector-step__top-row">
        <Node label="σ" />
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
          <VectorCell key={i} label={label} index={i} onClick={() => setOpenIdx(i)} />
        ))}
      </div>

      <div className="sample-vector-step__vline" />

      <Node label="N = N + 1" />

      {openIdx !== null && (
        <Popup
          title={<>{label}<Idx>{SUB[openIdx]}</Idx></>}
          body={explanation.body}
          value={formatCoeffsSigned(vectors[openIdx].coeffs_signed)}
          valueLabel="coefficients (η₁ = 2, signed)"
          isOpen
          onClose={() => setOpenIdx(null)}
        />
      )}
    </div>
  )
}

export default SampleVectorStep
