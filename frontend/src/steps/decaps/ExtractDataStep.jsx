import { useLayoutEffect, useRef, useState } from 'react'
import Node from '../../components/shared/diagram-boxes/Node.jsx'
import Popup from '../../components/shared/popup/Popup.jsx'
import { explanations } from '../../data/explanations.js'
import { toSpacedHex, truncateHex } from '../../utils/hex.js'
import data from '../../data/mlkem_768_data.json'
import './ExtractDataStep.css'

function bytes(hex) {
  return hex.length / 2
}

// dk splits into four byte-range slices -- already computed in the data
// file (data.decaps.*), not sliced from data.keygen.dk client-side.
const ITEMS = [
  { key: 'dkPKE', label: <>dk<sub>pke</sub></>, range: '[0 : 384k]B', hex: data.decaps.dk_pke, explanation: explanations.dkPKE },
  { key: 'ekPKE', label: <>ek<sub>pke</sub></>, range: '[384k : 768k + 32]B', hex: data.decaps.ek_pke, explanation: explanations.ekPKE },
  { key: 'h', label: 'h', range: '[768k + 32 : 768k + 64]B', hex: data.decaps.h, explanation: explanations.h },
  { key: 'z', label: 'z', range: '[768k + 64 : 768k + 96]B', hex: data.decaps.z, explanation: explanations.z },
]

// One curve from the drop point (dropX) out to a lane centered at laneX,
// same rounded-corner shape BuildDkStep's fan-in/out SVGs already use --
// just built from measured coordinates instead of hardcoded ones, since
// the row below is natural-width (real equal gaps), not fixed lanes.
function branchPath(dropX, laneX) {
  const corner = laneX < dropX ? laneX + 5 : laneX - 5
  return `M ${dropX} 24 H ${corner} Q ${laneX} 24 ${laneX} 29 V 48`
}

// Exact mirror of BuildDkStep's fan-in merge SVG, just flipped (one line
// drops from dk, then splits into four, instead of four joining into one)
// and measured live off the actual rendered boxes below, rather than
// assumed from fixed pixel lanes -- see branchPath().
function ExtractDataStep() {
  const [openKey, setOpenKey] = useState(null)
  const rowRef = useRef(null)
  const laneRefs = useRef([])
  const [geometry, setGeometry] = useState(null)

  useLayoutEffect(() => {
    const rowRect = rowRef.current.getBoundingClientRect()
    const centers = laneRefs.current.map(el => {
      const r = el.getBoundingClientRect()
      return r.left - rowRect.left + r.width / 2
    })
    setGeometry({ width: rowRect.width, centers })
  }, [])

  const active = ITEMS.find(item => item.key === openKey)

  return (
    <div className="extract-data-step">
      <Node label="dk" microLabel="(768k + 96)B" />

      <svg
        className="extract-data-step__svg"
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

      <div className="extract-data-step__row" ref={rowRef}>
        {ITEMS.map((item, i) => (
          <div key={item.key} className="extract-data-step__lane" ref={el => (laneRefs.current[i] = el)}>
            <Node label={item.label} microLabel={item.range} onClick={() => setOpenKey(item.key)} />
          </div>
        ))}
      </div>

      {active && (
        <Popup
          title={active.explanation.title}
          body={active.explanation.body}
          value={bytes(active.hex) > 64 ? truncateHex(active.hex) : toSpacedHex(active.hex)}
          valueLabel={`${bytes(active.hex)} bytes`}
          isOpen
          onClose={() => setOpenKey(null)}
        />
      )}
    </div>
  )
}

export default ExtractDataStep
