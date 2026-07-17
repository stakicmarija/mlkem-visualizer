import Node from '../../components/shared/diagram-boxes/Node.jsx'
import TransformBox from '../../components/shared/diagram-boxes/TransformBox.jsx'
import ConcatBox from '../../components/shared/diagram-boxes/ConcatBox.jsx'
import './DeriveKtildeStep.css'

// Mirrors DeriveKprimeRprimeStep's fan-in half (z/c -> concat -> J), but
// J only produces one output here (the implicit-rejection fallback secret),
// so the branch after the transform box collapses to a single straight
// vline into one leaf node instead of a second fan-out.
function DeriveKtildeStep() {
  return (
    <div className="derive-ktilde">
      <div className="derive-ktilde__row">
        <Node label="z" />
        <Node label="c" />
      </div>

      <svg
        className="derive-ktilde__svg"
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

      <div className="derive-ktilde__vline" />

      <TransformBox name="J" explanationKey="J" />

      <div className="derive-ktilde__vline" />

      <Node label="K̃" variant="leaf" />
    </div>
  )
}

export default DeriveKtildeStep
