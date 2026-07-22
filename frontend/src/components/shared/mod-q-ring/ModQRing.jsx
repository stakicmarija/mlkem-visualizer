import './ModQRing.css'

// 0° = top, increasing clockwise -- matches how q grows "around" the ring.
function pointOnRing(angleDeg, radius, cx, cy) {
  const rad = (angleDeg - 90) * (Math.PI / 180)
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) }
}

// SVG arc path along the ring from fromAngle to toAngle, sweeping clockwise.
function arcPath(fromAngle, toAngle, radius, cx, cy) {
  const start = pointOnRing(fromAngle, radius, cx, cy)
  const end = pointOnRing(toAngle, radius, cx, cy)
  const delta = ((toAngle - fromAngle) % 360 + 360) % 360
  const largeArc = delta > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`
}

// Same sweep as arcPath, but out from the center and back -- a filled pie
// wedge covering the disk itself, not just a stroke along its edge.
function wedgePath(fromAngle, toAngle, radius, cx, cy) {
  const start = pointOnRing(fromAngle, radius, cx, cy)
  const end = pointOnRing(toAngle, radius, cx, cy)
  const delta = ((toAngle - fromAngle) % 360 + 360) % 360
  const largeArc = delta > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`
}

// Short arc, constant radius, sweeping whichever direction is shorter
// (unlike arcPath/wedgePath, which always sweep the "clockwise" way) --
// used for the pair of arrows that converge on a pole from either side.
function arcArrowPath(fromAngle, toAngle, radius, cx, cy) {
  const start = pointOnRing(fromAngle, radius, cx, cy)
  const end = pointOnRing(toAngle, radius, cx, cy)
  const delta = toAngle - fromAngle
  const sweep = delta > 0 ? 1 : 0
  const largeArc = Math.abs(delta) > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} ${sweep} ${end.x} ${end.y}`
}

// Small triangle at `angle`, tangent to the circle there, pointing the way
// travel continues past it (`direction`: +1 for increasing angle, -1 for
// decreasing) -- the arrowhead for arcArrowPath's curves.
function arrowHeadPoints(angle, radius, cx, cy, direction, size) {
  const tip = pointOnRing(angle, radius, cx, cy)
  const ahead = pointOnRing(angle + direction, radius, cx, cy)
  const dx = ahead.x - tip.x
  const dy = ahead.y - tip.y
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  const px = -uy
  const py = ux
  const backX = tip.x - ux * size
  const backY = tip.y - uy * size
  const half = size * 0.55
  return `${tip.x},${tip.y} ${backX + px * half},${backY + py * half} ${backX - px * half},${backY - py * half}`
}

// How far (in degrees) each pole's convergence arrows start from the pole,
// and how close they end -- e.g. for pole 0 with ARROW_SPAN=55/ARROW_GAP=14,
// one arrow runs [-55,-14] and the other [55,14] relative to the pole,
// leaving a gap right at the pole for its label and clear of sideTicks
// sitting further out at ±90.
const ARROW_SPAN = 55
const ARROW_GAP = 14

// A circle representing Z_q (the ring of coefficients mod q), with tick
// marks at the four quarter points. `anchors` marks specific labeled
// values (e.g. the two points a message bit can Decompress to) just
// outside the ring -- when an anchor lands on the same angle as a tick,
// the anchor's more specific label (e.g. "1665") replaces the tick's
// generic one ("q/2"). `regions` paints colored arcs along the ring itself
// (e.g. the "decodes to 0" vs "decodes to q/2" halves) -- optional, so the
// same component still works as a plain labeled ring elsewhere. `compact`
// tightens the border reserve/tick/label offsets for inline use at small
// sizes (e.g. next to a Node) instead of the popup-scale spacing.
// `tickLabels=false` keeps the unlabeled quarter ticks as plain marks with
// no text -- for compact rings where only the anchors need callouts.
// `dotCount` switches to a different schematic: evenly-spaced numbered
// dots all the way around (0..dotCount-1), used for Compress's "mod 2^d"
// ring -- a stand-in for a range far too large to draw to scale (e.g.
// 1024 buckets for du=10), so it's always schematic, never literal.
// `highlightDot` colors one of those dots/labels as the accent color;
// `centerSub` overrides the default `q` subscript in the center label
// (e.g. "2du" instead of "3329"). `outerLabels` (parallel array, one entry
// per dot) draws a second, further-out ring of muted reference labels --
// e.g. the original Zq value each compressed dot rounds to -- highlighting
// the same index as `highlightDot` so the two rings visually snap together
// at one angle. `halfFills` paints filled background wedges behind
// everything else (e.g. the two halves of a rounds-to-0/rounds-to-1 split)
// -- unlike `regions`, which only strokes a colored arc along the ring's
// own line, these fill the disk interior; each entry's optional `active`
// flag swaps in `activeColorToken` for a stronger tint, e.g. to emphasize
// whichever half the value currently being shown falls into. `sideTicks`
// draws extra plain tick marks + labels (e.g. the q/4 and 3q/4 boundary
// points) independent of the main `ticks` quartet, which is skipped
// entirely in `dotCount` mode.
// `arrowPoles` replaces each dot's usual marker+inline-label with a pair of
// arrows converging on a label, both sitting inside the circle line within
// that half's tinted region -- for a 2-point ring (d=1) where "0"/"1"
// represent a whole half of the ring rounding to that value, not one
// specific point on it.
function ModQRing({
  q,
  size = 220,
  anchors = [],
  regions = [],
  halfFills = [],
  sideTicks = [],
  arrowPoles = false,
  compact = false,
  tickLabels = true,
  dotCount = 0,
  highlightDot = -1,
  outerLabels = [],
  centerSub,
}) {
  const cx = size / 2
  const cy = size / 2
  const borderReserve = compact ? 10 : 36
  const tickHalf = compact ? 3 : 6
  const labelOffset = compact ? 8 : 22
  // Dots (the Compress/Decompress 0..2^d-1 ring) sit strictly inside the
  // circle line -- pulled toward the center, not pushed out past it like
  // ticks/anchors -- so there's clear separation from outerLabelOffset's
  // reference ring outside the same line, instead of the two crowding at
  // similar radii.
  const dotLabelInset = compact ? 8 : 16
  const outerLabelOffset = compact ? 10 : 20
  // sideTicks get their own (larger) offset, independent of outerLabelOffset
  // above -- that one is shared with the dv=4/du=10 outer reference ring
  // and already tuned close to the circle line; sideTicks want more room.
  const sideTickOffset = compact ? 14 : 26
  // arrowPoles' converging arrows + label sit well inside the circle line,
  // inside their half's tinted region -- not floating outside the boundary.
  const poleInset = compact ? 14 : 28
  const radius = size / 2 - borderReserve
  const anchorAngles = new Set(anchors.map(a => a.angle))

  const ticks = [
    { angle: 0, label: '0' },
    { angle: 90, label: 'q/4' },
    { angle: 180, label: 'q/2' },
    { angle: 270, label: '3q/4' },
  ]

  const dots = Array.from({ length: dotCount }, (_, i) => ({
    angle: (360 * i) / dotCount,
    label: i,
    index: i,
    highlighted: i === highlightDot,
  }))

  return (
    <svg
      className={`mod-q-ring${compact ? ' mod-q-ring--compact' : ''}`}
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      {halfFills.map((fill, i) => (
        <path
          key={i}
          d={wedgePath(fill.fromAngle, fill.toAngle, radius, cx, cy)}
          className="mod-q-ring__half-fill"
          style={{ '--fill-color': `var(--color-${fill.active && fill.activeColorToken ? fill.activeColorToken : fill.colorToken})` }}
        />
      ))}

      <circle cx={cx} cy={cy} r={radius} className="mod-q-ring__circle" />

      {regions.map((region, i) => (
        <path
          key={i}
          d={arcPath(region.fromAngle, region.toAngle, radius, cx, cy)}
          className="mod-q-ring__region"
          style={{ '--region-color': `var(--color-${region.colorToken})` }}
        />
      ))}

      {!dotCount && ticks.map(tick => {
        const inner = pointOnRing(tick.angle, radius - tickHalf, cx, cy)
        const outer = pointOnRing(tick.angle, radius + tickHalf, cx, cy)
        const labelPt = pointOnRing(tick.angle, radius + labelOffset, cx, cy)
        return (
          <g key={tick.angle}>
            <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} className="mod-q-ring__tick" />
            {tickLabels && !anchorAngles.has(tick.angle) && (
              <text x={labelPt.x} y={labelPt.y} className="mod-q-ring__tick-label">{tick.label}</text>
            )}
          </g>
        )
      })}

      {sideTicks.map((tick, i) => {
        const inner = pointOnRing(tick.angle, radius - tickHalf, cx, cy)
        const outer = pointOnRing(tick.angle, radius + tickHalf, cx, cy)
        // labelAngle lets the mark stay at its true position on the circle
        // (e.g. two values a fraction of a degree apart near a wraparound
        // point) while the text next to it is nudged apart for legibility.
        const labelPt = pointOnRing(tick.labelAngle ?? tick.angle, radius + sideTickOffset, cx, cy)
        return (
          <g key={i}>
            <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} className="mod-q-ring__tick" />
            <text x={labelPt.x} y={labelPt.y} className="mod-q-ring__tick-label mod-q-ring__side-tick-label">{tick.label}</text>
          </g>
        )
      })}

      <text x={cx} y={cy} className="mod-q-ring__center-label">
        ℤ<tspan className="mod-q-ring__center-label-sub" dy="4">{centerSub ?? q}</tspan>
      </text>

      {anchors.map(anchor => {
        const dot = pointOnRing(anchor.angle, radius, cx, cy)
        const labelPt = pointOnRing(anchor.angle, radius + labelOffset, cx, cy)
        return (
          <g key={anchor.angle} style={{ '--anchor-color': `var(--color-${anchor.colorToken})` }}>
            <circle cx={dot.x} cy={dot.y} r={compact ? 3 : 5} className="mod-q-ring__anchor-dot" />
            <text x={labelPt.x} y={labelPt.y} className="mod-q-ring__anchor-label">{anchor.label}</text>
          </g>
        )
      })}

      {dots.map(dot => {
        const colorToken = dot.highlighted ? 'encoded-message' : 'text'

        if (arrowPoles) {
          // A whole half of the ring rounds to this value -- two arrows
          // sweep in from either side and converge on the label, all sitting
          // inside the circle line, within that half's tinted region,
          // instead of one marker sitting at a single point on the boundary.
          const poleRadius = radius - poleInset
          const labelPt = pointOnRing(dot.angle, poleRadius, cx, cy)
          const arrowSize = compact ? 5 : 8
          return (
            <g key={dot.label} style={{ '--anchor-color': `var(--color-${colorToken})` }}>
              {[1, -1].map(sign => {
                const from = dot.angle - sign * ARROW_SPAN
                const to = dot.angle - sign * ARROW_GAP
                const direction = to > from ? 1 : -1
                return (
                  <g key={sign}>
                    <path d={arcArrowPath(from, to, poleRadius, cx, cy)} className="mod-q-ring__pole-arrow" />
                    <polygon
                      points={arrowHeadPoints(to, poleRadius, cx, cy, direction, arrowSize)}
                      className="mod-q-ring__pole-arrowhead"
                    />
                  </g>
                )
              })}
              <text x={labelPt.x} y={labelPt.y} className="mod-q-ring__anchor-label">{dot.label}</text>
            </g>
          )
        }

        const pt = pointOnRing(dot.angle, radius, cx, cy)
        const labelPt = pointOnRing(dot.angle, radius - dotLabelInset, cx, cy)
        const outerLabel = outerLabels[dot.index]
        const outerPt = outerLabel !== undefined ? pointOnRing(dot.angle, radius + outerLabelOffset, cx, cy) : null
        return (
          <g key={dot.label} style={{ '--anchor-color': `var(--color-${colorToken})` }}>
            <circle cx={pt.x} cy={pt.y} r={compact ? 2.5 : 4} className="mod-q-ring__anchor-dot" />
            <text x={labelPt.x} y={labelPt.y} className="mod-q-ring__anchor-label">{dot.label}</text>
            {outerLabel !== undefined && (
              <text
                x={outerPt.x}
                y={outerPt.y}
                className={`mod-q-ring__outer-label${dot.highlighted ? ' mod-q-ring__outer-label--active' : ''}`}
              >
                {outerLabel}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export default ModQRing
