import { useState } from 'react'
import Node from '../../components/shared/diagram-boxes/Node.jsx'
import TransformBox from '../../components/shared/diagram-boxes/TransformBox.jsx'
import DataChip from '../../components/shared/diagram-boxes/DataChip.jsx'
import ModQRing from '../../components/shared/mod-q-ring/ModQRing.jsx'
import Popup from '../../components/shared/popup/Popup.jsx'
import { explanations } from '../../data/explanations.js'
import { toSpacedHex } from '../../utils/hex.js'
import { formatPolynomialPreview } from '../../utils/polynomial.js'
import data from '../../data/mlkem_768_data.json'
import './EncodePlaintextStep.css'

const { q } = data.params
const BIT_PREVIEW_COUNT = 8 // matches the "m first 8b" walkthrough strip
const HIGHLIGHT_INDEX = 0 // bit walked through below the ring (m[0] = 1 -> μ[0] = 1665)

function hexToBits(hex) {
  const bits = []
  for (let i = 0; i < hex.length; i += 2) {
    const byte = parseInt(hex.slice(i, i + 2), 16)
    for (let b = 0; b < 8; b++) bits.push((byte >> b) & 1)
  }
  return bits
}

// ByteDecode₁(m) just unpacks m's bytes into individual bits (LSB-first,
// per FIPS 203's BytesToBits) -- these are its real output, not a stand-in.
const previewBits = hexToBits(data.inputs.m).slice(0, BIT_PREVIEW_COUNT)
// μ's real coefficients already are Decompress₁(bit) for each bit above --
// reuse them instead of recomputing the 0/1665 mapping.
const previewValues = data.encaps.mu.coeffs.slice(0, BIT_PREVIEW_COUNT)

function EncodePlaintextStep() {
  const [muOpen, setMuOpen] = useState(false)
  const [mOpen, setMOpen] = useState(false)

  return (
    <div className="encode-plaintext-step">
      <Node label="m" microLabel="BYTES" className="encode-plaintext-step__node--sm" onClick={() => setMOpen(true)} />

      <div className="encode-plaintext-step__vline" />

      <TransformBox name="Byte Decode" explanationKey="ByteDecode1" />

      <div className="encode-plaintext-step__vline" />

      <Node label="m" microLabel="bits" className="encode-plaintext-step__node--sm" onClick={() => setMOpen(true)} />

      <div className="encode-plaintext-step__vline" />

      <div className="encode-plaintext-step__panel">
        <div className="encode-plaintext-step__panel-header">
          <p className="encode-plaintext-step__panel-title">Decompress</p>
          <p className="body-text">y = &#8968;(q/2&#7496;) &middot; y&#8969;, d = 1</p>
        </div>

        <div className="encode-plaintext-step__strip-wrap">
          <div className="encode-plaintext-step__strip">
            {previewBits.map((bit, i) => (
              <DataChip
                key={i}
                value={bit}
                size="sm"
                tone={bit === 1 ? 'filled' : 'outline'}
                colorToken={i === HIGHLIGHT_INDEX ? 'encoded-message' : undefined}
              />
            ))}
          </div>
          <span className="micro-label encode-plaintext-step__strip-label">m first {BIT_PREVIEW_COUNT}b</span>
        </div>

        <ModQRing
          q={q}
          size={92}
          compact
          tickLabels={false}
          anchors={[
            { angle: 0, label: '0', colorToken: 'transform' },
            { angle: 180, label: '1665', colorToken: 'encoded-message' },
          ]}
        />

        <p className="label encode-plaintext-step__mapping">
          {previewBits[HIGHLIGHT_INDEX]} &rarr; {previewValues[HIGHLIGHT_INDEX]}
        </p>

        <div className="encode-plaintext-step__output-row">
          {previewValues.map((value, i) => (
            <DataChip
              key={i}
              value={value}
              size="auto"
              tone={i === HIGHLIGHT_INDEX ? 'outline-accent' : 'outline'}
              colorToken={i === HIGHLIGHT_INDEX ? 'encoded-message' : undefined}
            />
          ))}
        </div>
      </div>

      <div className="encode-plaintext-step__vline" />

      <Node label="μ" variant="leaf" onClick={() => setMuOpen(true)} />

      <Popup
        title="μ"
        body={explanations.mu.body}
        polynomialPreview={formatPolynomialPreview('μ', data.encaps.mu.coeffs)}
        fullCoefficients={data.encaps.mu.coeffs}
        isOpen={muOpen}
        onClose={() => setMuOpen(false)}
      />

      <Popup
        title="m (32B seed)"
        body={explanations.m.body}
        value={toSpacedHex(data.inputs.m)}
        isOpen={mOpen}
        onClose={() => setMOpen(false)}
      />
    </div>
  )
}

export default EncodePlaintextStep
