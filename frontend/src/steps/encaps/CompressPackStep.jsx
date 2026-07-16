import { useState } from 'react'
import Node from '../../components/shared/diagram-boxes/Node.jsx'
import TransformBox from '../../components/shared/diagram-boxes/TransformBox.jsx'
import CompressionPanel from '../../components/shared/step-content/CompressionPanel.jsx'
import Popup from '../../components/shared/popup/Popup.jsx'
import { explanations } from '../../data/explanations.js'
import { truncateHex } from '../../utils/hex.js'
import data from '../../data/mlkem_768_data.json'
import './CompressPackStep.css'

const { dv } = data.params
const PREVIEW_COUNT = 8 // matches the "v first 8 coeffs" walkthrough strip

// v is a single polynomial (unlike u, a k=3 vector), so no [0] indexing.
// dv=4 means 2^dv = 16 -- the ring's 16 ticks are an exact representation
// here, not a schematic stand-in the way they are for du=10's 1024 buckets.
const inputPreview = data.encaps.v.coeffs.slice(0, PREVIEW_COUNT)
const outputPreview = data.encaps.v_compressed.coeffs.slice(0, PREVIEW_COUNT)

function CompressPackStep() {
  const [c2Open, setC2Open] = useState(false)

  return (
    <div className="compress-pack-step">
      <Node label="v" />

      <div className="compress-pack-step__vline" />

      <CompressionPanel
        symbol="dv"
        d={dv}
        inputValues={inputPreview}
        outputValues={outputPreview}
        stripLabel="v first 8 coeffs"
      />

      <div className="compress-pack-step__vline" />

      <TransformBox name="Byte Encode" explanationKey="ByteEncodeD" />

      <div className="compress-pack-step__vline" />

      <Node label="c2" variant="leaf" onClick={() => setC2Open(true)} />

      <p className="compress-pack-step__caption micro-label">
        c1 is obtained the same way, using du = 10 instead of dv = 4
      </p>

      <Popup
        title="c2"
        body={explanations.c2.body}
        value={truncateHex(data.encaps.c2)}
        isOpen={c2Open}
        onClose={() => setC2Open(false)}
      />
    </div>
  )
}

export default CompressPackStep
