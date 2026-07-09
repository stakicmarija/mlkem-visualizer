import StepCircle from './StepCircle.jsx'
import './ParticipantPanel.css'

function ParticipantPanel({ name, steps }) {
  return (
    <div className="participant-panel">
      <p className="th2 participant-panel__name">{name}</p>
      <div className="participant-panel__card">
        <div className="participant-panel__steps">
          {steps.map((step, i) => (
            <div key={i} className="participant-panel__step">
              <StepCircle title={step.title} isActive={false} />
              <p className="micro-label participant-panel__desc">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ParticipantPanel
