import DataChip from '../diagram-boxes/DataChip.jsx'
import ModQRing from '../mod-q-ring/ModQRing.jsx'
import './CompressionPanel.css'

const RING_DOT_COUNT = 16 // always schematic -- real d (e.g. du=10) means 1024 buckets, far too many to draw

// The Compress walkthrough (formula, mod-q input strip, "mod 2^d" ring,
// one-value example, compressed output row), inline in a bordered panel --
// same shape as EncodePlaintextStep's inline Decompress panel, generalized
// for reuse wherever a compress step needs it (u -> c1 here, v -> c2 later).
function CompressionPanel({ symbol, d, inputValues, outputValues, highlightIndex = 0, stripLabel }) {
  const highlightDot = Math.min(
    RING_DOT_COUNT - 1,
    Math.floor((outputValues[highlightIndex] / 2 ** d) * RING_DOT_COUNT)
  )

  return (
    <div className="compression-panel">
      <div className="compression-panel__header">
        <p className="compression-panel__title">Compress</p>
        <p className="body-text">x = &#8968;(2&#7496;/q) &middot; x&#8969; mod 2&#7496;, d = {symbol}</p>
      </div>

      <div className="compression-panel__strip-wrap">
        <div className="compression-panel__strip">
          {inputValues.map((value, i) => (
            <DataChip
              key={i}
              value={value}
              size="auto"
              tone={i === highlightIndex ? 'outline-accent' : 'outline'}
              colorToken={i === highlightIndex ? 'encoded-message' : undefined}
            />
          ))}
        </div>
        <span className="micro-label compression-panel__strip-label">{stripLabel}</span>
      </div>

      <ModQRing
        size={92}
        compact
        dotCount={RING_DOT_COUNT}
        highlightDot={highlightDot}
        centerSub={`2${symbol}`}
      />

      <p className="compression-panel__mapping">
        {inputValues[highlightIndex]} &rarr; {outputValues[highlightIndex]}
      </p>

      <div className="compression-panel__output-row">
        {outputValues.map((value, i) => (
          <DataChip
            key={i}
            value={value}
            size="auto"
            tone={i === highlightIndex ? 'outline-accent' : 'outline'}
            colorToken={i === highlightIndex ? 'encoded-message' : undefined}
          />
        ))}
      </div>
    </div>
  )
}

export default CompressionPanel
