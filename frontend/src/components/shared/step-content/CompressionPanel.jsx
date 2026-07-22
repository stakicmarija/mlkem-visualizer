import DataChip from '../diagram-boxes/DataChip.jsx'
import ModQRing from '../mod-q-ring/ModQRing.jsx'
import AnimationReplayButton from '../diagram-boxes/AnimationReplayButton.jsx'
import { useWalkAnimation } from '../../../utils/useWalkAnimation.js'
import data from '../../../data/mlkem_768_data.json'
import './CompressionPanel.css'

const MAX_RING_DOTS = 16 // schematic cap -- real d (e.g. du=10) means 1024 buckets, far too many to draw
const DEFAULT_STEP_GAP = 1400 // same steady pace as EncodePlaintextStep's Decompress circle
// The ring's center label always reads the real modulus (ℤ_3329), not the
// division count (ℤ_2dv/ℤ_2du) -- read from the data file so it stays
// correct if this component is ever reused for a different q, rather than
// hardcoding 3329. Independent of the `q` prop below, which only gates the
// outer reference-value ring and may not be passed by every caller.
const { q: RING_Q } = data.params

// The Compress walkthrough (formula, mod-q input strip, "mod 2^d" ring,
// one-value example, compressed output row), inline in a bordered panel --
// same shape as EncodePlaintextStep's inline Decompress panel, generalized
// for reuse wherever a compress step needs it (u -> c1 here, v -> c2 later).
// `direction="reverse"` runs the same ring/strip/row grammar backwards for
// Decompress steps: `inputValues` becomes the small (0..2^d-1) index strip,
// `outputValues` becomes the real Zq values, and the ring highlights off
// the index directly instead of scaling a compressed output down to it.
//
// `q`, when passed, draws a second, muted outer ring of reference labels
// on the ring -- the original Zq value each dot rounds to -- for the exact
// (non-schematic) case only, computed as k*(q/2^d) for k = 0..2^d-1.
//
// `animated` opts into walking through inputValues/outputValues one index
// at a time (via the shared useWalkAnimation hook -- same pattern as
// EncodePlaintextStep's Decompress circle) instead of statically holding on
// `highlightIndex`; other call sites are unaffected until they opt in too.
//
// `showRoundingSplit` (d=1 only, e.g. Recover plaintext m's Compress
// circle) adds boundary/reference ticks (q/4, 3q/4, and the wraparound and
// midpoint pairs below -- all labeled with their real numeric value, e.g.
// "832"), swaps the usual point markers for arrows converging on "0"/"1"
// labels inside their half (a whole half rounds to that value, not one
// point), and paints a two-tone background wedge behind the ring -- only
// the half matching the current result tinted --color-encoded-message-tint
// (strong), the other left neutral --color-inactive-tint -- so highlighting
// is about which half won this coefficient, not a fixed color per half.
//
// Both the wraparound pair (0/q-1, near the top) and the midpoint pair
// (near the bottom) get two distinct marks, nudged MARK_ANGLE_OFFSET° apart
// from their landmark angle (0 or 180) -- true angles for 0/q-1 are only
// 1/q of a turn apart, close enough to render as a single point otherwise.
// `labelAngle` then nudges just the text further apart still (each pair's
// own *_LABEL_OFFSET°) so the two labels in a pair stay legible instead of
// overlapping.
const MARK_ANGLE_OFFSET = 3
const WRAP_LABEL_OFFSET = 11
const MIDPOINT_LABEL_OFFSET = 16
const ROUNDING_SPLIT_TICKS = [
  { angle: 90, label: Math.round(RING_Q / 4) },
  { angle: 270, label: Math.round((3 * RING_Q) / 4) },
  { angle: -MARK_ANGLE_OFFSET, labelAngle: -WRAP_LABEL_OFFSET, label: RING_Q - 1 },
  { angle: MARK_ANGLE_OFFSET, labelAngle: WRAP_LABEL_OFFSET, label: 0 },
  { angle: 180 - MARK_ANGLE_OFFSET, labelAngle: 180 - MIDPOINT_LABEL_OFFSET, label: Math.floor(RING_Q / 2) },
  { angle: 180 + MARK_ANGLE_OFFSET, labelAngle: 180 + MIDPOINT_LABEL_OFFSET, label: Math.floor(RING_Q / 2) + 1 },
]

function CompressionPanel({
  symbol,
  d,
  q,
  inputValues,
  outputValues,
  highlightIndex = 0,
  stripLabel,
  direction = 'forward',
  animated = false,
  stepGap = DEFAULT_STEP_GAP,
  showRoundingSplit = false,
}) {
  const isReverse = direction === 'reverse'

  // Always called (rules of hooks) -- schedules nothing when !animated.
  const walk = useWalkAnimation(inputValues.length, stepGap, animated)
  const activeIndex = animated ? walk.activeIndex : highlightIndex

  // 2^d real points only get squeezed into the 16-dot schematic once there
  // are actually more of them than dots to draw (du=10's 1024 buckets) --
  // small d (e.g. d=1's 2 points, or dv=4's exact 16) render one dot per
  // real value instead, so the ring never shows more points than exist.
  const realPointCount = 2 ** d
  const isSchematic = realPointCount > MAX_RING_DOTS
  const ringDotCount = isSchematic ? MAX_RING_DOTS : realPointCount

  const highlightDot = isReverse
    ? Math.min(ringDotCount - 1, inputValues[activeIndex])
    : isSchematic
      ? Math.min(ringDotCount - 1, Math.floor((outputValues[activeIndex] / realPointCount) * ringDotCount))
      : outputValues[activeIndex]

  // Exact ring only -- a schematic dot doesn't correspond 1:1 to a single
  // Zq value, so an outer reference label there would be misleading.
  const outerLabels = q && !isSchematic
    ? Array.from({ length: ringDotCount }, (_, k) => Math.round(k * (q / realPointCount)))
    : undefined

  // Only the half matching the current result is tinted pink -- the other
  // stays plain neutral gray, so highlighting is about which half won this
  // coefficient, not a fixed color per half.
  const roundingSplitFills = showRoundingSplit
    ? [
        { fromAngle: 270, toAngle: 90, colorToken: 'inactive-tint', activeColorToken: 'encoded-message-tint-strong', active: highlightDot === 0 },
        { fromAngle: 90, toAngle: 270, colorToken: 'inactive-tint', activeColorToken: 'encoded-message-tint-strong', active: highlightDot === 1 },
      ]
    : undefined

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
              tone={i === activeIndex ? 'outline-accent' : 'outline'}
              colorToken={i === activeIndex ? 'encoded-message' : undefined}
            />
          ))}
        </div>
        <span className="micro-label compression-panel__strip-label">{stripLabel}</span>
      </div>

      <ModQRing
        size={outerLabels ? 112 : 92}
        compact
        dotCount={ringDotCount}
        highlightDot={highlightDot}
        q={RING_Q}
        outerLabels={outerLabels}
        sideTicks={showRoundingSplit ? ROUNDING_SPLIT_TICKS : undefined}
        halfFills={roundingSplitFills}
        arrowPoles={showRoundingSplit}
      />

      <p className="compression-panel__mapping">
        {inputValues[activeIndex]} &rarr; {outputValues[activeIndex]}
      </p>

      <div className="compression-panel__output-row">
        {outputValues.map((value, i) => (
          <DataChip
            key={i}
            value={animated && i >= walk.filledCount ? '' : value}
            size="auto"
            tone={i === activeIndex ? 'outline-accent' : 'outline'}
            colorToken={i === activeIndex ? 'encoded-message' : undefined}
          />
        ))}
      </div>

      {animated && (
        walk.done ? (
          <AnimationReplayButton onClick={walk.handleReplay} />
        ) : walk.paused ? (
          <AnimationReplayButton onClick={walk.handleContinue} icon="continue" label="Continue" />
        ) : (
          <AnimationReplayButton onClick={walk.handleStop} icon="stop" label="Stop" />
        )
      )}
    </div>
  )
}

export default CompressionPanel
