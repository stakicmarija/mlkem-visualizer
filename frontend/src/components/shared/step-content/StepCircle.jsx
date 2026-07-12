import './StepCircle.css'

function StepCircle({ title, isActive }) {
  return (
    <div className={`step-circle${isActive ? ' step-circle--active' : ''}`}>
      <span className="step-circle__title">{title}</span>
    </div>
  )
}

export default StepCircle
