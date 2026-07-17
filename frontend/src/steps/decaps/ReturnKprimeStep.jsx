import { useState } from 'react'
import InputCard from '../../components/shared/diagram-boxes/InputCard.jsx'
import Popup from '../../components/shared/popup/Popup.jsx'
import { explanations } from '../../data/explanations.js'
import { toSpacedHex, truncateHex } from '../../utils/hex.js'
import data from '../../data/mlkem_768_data.json'
import './ReturnKprimeStep.css'

function bytes(hex) {
  return hex.length / 2
}

// Mirrors ReturnCPrimeStep/ReturnEncapsStep/ReturnKeysStep's InputCard +
// Popup pattern, one card for the final shared secret.
function ReturnKprimeStep() {
  const [open, setOpen] = useState(false)

  return (
    <div className="return-kprime-step">
      <InputCard
        symbol="K'"
        truncatedHex={truncateHex(data.decaps.K_final)}
        caption={`${bytes(data.decaps.K_final)} bytes`}
        onClick={() => setOpen(true)}
      />

      <p className="body-text return-kprime-step__note">
        Decapsulation is complete. Since c matched c', Alice returns K' - the same shared secret
        Bob derived.
      </p>

      {open && (
        <Popup
          title={explanations.KFinal.title}
          body={explanations.KFinal.body}
          value={toSpacedHex(data.decaps.K_final)}
          valueLabel={`${bytes(data.decaps.K_final)} bytes`}
          isOpen
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  )
}

export default ReturnKprimeStep
