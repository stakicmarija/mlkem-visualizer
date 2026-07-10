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

function Popup({ title, children, body, value, valueLabel, items, isOpen, onClose }) {
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
        {items ? (
          <div className="popup__items">
            {items.map(({ label, body: itemBody }, i) => (
              <div key={i} className="popup__item">
                <p className="label popup__item-label">{label}</p>
                <p className="body-text popup__item-body">{itemBody}</p>
              </div>
            ))}
          </div>
        ) : (
          <>
            {bodyContent && (
              <p className="body-text popup__body">{bodyContent}</p>
            )}
            {value && (
              <div className="popup__value body-text">
                {valueLabel && <div className="popup__value-label">{valueLabel}</div>}
                <div>{value}</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Popup
