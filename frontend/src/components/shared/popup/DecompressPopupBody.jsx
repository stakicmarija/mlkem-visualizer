import DataChip from '../diagram-boxes/DataChip.jsx'
import ModQRing from '../mod-q-ring/ModQRing.jsx'
import data from '../../../data/mlkem_768_data.json'
import './DecompressPopupBody.css'

const { q } = data.params

function hexToBits(hex) {
  const bits = []
  for (let i = 0; i < hex.length; i += 2) {
    const byte = parseInt(hex.slice(i, i + 2), 16)
    for (let b = 0; b < 8; b++) bits.push((byte >> b) & 1)
  }
  return bits
}

// ByteDecode₁(m) just unpacks m's bytes into individual bits (LSB-first,
// per FIPS 203's BytesToBits) -- so the bits here are ByteDecode₁'s real
// output, not a stand-in.
const bits = hexToBits(data.inputs.m)
const first20 = bits.slice(0, 20)

// Coefficient 0: one bit in, one Decompress₁ output out.
const bit0 = bits[0]
const result0 = bit0 === 1 ? 1665 : 0

function DecompressPopupBody() {
  return (
    <div className="decompress-popup-body">
      <p className="body-text decompress-popup-body__formula">y ↦ ⌈(q/2ᵈ) · y⌋, d = 1</p>

      <div className="decompress-popup-body__strip-wrap">
        <div className="decompress-popup-body__strip">
          {first20.map((bit, i) =>
            i === 0
              ? <DataChip key={i} value={bit} size="sm" colorToken="encoded-message" />
              : <DataChip key={i} value={bit} size="sm" tone={bit === 1 ? 'filled' : 'outline'} />
          )}
        </div>
        <p className="micro-label decompress-popup-body__strip-label">y first 20b</p>
      </div>

      {/* Circle stays neutral for this static pass -- a later animation
          pass will pass `regions` here (already supported by ModQRing) to
          color the "maps to 0" / "maps to 1665" arcs as each bit resolves. */}
      <ModQRing
        q={q}
        size={180}
        anchors={[
          { angle: 0, label: '0', colorToken: 'transform' },
          { angle: 180, label: '1665', colorToken: 'transform' },
        ]}
      />

      <div className="decompress-popup-body__xy-section">
        <div className="decompress-popup-body__groups">
          <div className="decompress-popup-body__group">
            <p className="micro-label decompress-popup-body__group-label">y bit</p>
            <DataChip value={bit0} size="md" colorToken="encoded-message" />
          </div>
          <span className="decompress-popup-body__arrow">&#8614;</span>
          <div className="decompress-popup-body__group">
            <p className="micro-label decompress-popup-body__group-label">μ[0]</p>
            <DataChip value={result0} size="auto" colorToken="encoded-message" />
          </div>
        </div>
      </div>

      <p className="decompress-popup-body__result">μ[0] = Decompress₁(y[0]) = {result0}</p>

      <div className="decompress-popup-body__chips">
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="decompress-popup-body__chip">
            {i === 0 && <span className="micro-label">{result0}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

export default DecompressPopupBody
