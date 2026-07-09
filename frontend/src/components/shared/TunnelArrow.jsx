import './TunnelArrow.css'

function Arrowhead({ direction }) {
  return (
    <svg className="tunnel-arrow__head" viewBox="0 0 8 14" aria-hidden="true">
      {direction === 'forward'
        ? <path fill="currentColor" d="M0 0l8 7-8 7Z" />
        : <path fill="currentColor" d="M8 0L0 7l8 7Z" />}
    </svg>
  )
}

function TunnelArrow({ label, detail, direction }) {
  return (
    <div className="tunnel-arrow">
      {direction === 'backward' && <Arrowhead direction="backward" />}
      <div className="tunnel-arrow__line" />
      <span className="tunnel-arrow__chip micro-label">
        <span className="tunnel-arrow__label">{label}</span>
        {detail && <span className="tunnel-arrow__detail">{detail}</span>}
      </span>
      <div className="tunnel-arrow__line" />
      {direction === 'forward' && <Arrowhead direction="forward" />}
    </div>
  )
}

export default TunnelArrow
