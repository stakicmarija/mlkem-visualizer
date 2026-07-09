import { useState } from 'react'
import Popup from '../shared/Popup.jsx'
import './ParamsPanel.css'

function InfoIcon() {
  return <span className="params-panel__info-icon" aria-hidden="true">i</span>
}

function ParamsPanel({ parameters = [], inputs = [], outputs = [], onLearnMoreClick }) {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <div className="params-panel">

      {/* PARAMETERS */}
      <div className="params-panel__section params-panel__section--divided">
        <p className="label params-panel__title">Parameters</p>
        <div className="params-panel__body">
          {parameters.length === 0 ? (
            <p className="body-text params-panel__empty">
              No algorithm parameters<br />used in this step.
            </p>
          ) : (
            parameters.map(({ label, value }) => (
              <p key={label} className="body-text params-panel__param">{label} = {value}</p>
            ))
          )}
          <button className="params-panel__learn-btn" onClick={onLearnMoreClick}>
            <InfoIcon />
            <span className="micro-label params-panel__learn-text">Learn about parameters</span>
          </button>
        </div>
      </div>

      {/* INPUT */}
      {inputs.length > 0 && (
        <div className="params-panel__section params-panel__section--divided">
          <p className="label params-panel__title">Input</p>
          <div className="params-panel__body">
            {inputs.map(({ label }, i) => (
              <button
                key={i}
                className="params-panel__input-row"
                onClick={() => setOpenIndex(i)}
              >
                <span className="body-text">{label}</span>
                <span className="params-panel__chevron" aria-hidden="true">›</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* OUTPUT */}
      {outputs.length > 0 && (
        <div className="params-panel__section">
          <p className="label params-panel__title">Output</p>
          <div className="params-panel__body">
            {outputs.map((text, i) => (
              <p key={i} className="body-text params-panel__output">{text}</p>
            ))}
          </div>
        </div>
      )}

      {openIndex !== null && (
        <Popup
          title={inputs[openIndex].label}
          value={inputs[openIndex].value}
          isOpen
          onClose={() => setOpenIndex(null)}
        />
      )}
    </div>
  )
}

export default ParamsPanel
