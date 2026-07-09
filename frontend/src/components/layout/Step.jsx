import './Step.css'

function Step({ label, state = 'pending', hasConnector = false, onClick }) {
  return (
    <div className={`step step--${state}`}>
      <div className={`step__row${onClick ? ' step__row--clickable' : ''}`} onClick={onClick}>
        <div className="step__dot">
        </div>
        <span className="body-text step__label">{label}</span>
      </div>
      {hasConnector && <div className="step__connector" />}
    </div>
  )
}

export default Step
