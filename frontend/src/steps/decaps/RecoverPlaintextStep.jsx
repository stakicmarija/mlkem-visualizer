import { useState } from 'react'
import Node from '../../components/shared/diagram-boxes/Node.jsx'
import TransformBox from '../../components/shared/diagram-boxes/TransformBox.jsx'
import CompressionPanel from '../../components/shared/step-content/CompressionPanel.jsx'
import Popup from '../../components/shared/popup/Popup.jsx'
import { explanations } from '../../data/explanations.js'
import { truncateHex } from '../../utils/hex.js'
import { formatPolynomialPreview } from '../../utils/polynomial.js'
import data from '../../data/mlkem_768_data.json'
import './RecoverPlaintextStep.css'

const D = 1 // fixed -- message recovery always compresses to 1 bit/coefficient, not a tunable parameter like du/dv
const PREVIEW_COUNT = 8 // matches CompressPackStep's "first 8 coeffs" walkthrough strip

const inputPreview = data.decaps.w.coeffs.slice(0, PREVIEW_COUNT)
const outputPreview = data.decaps.w_compressed.coeffs.slice(0, PREVIEW_COUNT)

// Mirrors Encaps' CompressPackStep (v -> Compress -> ByteEncode -> c2), but
// with d=1 fixed -- no du/dv sibling parameter, so no caption is needed here.
function RecoverPlaintextStep() {
  const [mPrimeOpen, setMPrimeOpen] = useState(false)
  const [wOpen, setWOpen] = useState(false)

  return (
    <div className="recover-plaintext-step">
      <Node label="w" onClick={() => setWOpen(true)} />

      <div className="recover-plaintext-step__vline" />

      <CompressionPanel
        symbol="1"
        d={D}
        inputValues={inputPreview}
        outputValues={outputPreview}
        stripLabel="w first 8 coeffs"
      />

      <div className="recover-plaintext-step__vline" />

      <TransformBox name="Byte Encode" explanationKey="ByteEncodeD" />

      <div className="recover-plaintext-step__vline" />

      <Node label="m'" variant="leaf" onClick={() => setMPrimeOpen(true)} />

      <Popup
        title="m'"
        body={explanations.mPrime.body}
        value={truncateHex(data.decaps.m_prime)}
        isOpen={mPrimeOpen}
        onClose={() => setMPrimeOpen(false)}
      />

      <Popup
        title="w"
        body={explanations.w.body}
        polynomialPreview={formatPolynomialPreview('w', data.decaps.w.coeffs)}
        fullCoefficients={data.decaps.w.coeffs}
        isOpen={wOpen}
        onClose={() => setWOpen(false)}
      />
    </div>
  )
}

export default RecoverPlaintextStep
