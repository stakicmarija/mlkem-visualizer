import { useState } from 'react'
import Node from '../../components/shared/diagram-boxes/Node.jsx'
import TransformBox from '../../components/shared/diagram-boxes/TransformBox.jsx'
import ConcatBox from '../../components/shared/diagram-boxes/ConcatBox.jsx'
import Popup from '../../components/shared/popup/Popup.jsx'
import { explanations } from '../../data/explanations.js'
import { toSpacedHex } from '../../utils/hex.js'
import data from '../../data/mlkem_768_data.json'
import './DeriveRhoSigmaStep.css'

const ITEMS = {
  d: { explanation: explanations.d, value: toSpacedHex(data.inputs.d) },
  rho: { explanation: explanations.rho, value: toSpacedHex(data.keygen.rho) },
  sigma: { explanation: explanations.sigma, value: toSpacedHex(data.keygen.sigma) },
}

function DeriveRhoSigmaStep() {
  const [openKey, setOpenKey] = useState(null)
  const active = openKey && ITEMS[openKey]

  return (
    <div className="derive-rho-sigma">
      <div className="derive-rho-sigma__row">
        <Node label="d" onClick={() => setOpenKey('d')} />
        <Node label="k" />
      </div>

      <svg
        className="derive-rho-sigma__svg"
        viewBox="0 0 240 48"
        width="240"
        height="48"
        style={{ overflow: 'visible' }}
        aria-hidden="true"
      >
        <path d="M 60 0 V 19 Q 60 24 65 24 H 120" fill="none" stroke="var(--color-transform)" strokeWidth="3" />
        <path d="M 180 0 V 19 Q 180 24 175 24 H 120" fill="none" stroke="var(--color-transform)" strokeWidth="3" />
        <line x1="120" y1="24" x2="120" y2="48" stroke="var(--color-transform)" strokeWidth="3" />
      </svg>

      <ConcatBox />

      <div className="derive-rho-sigma__vline" />

      <TransformBox name="G" subtitle="SHA3-512" explanationKey="G" />

      <svg
        className="derive-rho-sigma__svg"
        viewBox="0 0 240 48"
        width="240"
        height="48"
        style={{ overflow: 'visible' }}
        aria-hidden="true"
      >
        <line x1="120" y1="0" x2="120" y2="24" stroke="var(--color-transform)" strokeWidth="3" />
        <path d="M 120 24 H 65 Q 60 24 60 29 V 48" fill="none" stroke="var(--color-transform)" strokeWidth="3" />
        <path d="M 120 24 H 175 Q 180 24 180 29 V 48" fill="none" stroke="var(--color-transform)" strokeWidth="3" />
      </svg>

      <div className="derive-rho-sigma__row">
        <Node label="ρ" variant="leaf" onClick={() => setOpenKey('rho')} />
        <Node label="σ" variant="leaf" onClick={() => setOpenKey('sigma')} />
      </div>

      {active && (
        <Popup
          title={active.explanation.title}
          body={active.explanation.body}
          value={active.value}
          isOpen
          onClose={() => setOpenKey(null)}
        />
      )}
    </div>
  )
}

export default DeriveRhoSigmaStep
