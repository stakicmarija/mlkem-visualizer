import RhoIJBox from './RhoIJBox.jsx'
import './RhoIJColumn.css'

function RhoIJColumn({ i, activeJ = null }) {
  return (
    <div className="rho-ij-column">
      {[0, 1, 2].map(j => (
        <div key={j} className="rho-ij-column__item">
          <RhoIJBox i={i} j={j} isActive={activeJ === j} />
        </div>
      ))}
    </div>
  )
}

export default RhoIJColumn
