import StepCircle from './step-content/StepCircle.jsx'
import Node from './diagram-boxes/Node.jsx'
import './ParticipantPanel.css'

function ParticipantPanel({ name, steps, activeStep, badge, footerBadge }) {
  return (
    <div className="participant-panel">
      <div className="participant-panel__header">
        <p className="th2 participant-panel__name">{name}</p>
        {badge && <Node label={badge} variant="leaf" />}
      </div>
      <div className="participant-panel__card">
        <div className="participant-panel__steps">
          {steps.map((step, i) => (
            <div key={i} className="participant-panel__step">
              <StepCircle title={step.title} isActive={step.title === activeStep} />
              <p className="micro-label participant-panel__desc">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
      {footerBadge && (
        <div className="participant-panel__footer-badge">
          <Node label={footerBadge} variant="leaf" />
        </div>
      )}
    </div>
  )
}

export default ParticipantPanel
