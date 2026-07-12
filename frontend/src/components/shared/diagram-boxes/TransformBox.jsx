import { useState } from 'react'
import Popup from '../popup/Popup.jsx'
import { explanations } from '../../../data/explanations.js'
import './TransformBox.css'

function TransformBox({ name, subtitle, explanationKey, popupChildren }) {
  const [open, setOpen] = useState(false)
  const explanation = explanations[explanationKey]

  return (
    <>
      <button className="transform-box" onClick={() => setOpen(true)}>
        <span className="transform-box__name">{name}</span>
        {subtitle && (
          <span className="transform-box__subtitle">{subtitle}</span>
        )}
      </button>

      {open && (explanation || popupChildren) && (
        <Popup
          title={explanation?.title ?? name}
          body={popupChildren ? undefined : explanation?.body}
          isOpen
          onClose={() => setOpen(false)}
        >
          {popupChildren}
        </Popup>
      )}
    </>
  )
}

export default TransformBox
