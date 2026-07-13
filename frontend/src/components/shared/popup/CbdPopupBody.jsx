import DataChip from '../diagram-boxes/DataChip.jsx'
import './CbdPopupBody.css'

const ETA = 2

function hexToBits(hex) {
  const bits = []
  for (let i = 0; i < hex.length; i += 2) {
    const byte = parseInt(hex.slice(i, i + 2), 16)
    for (let b = 0; b < 8; b++) bits.push((byte >> b) & 1)
  }
  return bits
}

function CbdPopupBody({ prfRawHex, coeffsSigned }) {
  const bits = hexToBits(prfRawHex)
  const first20 = bits.slice(0, 20)

  // Coefficient 0: 2η=4 bits total; first η bits are x, next η are y
  const xBits = [bits[0], bits[1]]
  const yBits = [bits[2], bits[3]]
  const x = xBits[0] + xBits[1]
  const y = yBits[0] + yBits[1]
  const result = x - y

  return (
    <div className="cbd-popup-body">
      <p className="body-text cbd-popup-body__formula">b = BytesToBits(B)</p>

      <div className="cbd-popup-body__strip-wrap">
        <div className="cbd-popup-body__strip">
          {first20.map((bit, i) => {
            if (i < ETA) return <DataChip key={i} value={bit} size="sm" colorToken="cbd-x-bits" />
            if (i < ETA * 2) return <DataChip key={i} value={bit} size="sm" colorToken="cbd-y-bits" />
            return <DataChip key={i} value={bit} size="sm" tone={bit === 1 ? 'filled' : 'outline'} />
          })}
        </div>
        <p className="micro-label cbd-popup-body__strip-label">b first 20b</p>
      </div>

      <div className="cbd-popup-body__xy-section">
        <div className="cbd-popup-body__groups">
          <div className="cbd-popup-body__group">
            <p className="micro-label cbd-popup-body__group-label">x bits</p>
            <div className="cbd-popup-body__group-bits">
              {xBits.map((b, i) => <DataChip key={i} value={b} size="md" colorToken="cbd-x-bits" />)}
            </div>
          </div>
          <div className="cbd-popup-body__group">
            <p className="micro-label cbd-popup-body__group-label">y bits</p>
            <div className="cbd-popup-body__group-bits">
              {yBits.map((b, i) => <DataChip key={i} value={b} size="md" colorToken="cbd-y-bits" />)}
            </div>
          </div>
        </div>

        <div className="cbd-popup-body__sums">
          <span className="body-text">x = {x}</span>
          <span className="body-text">y = {y}</span>
        </div>
      </div>

      <p className="cbd-popup-body__result">f[0] = x − y = {result}</p>

      <div className="cbd-popup-body__chips">
        {coeffsSigned.slice(0, 5).map((coeff, i) => (
          <div key={i} className="cbd-chip">
            {i === 0 && <span className="micro-label">{coeff}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

export default CbdPopupBody
