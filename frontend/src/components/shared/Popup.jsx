import { useState } from 'react'
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

function Popup({
  title,
  children,
  body,
  value,
  valueLabel,
  items,
  polynomialPreview,
  fullCoefficients,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  isOpen,
  onClose,
}) {
  const [expanded, setExpanded] = useState(false)

  // Cell navigation swaps title/content in place (no close/reopen), so the
  // "expand" state has to reset itself whenever the displayed cell changes.
  // Adjusted during render (not an effect) per React's guidance for state
  // that depends on a prop change: https://react.dev/learn/you-might-not-need-an-effect
  const [prevPreview, setPrevPreview] = useState(polynomialPreview)
  if (polynomialPreview !== prevPreview) {
    setPrevPreview(polynomialPreview)
    setExpanded(false)
  }

  if (!isOpen) return null

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-panel" onClick={e => e.stopPropagation()}>
        <div className="popup__header">
          {onPrev && (
            <button
              className="popup__nav"
              onClick={onPrev}
              disabled={!hasPrev}
              aria-label="Previous cell"
            >
              ‹
            </button>
          )}
          <h2 className="formula popup__title">{title}</h2>
          {onNext && (
            <button
              className="popup__nav"
              onClick={onNext}
              disabled={!hasNext}
              aria-label="Next cell"
            >
              ›
            </button>
          )}
          <button className="popup__close" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>
        <div className="popup__content">
          {children}
          {body && (
            <p className="body-text popup__body">{body}</p>
          )}
          {items ? (
            <div className="popup__items">
              {items.map(({ label, body: itemBody }, i) => (
                <div key={i} className="popup__item">
                  <p className="label popup__item-label">{label}</p>
                  <p className="body-text popup__item-body">{itemBody}</p>
                </div>
              ))}
            </div>
          ) : polynomialPreview ? (
            <>
              <div className="popup__value body-text">
                <div>{polynomialPreview}</div>
              </div>
              {fullCoefficients && (
                expanded ? (
                  <div className="popup__value body-text">
                    <div>{fullCoefficients.join(', ')}</div>
                  </div>
                ) : (
                  <button className="micro-label popup__expand" onClick={() => setExpanded(true)}>
                    Click to see all {fullCoefficients.length} coefficients
                  </button>
                )
              )}
            </>
          ) : (
            value && (
              <div className="popup__value body-text">
                {valueLabel && <div className="popup__value-label">{valueLabel}</div>}
                <div>{value}</div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default Popup
