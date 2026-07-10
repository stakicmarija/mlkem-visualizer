import { useState } from 'react'
import InputCard from '../../components/shared/InputCard.jsx'
import Popup from '../../components/shared/Popup.jsx'
import { explanations } from '../../data/explanations.js'
import data from '../../data/mlkem_768_data.json'
import './CheckInputsStep.css'

function toSpacedHex(hex) {
  return (hex.match(/.{2}/g) || []).join(' ')
}

function truncateHex(hex) {
  const bytes = hex.match(/.{2}/g) || []
  return `${bytes.slice(0, 6).join(' ')} ... ${bytes[bytes.length - 1]}`
}

const SEEDS = [
  { key: 'd', hex: data.inputs.d, explanation: explanations.d },
  { key: 'z', hex: data.inputs.z, explanation: explanations.z },
]

function CheckInputsStep() {
  const [openIndex, setOpenIndex] = useState(null)
  const active = openIndex !== null ? SEEDS[openIndex] : null

  return (
    <div className="check-inputs-step">
      {SEEDS.map((seed, i) => (
        <InputCard
          key={seed.key}
          symbol={seed.key}
          truncatedHex={truncateHex(seed.hex)}
          onClick={() => setOpenIndex(i)}
        />
      ))}

      {active && (
        <Popup
          title={active.explanation.title}
          body={active.explanation.body}
          value={toSpacedHex(active.hex)}
          isOpen
          onClose={() => setOpenIndex(null)}
        />
      )}
    </div>
  )
}

export default CheckInputsStep
