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
// (e.g. "2du" instead of "3329").
function ModQRing({
  q,
  size = 220,
  anchors = [],
  regions = [],
  compact = false,
  tickLabels = true,
  dotCount = 0,
  highlightDot = -1,
  centerSub,
}) {
  const cx = size / 2
  const cy = size / 2
  const borderReserve = compact ? 10 : 36
  const tickHalf = compact ? 3 : 6
  const labelOffset = compact ? 8 : 22
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
        const pt = pointOnRing(dot.angle, radius, cx, cy)
        const labelPt = pointOnRing(dot.angle, radius + labelOffset, cx, cy)
        const colorToken = dot.highlighted ? 'encoded-message' : 'transform'
        return (
          <g key={dot.label} style={{ '--anchor-color': `var(--color-${colorToken})` }}>
            <circle cx={pt.x} cy={pt.y} r={compact ? 2.5 : 4} className="mod-q-ring__anchor-dot" />
            <text x={labelPt.x} y={labelPt.y} className="mod-q-ring__anchor-label">{dot.label}</text>
          </g>
        )
      })}
    </svg>
  )
}

export default ModQRing
