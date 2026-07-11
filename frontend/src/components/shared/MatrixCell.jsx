import './MatrixCell.css'

function MatrixCell({ label, state = 'pending', colorToken = 'matrix-a', tinted = false, strong = false, onClick }) {
  const isClickable = state === 'done' && typeof onClick === 'function'
  const Tag = isClickable ? 'button' : 'div'

  const symbol = label?.[0] ?? ''
  const index  = label?.slice(1) ?? ''

  return (
    <Tag
      className={`matrix-cell matrix-cell--${state}${tinted ? ' matrix-cell--tinted' : ''}${strong ? ' matrix-cell--strong' : ''}`}
      style={{
        '--cell-color': `var(--color-${colorToken})`,
        '--cell-tint': `var(--color-${colorToken}-tint)`,
        '--cell-tint-strong': `var(--color-${colorToken}-tint-strong)`,
      }}
      onClick={isClickable ? onClick : undefined}
    >
      {state !== 'pending' && label && (
        <span className="matrix-cell__label">
          <span className="matrix-cell__symbol">{symbol}</span>
          <span className="matrix-cell__index">{index}</span>
        </span>
      )}
    </Tag>
  )
}

export default MatrixCell
