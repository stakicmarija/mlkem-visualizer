import { useState } from 'react'
import Node from '../../components/shared/diagram-boxes/Node.jsx'
import TransformBox from '../../components/shared/diagram-boxes/TransformBox.jsx'
import CompressionPanel from '../../components/shared/step-content/CompressionPanel.jsx'
import Popup from '../../components/shared/popup/Popup.jsx'
import { explanations } from '../../data/explanations.js'
import { formatPolynomialPreview } from '../../utils/polynomial.js'
import data from '../../data/mlkem_768_data.json'
import './DecodeCiphertextStep.css'

const { dv } = data.params
const PREVIEW_COUNT = 8 // matches Encaps' CompressPackStep's "v first 8 coeffs" walkthrough strip

// v' is a single polynomial (unlike u', a k=3 vector), so no [0] indexing --
// same reasoning CompressPackStep used for v/c2. dv=4 means 2^dv=16, an
// exact ring, unlike du=10's 1024 buckets which can't be drawn to scale.
//
// ByteDecode_dv(c2) is mathematically identical to the v_compressed Bob
// already computed when packing c2 -- reuse that directly as the input
// strip instead of recomputing it.
const inputPreview = data.encaps.v_compressed.coeffs.slice(0, PREVIEW_COUNT)
const outputPreview = data.decaps.v_decoded.coeffs.slice(0, PREVIEW_COUNT)

function DecodeCiphertextStep() {
  const [vPrimeOpen, setVPrimeOpen] = useState(false)

  return (
    <div className="decode-ciphertext-step">
      <Node label="c2" />

      <div className="decode-ciphertext-step__vline" />

      <TransformBox name="Byte Decode" explanationKey="ByteDecodeD" />

      <div className="decode-ciphertext-step__vline" />

      <CompressionPanel
        symbol="dv"
        d={dv}
        direction="reverse"
        inputValues={inputPreview}
        outputValues={outputPreview}
        stripLabel="v compressed first 8 coeffs"
      />

      <div className="decode-ciphertext-step__vline" />

      <Node label="v'" variant="leaf" onClick={() => setVPrimeOpen(true)} />

      <div className="decode-ciphertext-step__notes">
        <p className="decode-ciphertext-step__caption micro-label">
          u' is decoded the same way, using du = 10 instead of dv = 4.
        </p>
      </div>

      <Popup
        title="v'"
        body={explanations.vPrime.body}
        polynomialPreview={formatPolynomialPreview("v'", data.decaps.v_decoded.coeffs)}
        fullCoefficients={data.decaps.v_decoded.coeffs}
        isOpen={vPrimeOpen}
        onClose={() => setVPrimeOpen(false)}
      />
    </div>
  )
}

export default DecodeCiphertextStep
