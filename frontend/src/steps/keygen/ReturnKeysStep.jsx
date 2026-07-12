import { useState } from 'react'
import InputCard from '../../components/shared/InputCard.jsx'
import Popup from '../../components/shared/Popup.jsx'
import { explanations } from '../../data/explanations.js'
import { toSpacedHex, truncateHex } from '../../utils/hex.js'
import data from '../../data/mlkem_768_data.json'
import './ReturnKeysStep.css'

function bytes(hex) {
  return hex.length / 2
}

const KEYS = [
  { key: 'ek', hex: data.keygen.ek, explanation: explanations.ek },
  { key: 'dk', hex: data.keygen.dk, explanation: explanations.dk },
]

function ReturnKeysStep() {
  const [openIndex, setOpenIndex] = useState(null)
  const active = openIndex !== null ? KEYS[openIndex] : null

  return (
    <div className="return-keys-step">
      {KEYS.map((k, i) => (
        <InputCard
          key={k.key}
          symbol={k.key}
          truncatedHex={truncateHex(k.hex)}
          caption={`${bytes(k.hex)} bytes`}
          onClick={() => setOpenIndex(i)}
        />
      ))}

      <p className="body-text return-keys-step__note">
        Key generation is complete. Alice sends ek to Bob, and keeps dk private. This is what
        she'll use to decapsulate the shared secret later.
      </p>

      {active && (
        <Popup
          title={active.explanation.title}
          body={active.explanation.body}
          value={toSpacedHex(active.hex)}
          valueLabel={`${bytes(active.hex)} bytes`}
          isOpen
          onClose={() => setOpenIndex(null)}
        />
      )}
    </div>
  )
}

export default ReturnKeysStep
