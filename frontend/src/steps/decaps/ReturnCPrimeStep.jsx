import { useState } from 'react'
import InputCard from '../../components/shared/diagram-boxes/InputCard.jsx'
import Popup from '../../components/shared/popup/Popup.jsx'
import { explanations } from '../../data/explanations.js'
import { toSpacedHex, truncateHex } from '../../utils/hex.js'
import data from '../../data/mlkem_768_data.json'
import './ReturnCPrimeStep.css'

function bytes(hex) {
  return hex.length / 2
}

// Mirrors ReturnEncapsStep/ReturnKeysStep's InputCard + note pattern, just
// one card instead of two.
function ReturnCPrimeStep() {
  const [open, setOpen] = useState(false)

  return (
    <div className="return-cprime-step">
      <InputCard
        symbol="c'"
        truncatedHex={truncateHex(data.decaps.c_prime)}
        caption={`${bytes(data.decaps.c_prime)} bytes`}
        onClick={() => setOpen(true)}
      />

      <p className="body-text return-cprime-step__note">
        Repeats encapsulation encryption process, using K′, r′, and m′ instead of the originals, to produce c′.
      </p>

      {open && (
        <Popup
          title={explanations.cPrime.title}
          body={explanations.cPrime.body}
          value={toSpacedHex(data.decaps.c_prime)}
          valueLabel={`${bytes(data.decaps.c_prime)} bytes`}
          isOpen
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  )
}

export default ReturnCPrimeStep
