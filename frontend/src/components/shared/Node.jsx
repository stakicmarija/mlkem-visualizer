import './Node.css'

function Node({ label, microLabel, variant = 'default', onClick }) {
  const Tag = onClick ? 'button' : 'div'

  return (
    <Tag className={`node node--${variant}`} onClick={onClick}>
      <span className="formula">{label}</span>
      {microLabel && (
        <span className="micro-label node__micro">{microLabel}</span>
      )}
    </Tag>
  )
}

export default Node
