import DataChip from '../diagram-boxes/DataChip.jsx'
import ModQRing from '../mod-q-ring/ModQRing.jsx'
import './CompressionPanel.css'

const MAX_RING_DOTS = 16 // schematic cap -- real d (e.g. du=10) means 1024 buckets, far too many to draw

// The Compress walkthrough (formula, mod-q input strip, "mod 2^d" ring,
// one-value example, compressed output row), inline in a bordered panel --
// same shape as EncodePlaintextStep's inline Decompress panel, generalized
// for reuse wherever a compress step needs it (u -> c1 here, v -> c2 later).
// `direction="reverse"` runs the same ring/strip/row grammar backwards for
// Decompress steps: `inputValues` becomes the small (0..2^d-1) index strip,
// `outputValues` becomes the real Zq values, and the ring highlights off
// the index directly instead of scaling a compressed output down to it.
function CompressionPanel({
  symbol,
  d,
  inputValues,
  outputValues,
  highlightIndex = 0,
  stripLabel,
  direction = 'forward',
}) {
  const isReverse = direction === 'reverse'

  // 2^d real points only get squeezed into the 16-dot schematic once there
  // are actually more of them than dots to draw (du=10's 1024 buckets) --
  // small d (e.g. d=1's 2 points, or dv=4's exact 16) render one dot per
  // real value instead, so the ring never shows more points than exist.
  const realPointCount = 2 ** d
  const isSchematic = realPointCount > MAX_RING_DOTS
  const ringDotCount = isSchematic ? MAX_RING_DOTS : realPointCount

  const highlightDot = isReverse
    ? Math.min(ringDotCount - 1, inputValues[highlightIndex])
    : isSchematic
      ? Math.min(ringDotCount - 1, Math.floor((outputValues[highlightIndex] / realPointCount) * ringDotCount))
      : outputValues[highlightIndex]

  return (
    <div className="compression-panel">
      <div className="compression-panel__header">
        <p className="compression-panel__title">{isReverse ? 'Decompress' : 'Compress'}</p>
        {isReverse ? (
          <p className="body-text">x = &#8968;(q/2&#7496;) &middot; x&#8969;, d = {symbol}</p>
        ) : (
          <p className="body-text">x = &#8968;(2&#7496;/q) &middot; x&#8969; mod 2&#7496;, d = {symbol}</p>
        )}
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
        dotCount={ringDotCount}
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
