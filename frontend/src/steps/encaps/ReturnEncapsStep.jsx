import { useState } from 'react'
import InputCard from '../../components/shared/diagram-boxes/InputCard.jsx'
import Popup from '../../components/shared/popup/Popup.jsx'
import { explanations } from '../../data/explanations.js'
import { toSpacedHex, truncateHex } from '../../utils/hex.js'
import data from '../../data/mlkem_768_data.json'
import './ReturnEncapsStep.css'

function bytes(hex) {
  return hex.length / 2
}

const VALUES = [
  { key: 'K', hex: data.encaps.K, explanation: explanations.K },
  { key: 'c', hex: data.encaps.c, explanation: explanations.c },
]

function ReturnEncapsStep() {
  const [openIndex, setOpenIndex] = useState(null)
  const active = openIndex !== null ? VALUES[openIndex] : null

  return (
    <div className="return-encaps-step">
      {VALUES.map((v, i) => (
        <InputCard
          key={v.key}
          symbol={v.key}
          truncatedHex={truncateHex(v.hex)}
          caption={`${bytes(v.hex)} bytes`}
          onClick={() => setOpenIndex(i)}
        />
      ))}

      <p className="body-text return-encaps-step__note">
        Encapsulation is complete. Bob sends c to Alice and keeps K as the shared secret.
        He'll use K to derive a symmetric key with her.
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

export default ReturnEncapsStep
