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

function Button({ variant = 'primary', icon = 'none', children, ...rest }) {
  return (
    <button type="button" className={`btn btn--${variant}`} {...rest}>
      {icon === 'prev' && <SkipPreviousIcon />}
      <span className="btn-text">{children}</span>
      {icon === 'next' && <SkipNextIcon />}
    </button>
  )
}

export default Button
