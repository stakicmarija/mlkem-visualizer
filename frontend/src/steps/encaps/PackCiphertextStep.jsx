import { useState } from 'react'
import Node from '../../components/shared/diagram-boxes/Node.jsx'
import ConcatBox from '../../components/shared/diagram-boxes/ConcatBox.jsx'
import Popup from '../../components/shared/popup/Popup.jsx'
import { explanations } from '../../data/explanations.js'
import { truncateHex } from '../../utils/hex.js'
import data from '../../data/mlkem_768_data.json'
import './PackCiphertextStep.css'

// Same two-lane/ConcatBox shape as DeriveKRStep, simplified -- no branch
// row, since c1 and c2 arrive already-formed (no transform runs between
// the inputs and the concat here, unlike m/ek's H(ek) branch).
function PackCiphertextStep() {
  const [cOpen, setCOpen] = useState(false)

  return (
    <div className="pack-ciphertext-step">
      <div className="pack-ciphertext-step__row">
        <div className="pack-ciphertext-step__lane">
          <Node label="c1" />
        </div>
        <div className="pack-ciphertext-step__lane">
          <Node label="c2" />
        </div>
      </div>

      <div className="pack-ciphertext-step__row">
        <div className="pack-ciphertext-step__lane">
          <div className="pack-ciphertext-step__vline" />
        </div>
        <div className="pack-ciphertext-step__lane">
          <div className="pack-ciphertext-step__vline" />
        </div>
      </div>

      <svg
        className="pack-ciphertext-step__svg"
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

      <div className="pack-ciphertext-step__vline" />

      <Node label="c" variant="leaf" onClick={() => setCOpen(true)} />

      <Popup
        title="c"
        body={explanations.c.body}
        value={truncateHex(data.encaps.c)}
        isOpen={cOpen}
        onClose={() => setCOpen(false)}
      />
    </div>
  )
}

export default PackCiphertextStep
