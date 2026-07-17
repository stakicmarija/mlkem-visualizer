import Node from '../../components/shared/diagram-boxes/Node.jsx'
import TransformBox from '../../components/shared/diagram-boxes/TransformBox.jsx'
import ConcatBox from '../../components/shared/diagram-boxes/ConcatBox.jsx'
import './DeriveKprimeRprimeStep.css'

// Mirrors Encaps' DeriveKRStep (m/ek -> H -> concat -> G -> K/r), but
// simpler -- h is already available directly from Extract data, not
// computed via H() on this step, so both lanes drop straight into the
// concat box with no per-lane transform beforehand (same shape as
// KeyGen's DeriveRhoSigmaStep, which has the same two-plain-input pattern).
function DeriveKprimeRprimeStep() {
  return (
    <div className="derive-kprime-rprime">
      <div className="derive-kprime-rprime__row">
        <Node label="m'" />
        <Node label="h" />
      </div>

      <svg
        className="derive-kprime-rprime__svg"
        viewBox="0 0 240 48"
        width="240"
        height="48"
        style={{ overflow: 'visible' }}
        aria-hidden="true"
      >
        <path d="M 60 0 V 19 Q 60 24 65 24 H 120" fill="none" stroke="var(--color-transform)" strokeWidth="3" />
        <path d="M 180 0 V 19 Q 180 24 175 24 H 120" fill="none" stroke="var(--color-transform)" strokeWidth="3" />
        <line x1="120" y1="24" x2="120" y2="48" stroke="var(--color-transform)" strokeWidth="3" />
      </svg>

      <ConcatBox />

      <div className="derive-kprime-rprime__vline" />

      <TransformBox name="G" subtitle="SHA3-512" explanationKey="G" />

      <svg
        className="derive-kprime-rprime__svg"
        viewBox="0 0 240 48"
        width="240"
        height="48"
        style={{ overflow: 'visible' }}
        aria-hidden="true"
      >
        <line x1="120" y1="0" x2="120" y2="24" stroke="var(--color-transform)" strokeWidth="3" />
        <path d="M 120 24 H 65 Q 60 24 60 29 V 48" fill="none" stroke="var(--color-transform)" strokeWidth="3" />
        <path d="M 120 24 H 175 Q 180 24 180 29 V 48" fill="none" stroke="var(--color-transform)" strokeWidth="3" />
      </svg>

      <div className="derive-kprime-rprime__row">
        <Node label="K'" variant="leaf" />
        <Node label="r'" variant="leaf" />
      </div>
    </div>
  )
}

export default DeriveKprimeRprimeStep
