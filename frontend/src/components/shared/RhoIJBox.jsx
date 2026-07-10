import './RhoIJBox.css'

function RhoIJBox({ i, j, isActive = false }) {
  return (
    <div className={`rho-ij-box${isActive ? ' rho-ij-box--active' : ''}`}>
      <span className="rho-ij-box__text">ρ ‖ {i} ‖ {j}</span>
    </div>
  )
}

export default RhoIJBox
