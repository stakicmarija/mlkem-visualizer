import './Button.css'

// Material Symbol icons matching the Figma component set. currentColor lets
// them inherit the button's text color for free.
function SkipNextIcon() {
  return (
    <svg className="btn__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
    </svg>
  )
}

function SkipPreviousIcon() {
  return (
    <svg className="btn__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
    </svg>
  )
}

function ReplayIcon() {
  return (
    <svg className="btn__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
    </svg>
  )
}

function Button({ variant = 'primary', icon = 'none', children, ...rest }) {
  return (
    <button type="button" className={`btn btn--${variant}`} {...rest}>
      {icon === 'prev' && <SkipPreviousIcon />}
      {icon === 'restart' && <ReplayIcon />}
      <span className="btn-text">{children}</span>
      {icon === 'next' && <SkipNextIcon />}
    </button>
  )
}

export default Button
