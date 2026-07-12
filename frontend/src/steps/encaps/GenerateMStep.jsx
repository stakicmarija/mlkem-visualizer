import { useState } from 'react'
import InputCard from '../../components/shared/diagram-boxes/InputCard.jsx'
import Popup from '../../components/shared/popup/Popup.jsx'
import { explanations } from '../../data/explanations.js'
import { toSpacedHex, truncateHex } from '../../utils/hex.js'
import data from '../../data/mlkem_768_data.json'
import './GenerateMStep.css'

function GenerateMStep() {
  const [open, setOpen] = useState(false)

  return (
    <div className="generate-m-step">
      <InputCard
        symbol="m"
        truncatedHex={truncateHex(data.inputs.m)}
        onClick={() => setOpen(true)}
      />

      <Popup
        title={explanations.m.title}
        body={explanations.m.body}
        value={toSpacedHex(data.inputs.m)}
        isOpen={open}
        onClose={() => setOpen(false)}
      />
    </div>
  )
}

export default GenerateMStep
