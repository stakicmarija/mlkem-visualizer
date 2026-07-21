import './RhoIJBox.css'

// i/j name the A[i,j] entry this seed feeds (row, column) — but per FIPS 203
// (A[i,j] <- SampleNTT(rho || j || i)), the seed bytes are concatenated j
// before i, so the displayed label is deliberately reversed from the props.
function RhoIJBox({ i, j, isActive = false }) {
  return (
    <div className={`rho-ij-box${isActive ? ' rho-ij-box--active' : ''}`}>
      <span className="rho-ij-box__text">ρ ‖ {j} ‖ {i}</span>
    </div>
  )
}

export default RhoIJBox
