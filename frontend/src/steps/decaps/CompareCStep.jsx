import { useState } from 'react'
import Node from '../../components/shared/diagram-boxes/Node.jsx'
import InputCard from '../../components/shared/diagram-boxes/InputCard.jsx'
import CompareBox from '../../components/shared/diagram-boxes/CompareBox.jsx'
import Popup from '../../components/shared/popup/Popup.jsx'
import { explanations } from '../../data/explanations.js'
import { toSpacedHex, truncateHex } from '../../utils/hex.js'
import data from '../../data/mlkem_768_data.json'
import './CompareCStep.css'

function bytes(hex) {
  return hex.length / 2
}

function CheckIcon() {
  return (
    <svg className="compare-c-step__result-icon" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10.5l4 4 8-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg className="compare-c-step__result-icon" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

const VALUES = [
  { key: 'c', hex: data.encaps.c, explanation: explanations.c },
  { key: "c'", hex: data.decaps.c_prime, explanation: explanations.cPrime },
]

// c and c' fan into a shared CompareBox the same way two inputs fan into a
// ConcatBox elsewhere (e.g. DeriveKtildeStep) -- same curved-connector
// pattern, just a comparison instead of a concatenation. `data.decaps.match`
// (a real bool, not hardcoded) drives which result badge renders below.
function CompareCStep() {
  const [openIndex, setOpenIndex] = useState(null)
  const active = openIndex !== null ? VALUES[openIndex] : null
  const isMatch = data.decaps.match

  return (
    <div className="compare-c-step">
      <div className="compare-c-step__row">
        {VALUES.map((v, i) => (
          <InputCard
            key={v.key}
            symbol={v.key}
            truncatedHex={truncateHex(v.hex)}
            caption={`${bytes(v.hex)} bytes`}
            onClick={() => setOpenIndex(i)}
          />
        ))}
      </div>

      {/* Fan-in from c (left center, x=114) and c' (right center, x=382 --
          228 + 40-gap + 114) converging at x=248, matching the row's
          228 (InputCard width) + 40 (gap) + 228 = 496 total width. */}
      <svg
        className="compare-c-step__svg"
        viewBox="0 0 496 48"
        width="496"
        height="48"
        style={{ overflow: 'visible' }}
        aria-hidden="true"
      >
        <path d="M 114 0 V 19 Q 114 24 119 24 H 248" fill="none" stroke="var(--color-transform)" strokeWidth="3" />
        <path d="M 382 0 V 19 Q 382 24 377 24 H 248" fill="none" stroke="var(--color-transform)" strokeWidth="3" />
        <line x1="248" y1="24" x2="248" y2="48" stroke="var(--color-transform)" strokeWidth="3" />
      </svg>

      <CompareBox />

      <div className="compare-c-step__vline" />

      <Node
        label={isMatch ? <CheckIcon /> : <XIcon />}
        microLabel={isMatch ? 'MATCH' : 'MISMATCH'}
        variant="leaf"
        className={isMatch ? 'compare-c-step__result' : 'compare-c-step__result compare-c-step__result--mismatch'}
      />

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

export default CompareCStep
