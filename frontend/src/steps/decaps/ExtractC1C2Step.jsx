import { useLayoutEffect, useRef, useState } from 'react'
import Node from '../../components/shared/diagram-boxes/Node.jsx'
import Popup from '../../components/shared/popup/Popup.jsx'
import { explanations } from '../../data/explanations.js'
import { truncateHex } from '../../utils/hex.js'
import data from '../../data/mlkem_768_data.json'
import './ExtractC1C2Step.css'

function bytes(hex) {
  return hex.length / 2
}

// c1/c2 here are mathematically identical to Encaps' c1/c2 -- Alice is
// splitting the exact same ciphertext Bob packed, so reuse those values
// directly instead of inventing new ones.
const ITEMS = [
  { key: 'c1', label: 'c1', range: '[0 : 32duk]B', hex: data.encaps.c1, explanation: explanations.c1 },
  { key: 'c2', label: 'c2', range: '[32duk : 32(duk+dv)]B', hex: data.encaps.c2, explanation: explanations.c2 },
]

// One curve from the drop point (dropX) out to a lane centered at laneX --
// same shape ExtractDataStep's branchPath() uses, just with two lanes
// instead of four.
function branchPath(dropX, laneX) {
  const corner = laneX < dropX ? laneX + 5 : laneX - 5
  return `M ${dropX} 24 H ${corner} Q ${laneX} 24 ${laneX} 29 V 48`
}

// Same shape/pattern as ExtractDataStep (single input branching into
// labeled outputs, connector positions measured off the actual rendered
// boxes rather than assumed from fixed pixel lanes), just two lanes.
function ExtractC1C2Step() {
  const [openKey, setOpenKey] = useState(null)
  const rowRef = useRef(null)
  const laneRefs = useRef([])
  const [geometry, setGeometry] = useState(null)

  useLayoutEffect(() => {
    // c1 and c2's captions are very different lengths, so their natural
    // (unequal) box widths would pull the branch lines to unequal lengths.
    // Force both lanes to the same width first so their centers -- and so
    // the branches -- come out symmetric, same as if both boxes were equal
    // width to begin with.
    const laneWidths = laneRefs.current.map(el => el.getBoundingClientRect().width)
    const maxWidth = Math.max(...laneWidths)
    laneRefs.current.forEach(el => { el.style.width = `${maxWidth}px` })

    const rowRect = rowRef.current.getBoundingClientRect()
    const centers = laneRefs.current.map(el => {
      const r = el.getBoundingClientRect()
      return r.left - rowRect.left + r.width / 2
    })
    setGeometry({ width: rowRect.width, centers })
  }, [])

  const active = ITEMS.find(item => item.key === openKey)

  return (
    <div className="extract-c1-c2-step">
      <Node label="c" microLabel="(32(duk+dv))B" />

      <svg
        className="extract-c1-c2-step__svg"
        width={geometry?.width ?? 0}
        height="48"
        style={{ overflow: 'visible', visibility: geometry ? 'visible' : 'hidden' }}
        aria-hidden="true"
      >
        {geometry && (
          <>
            <line
              x1={geometry.width / 2} y1="0" x2={geometry.width / 2} y2="24"
              stroke="var(--color-transform)" strokeWidth="3"
            />
            {geometry.centers.map((cx, i) => (
              <path
                key={ITEMS[i].key}
                d={branchPath(geometry.width / 2, cx)}
                fill="none"
                stroke="var(--color-transform)"
                strokeWidth="3"
              />
            ))}
          </>
        )}
      </svg>

      <div className="extract-c1-c2-step__row" ref={rowRef}>
        {ITEMS.map((item, i) => (
          <div key={item.key} className="extract-c1-c2-step__lane" ref={el => (laneRefs.current[i] = el)}>
            <Node label={item.label} microLabel={item.range} onClick={() => setOpenKey(item.key)} />
          </div>
        ))}
      </div>

      {active && (
        <Popup
          title={active.explanation.title}
          body={active.explanation.body}
          value={truncateHex(active.hex)}
          valueLabel={`${bytes(active.hex)} bytes`}
          isOpen
          onClose={() => setOpenKey(null)}
        />
      )}
    </div>
  )
}

export default ExtractC1C2Step
