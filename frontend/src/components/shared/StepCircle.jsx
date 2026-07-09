import './StepCircle.css'

function StepCircle({ title, isActive }) {
  return (
    <div className={`step-circle${isActive ? ' step-circle--active' : ''}`}>
      <span className="th2">{title}</span>
    </div>
  )
}

export default StepCircle
