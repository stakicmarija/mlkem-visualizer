import './Layer.css'

function Layer({ label, level = 1, hasLine = true, state = 'pending' }) {
  return (
    <div className={`layer layer--level-${level}`}>
      {hasLine && <div className={`layer__line layer__line--${state}`} />}
      {label && <span className="label layer__label">{label}</span>}
    </div>
  )
}

export default Layer
