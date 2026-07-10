import './Node.css'

function Node({ label, microLabel, variant = 'default' }) {
  return (
    <div className={`node node--${variant}`}>
      <span className="formula">{label}</span>
      {microLabel && (
        <span className="micro-label node__micro">{microLabel}</span>
      )}
    </div>
  )
}

export default Node
