import './MatrixCell.css'

function MatrixCell({ label, state = 'pending', colorToken = 'matrix-a', tinted = false, strong = false, symbolOnly = false, onClick }) {
  const isClickable = state === 'done' && typeof onClick === 'function'

  // symbolOnly: label is an atomic symbol (e.g. "e1", "Aᵀy") shown whole,
  // not split into a base symbol + subscript position index like "A₀₀".
  const symbol = symbolOnly ? (label ?? '') : (label?.[0] ?? '')
  const index  = symbolOnly ? '' : (label?.slice(1) ?? '')

  return (
    <button
      type="button"
      className={`matrix-cell matrix-cell--${state}${tinted ? ' matrix-cell--tinted' : ''}${strong ? ' matrix-cell--strong' : ''}`}
      style={{
        '--cell-color': `var(--color-${colorToken})`,
        '--cell-tint': `var(--color-${colorToken}-tint)`,
        '--cell-tint-strong': `var(--color-${colorToken}-tint-strong)`,
      }}
      disabled={!isClickable}
      onClick={isClickable ? onClick : undefined}
    >
      {state !== 'pending' && label && (
        <span className="matrix-cell__label">
          <span className="matrix-cell__symbol">{symbol}</span>
          <span className="matrix-cell__index">{index}</span>
        </span>
      )}
    </button>
  )
}

export default MatrixCell
