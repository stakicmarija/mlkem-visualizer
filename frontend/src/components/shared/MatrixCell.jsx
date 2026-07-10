import './MatrixCell.css'

function MatrixCell({ label, state = 'pending', onClick }) {
  const isClickable = state === 'done' && typeof onClick === 'function'
  const Tag = isClickable ? 'button' : 'div'

  const symbol = label?.[0] ?? ''
  const index  = label?.slice(1) ?? ''

  return (
    <Tag
      className={`matrix-cell matrix-cell--${state}`}
      onClick={isClickable ? onClick : undefined}
    >
      {state !== 'pending' && (
        <span className="matrix-cell__label">
          <span className="matrix-cell__symbol">{symbol}</span>
          <span className="matrix-cell__index">{index}</span>
        </span>
      )}
    </Tag>
  )
}

export default MatrixCell
