import './Popup.css'

function CloseIcon() {
  return (
    <svg className="popup__close-icon" viewBox="0 0 14 14" aria-hidden="true">
      <path
        d="M13 1L1 13M1 1l12 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function Popup({ title, children, body, value, valueLabel, isOpen, onClose }) {
  if (!isOpen) return null

  const bodyContent = children ?? body

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-panel" onClick={e => e.stopPropagation()}>
        <div className="popup__header">
          <h2 className="formula popup__title">{title}</h2>
          <button className="popup__close" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>
        {bodyContent && (
          <p className="body-text popup__body">{bodyContent}</p>
        )}
        {value && (
          <div className="popup__value body-text">
            {valueLabel && <div className="popup__value-label">{valueLabel}</div>}
            <div>{value}</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Popup
