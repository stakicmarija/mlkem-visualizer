import Node from '../../components/shared/Node.jsx'
import TransformBox from '../../components/shared/TransformBox.jsx'
import './DeriveRhoSigmaStep.css'

function DeriveRhoSigmaStep() {
  return (
    <div className="derive-rho-sigma">
      <div className="derive-rho-sigma__row">
        <Node label="d" />
        <Node label="k" />
      </div>

      <svg
        className="derive-rho-sigma__svg"
        viewBox="0 0 240 75"
        width="240"
        height="75"
        style={{ overflow: 'visible' }}
        aria-hidden="true"
      >
        {/* d: down to crossbar, then right to center */}
        <path d="M 60 0 V 37.5 H 120" fill="none" stroke="var(--color-transform)" strokeWidth="3" />
        {/* k: down to crossbar, then left to center */}
        <path d="M 180 0 V 37.5 H 120" fill="none" stroke="var(--color-transform)" strokeWidth="3" />
        {/* center drop to ‖ */}
        <line x1="120" y1="37.5" x2="120" y2="75" stroke="var(--color-transform)" strokeWidth="3" />
      </svg>

      <div className="derive-rho-sigma__concat">||</div>

      <div className="derive-rho-sigma__vline" />

      <TransformBox name="G" subtitle="SHA3-512" explanationKey="G" />

      <svg
        className="derive-rho-sigma__svg"
        viewBox="0 0 240 75"
        width="240"
        height="75"
        style={{ overflow: 'visible' }}
        aria-hidden="true"
      >
        {/* center drop from G to crossbar */}
        <line x1="120" y1="0" x2="120" y2="37.5" stroke="var(--color-transform)" strokeWidth="3" />
        {/* crossbar left to ρ, then drop */}
        <path d="M 120 37.5 H 60 V 75" fill="none" stroke="var(--color-transform)" strokeWidth="3" />
        {/* crossbar right to σ, then drop */}
        <path d="M 120 37.5 H 180 V 75" fill="none" stroke="var(--color-transform)" strokeWidth="3" />
      </svg>

      <div className="derive-rho-sigma__row">
        <Node label="ρ" variant="leaf" />
        <Node label="σ" variant="leaf" />
      </div>
    </div>
  )
}

export default DeriveRhoSigmaStep
